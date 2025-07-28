const LiveSession = require('../models/LiveSession');
const Course = require('../models/Course');
const { zoomAPI } = require('../config/zoom');
const apiResponse = require('../utils/apiResponse');

// Create a new live session
const createLiveSession = async (req, res) => {
  try {
    const {
      courseId,
      sessionTitle,
      sessionDescription,
      startTime,
      duration,
      maxParticipants,
      settings
    } = req.body;

    const instructorId = req.user.id;

    // Validate course exists and user is instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json(apiResponse(false, 'Course not found'));
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json(apiResponse(false, 'Only course instructor can create live sessions'));
    }

    // Calculate end time
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    // Create Zoom meeting
    const zoomMeetingData = {
      topic: sessionTitle,
      type: 2, // Scheduled meeting
      start_time: new Date(startTime).toISOString().replace(/\.\d{3}Z$/, 'Z'),
      duration: duration,
      timezone: 'Asia/Kolkata',
      password: Math.random().toString(36).substring(2, 8),
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: settings?.allowJoinBeforeHost || false,
        mute_upon_entry: settings?.muteOnEntry || true,
        waiting_room: settings?.waitingRoom || true,
        auto_recording: settings?.autoRecord ? 'cloud' : 'none',
        alternative_hosts: '',
        meeting_authentication: false
      }
    };

    const zoomMeeting = await zoomAPI.createMeeting(zoomMeetingData);

    // Create live session in database
    const liveSession = new LiveSession({
      courseId,
      sessionTitle,
      sessionDescription,
      startTime,
      endTime,
      duration,
      zoomMeetingId: zoomMeeting.id,
      zoomJoinUrl: zoomMeeting.join_url,
      zoomPassword: zoomMeeting.password,
      zoomStartUrl: zoomMeeting.start_url,
      instructorId,
      maxParticipants,
      settings
    });

    await liveSession.save();

    res.status(201).json(apiResponse(true, 'Live session created successfully', liveSession));

  } catch (error) {
    console.error('Error creating live session:', error);
    res.status(500).json(apiResponse(false, 'Failed to create live session', null, error.message));
  }
};

// Get all live sessions for a course
const getCourseLiveSessions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user is enrolled in the course or is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json(apiResponse(false, 'Course not found'));
    }

    const isEnrolled = course.studentsEnrolled.includes(userId);
    const isInstructor = course.instructor.toString() === userId;

    if (!isEnrolled && !isInstructor) {
      return res.status(403).json(apiResponse(false, 'Access denied. Please enroll in the course first'));
    }

    // Fetch all live sessions for the course
    const liveSessions = await LiveSession.find({ courseId })
      .populate('instructorId', 'firstName lastName email')
      .sort({ startTime: 1 });

    // Map sessions to include only necessary info for students
    const sessionList = liveSessions.map(session => ({
      _id: session._id,
      sessionTitle: session.sessionTitle,
      sessionDescription: session.sessionDescription,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      zoomJoinUrl: session.zoomJoinUrl,
      status: session.status,
      instructor: session.instructorId,
      maxParticipants: session.maxParticipants,
      currentParticipants: session.currentParticipants,
      isRecurring: session.isRecurring,
      recurringPattern: session.recurringPattern,
      recordingUrl: session.recordingUrl,
      recordingAvailable: session.recordingAvailable
    }));

    res.status(200).json(apiResponse(true, 'Live sessions retrieved successfully', sessionList));

  } catch (error) {
    console.error('Error getting live sessions:', error);
    res.status(500).json(apiResponse(false, 'Failed to get live sessions', null, error.message));
  }
};

// Get a specific live session
const getLiveSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const liveSession = await LiveSession.findById(sessionId)
      .populate('courseId', 'courseName')
      .populate('instructorId', 'firstName lastName email');

    if (!liveSession) {
      return res.status(404).json(apiResponse(false, 'Live session not found'));
    }

    // Check if user has access
    const isEnrolled = liveSession.enrolledStudents.includes(userId);
    const isInstructor = liveSession.instructorId._id.toString() === userId;

    if (!isEnrolled && !isInstructor) {
      return res.status(403).json(apiResponse(false, 'Access denied. Please enroll in the course first'));
    }

    res.status(200).json(apiResponse(true, 'Live session retrieved successfully', liveSession));

  } catch (error) {
    console.error('Error getting live session:', error);
    res.status(500).json(apiResponse(false, 'Failed to get live session', null, error.message));
  }
};

// Update live session status
const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const liveSession = await LiveSession.findById(sessionId);
    if (!liveSession) {
      return res.status(404).json(apiResponse(false, 'Live session not found'));
    }

    // Only instructor can update status
    if (liveSession.instructorId.toString() !== userId) {
      return res.status(403).json(apiResponse(false, 'Only instructor can update session status'));
    }

    liveSession.status = status;
    await liveSession.save();

    res.status(200).json(apiResponse(true, 'Session status updated successfully', liveSession));

  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json(apiResponse(false, 'Failed to update session status', null, error.message));
  }
};

// Enroll user in live session
const enrollInSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const liveSession = await LiveSession.findById(sessionId);
    if (!liveSession) {
      return res.status(404).json(apiResponse(false, 'Live session not found'));
    }

    // Check if user is already enrolled
    if (liveSession.isUserEnrolled(userId)) {
      return res.status(400).json(apiResponse(false, 'User already enrolled in this session'));
    }

    // Check if session is full
    if (liveSession.enrolledStudents.length >= liveSession.maxParticipants) {
      return res.status(400).json(apiResponse(false, 'Session is full'));
    }

    await liveSession.addEnrolledStudent(userId);

    res.status(200).json(apiResponse(true, 'Successfully enrolled in live session'));

  } catch (error) {
    console.error('Error enrolling in session:', error);
    res.status(500).json(apiResponse(false, 'Failed to enroll in session', null, error.message));
  }
};

// Unenroll user from live session
const unenrollFromSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const liveSession = await LiveSession.findById(sessionId);
    if (!liveSession) {
      return res.status(404).json(apiResponse(false, 'Live session not found'));
    }

    await liveSession.removeEnrolledStudent(userId);

    res.status(200).json(apiResponse(true, 'Successfully unenrolled from live session'));

  } catch (error) {
    console.error('Error unenrolling from session:', error);
    res.status(500).json(apiResponse(false, 'Failed to unenroll from session', null, error.message));
  }
};

// Delete live session
const deleteLiveSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const liveSession = await LiveSession.findById(sessionId);
    if (!liveSession) {
      return res.status(404).json(apiResponse(false, 'Live session not found'));
    }

    // Only instructor can delete session
    if (liveSession.instructorId.toString() !== userId) {
      return res.status(403).json(apiResponse(false, 'Only instructor can delete session'));
    }

    // Delete from Zoom if meeting hasn't started
    if (liveSession.status === 'scheduled') {
      try {
        await zoomAPI.deleteMeeting(liveSession.zoomMeetingId);
      } catch (zoomError) {
        console.error('Error deleting Zoom meeting:', zoomError);
      }
    }

    await LiveSession.findByIdAndDelete(sessionId);

    res.status(200).json(apiResponse(true, 'Live session deleted successfully'));

  } catch (error) {
    console.error('Error deleting live session:', error);
    res.status(500).json(apiResponse(false, 'Failed to delete live session', null, error.message));
  }
};

// Get upcoming live sessions for user
const getUpcomingSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get courses where user is enrolled
    const enrolledCourses = await Course.find({
      studentsEnrolled: userId
    }).select('_id');

    const courseIds = enrolledCourses.map(course => course._id);

    const upcomingSessions = await LiveSession.find({
      courseId: { $in: courseIds },
      startTime: { $gt: new Date() },
      status: 'scheduled'
    })
    .populate('courseId', 'courseName')
    .populate('instructorId', 'firstName lastName')
    .sort({ startTime: 1 });

    res.status(200).json(apiResponse(true, 'Upcoming sessions retrieved successfully', upcomingSessions));

  } catch (error) {
    console.error('Error getting upcoming sessions:', error);
    res.status(500).json(apiResponse(false, 'Failed to get upcoming sessions', null, error.message));
  }
};

module.exports = {
  createLiveSession,
  getCourseLiveSessions,
  getLiveSession,
  updateSessionStatus,
  enrollInSession,
  unenrollFromSession,
  deleteLiveSession,
  getUpcomingSessions
}; 