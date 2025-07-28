const LiveSession = require('../models/LiveSession');
const crypto = require('crypto');

// Verify Zoom webhook signature
const verifyWebhookSignature = (req, res, next) => {
  try {
    const signature = req.headers['x-zoom-signature'];
    const timestamp = req.headers['x-zoom-signature-timestamp'];
    const body = JSON.stringify(req.body);
    
    const message = `v0:${timestamp}:${body}`;
    const expectedSignature = `v0=${crypto
      .createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET)
      .update(message)
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    res.status(401).json({ error: 'Invalid signature' });
  }
};

// Handle recording completed event
const handleRecordingCompleted = async (req, res) => {
  try {
    const { payload } = req.body;
    const { object } = payload;

    if (object.event_type !== 'recording.completed') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const meetingId = object.id;
    const recordingFiles = object.recording_files || [];

    // Find the live session by Zoom meeting ID
    const liveSession = await LiveSession.findOne({ zoomMeetingId: meetingId.toString() });
    
    if (!liveSession) {
      console.log(`No live session found for Zoom meeting ID: ${meetingId}`);
      return res.status(200).json({ message: 'Live session not found' });
    }

    // Find the MP4 recording file
    const mp4Recording = recordingFiles.find(file => file.file_type === 'MP4');
    
    if (mp4Recording) {
      // Update live session with recording URL
      liveSession.recordingUrl = mp4Recording.download_url;
      liveSession.recordingPassword = mp4Recording.password || null;
      liveSession.recordingAvailable = true;
      liveSession.recordingExpiryDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      liveSession.status = 'completed';
      
      await liveSession.save();
      
      console.log(`Recording URL updated for session: ${liveSession._id}`);
    }

    res.status(200).json({ message: 'Recording processed successfully' });

  } catch (error) {
    console.error('Error processing recording completed event:', error);
    res.status(500).json({ error: 'Failed to process recording event' });
  }
};

// Handle meeting ended event
const handleMeetingEnded = async (req, res) => {
  try {
    const { payload } = req.body;
    const { object } = payload;

    if (object.event_type !== 'meeting.ended') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const meetingId = object.id;

    // Find and update the live session
    const liveSession = await LiveSession.findOne({ zoomMeetingId: meetingId.toString() });
    
    if (liveSession) {
      liveSession.status = 'completed';
      await liveSession.save();
      
      console.log(`Meeting ended for session: ${liveSession._id}`);
    }

    res.status(200).json({ message: 'Meeting ended processed successfully' });

  } catch (error) {
    console.error('Error processing meeting ended event:', error);
    res.status(500).json({ error: 'Failed to process meeting ended event' });
  }
};

// Handle meeting started event
const handleMeetingStarted = async (req, res) => {
  try {
    const { payload } = req.body;
    const { object } = payload;

    if (object.event_type !== 'meeting.started') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const meetingId = object.id;

    // Find and update the live session
    const liveSession = await LiveSession.findOne({ zoomMeetingId: meetingId.toString() });
    
    if (liveSession) {
      liveSession.status = 'live';
      await liveSession.save();
      
      console.log(`Meeting started for session: ${liveSession._id}`);
    }

    res.status(200).json({ message: 'Meeting started processed successfully' });

  } catch (error) {
    console.error('Error processing meeting started event:', error);
    res.status(500).json({ error: 'Failed to process meeting started event' });
  }
};

// Main webhook handler
const handleZoomWebhook = async (req, res) => {
  try {
    const { event } = req.body;

    switch (event) {
      case 'recording.completed':
        return await handleRecordingCompleted(req, res);
      case 'meeting.ended':
        return await handleMeetingEnded(req, res);
      case 'meeting.started':
        return await handleMeetingStarted(req, res);
      default:
        console.log(`Unhandled Zoom event: ${event}`);
        return res.status(200).json({ message: 'Event ignored' });
    }

  } catch (error) {
    console.error('Error handling Zoom webhook:', error);
    res.status(500).json({ error: 'Failed to handle webhook' });
  }
};

module.exports = {
  verifyWebhookSignature,
  handleZoomWebhook
}; 