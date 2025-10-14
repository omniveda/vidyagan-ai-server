const MCQ = require("../models/MCQ");
const Course = require("../models/Course");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");

// Create a new MCQ
exports.createMCQ = async (req, res) => {
  try {
    const { question, options, correctAnswer, courseId, subsectionId } = req.body;
    const instructorId = req.user.id;

    // Validate required fields
    if (!question || !options || !Array.isArray(options) || options.length < 2 ||
        correctAnswer === undefined || !courseId || !subsectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: question, options (min 2), correctAnswer, courseId, subsectionId"
      });
    }

    // Validate correct answer index
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({
        success: false,
        message: "Correct answer index must be within options range"
      });
    }

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to add MCQs to this course"
      });
    }

    // Create the MCQ
    const newMCQ = await MCQ.create({
      question,
      options,
      correctAnswer,
      courseId,
      subsectionId,
      instructor: instructorId
    });

    res.status(201).json({
      success: true,
      message: "MCQ created successfully",
      data: newMCQ
    });

  } catch (error) {
    console.error("Error creating MCQ:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create MCQ",
      error: error.message
    });
  }
};

// Get all MCQs for a course or subsection (for instructors)
exports.getMCQsByCourse = async (req, res) => {
  try {
    const { courseId, subsectionId } = req.params;
    const instructorId = req.user.id;

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view MCQs for this course"
      });
    }

    // Build query based on whether subsectionId is provided
    const query = { courseId };
    if (subsectionId) {
      query.subsectionId = subsectionId;
    }

    const mcqs = await MCQ.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: mcqs
    });

  } catch (error) {
    console.error("Error fetching MCQs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch MCQs",
      error: error.message
    });
  }
};

exports.getMCQsForStudent = async (req, res) => {
  try {
    const { courseId, subsectionId } = req.params;
    const studentId = req.user.id;

    // Check if student is enrolled in the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const isEnrolled = course.studentsEnrolled.some(
      student => student.toString() === studentId
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in the course to access MCQs"
      });
    }

    // Build query based on whether subsectionId is provided
    const query = { courseId };
    if (subsectionId) {
      query.subsectionId = subsectionId;
    }

    // Return MCQs without correct answers for students
    const mcqs = await MCQ.find(query)
      .select('-correctAnswer')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: mcqs
    });

  } catch (error) {
    console.error("Error fetching MCQs for student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch MCQs",
      error: error.message
    });
  }
};

// Update an MCQ
exports.updateMCQ = async (req, res) => {
  try {
    const { mcqId } = req.params;
    const { question, options, correctAnswer } = req.body;
    const instructorId = req.user.id;

    // Find the MCQ
    const mcq = await MCQ.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: "MCQ not found"
      });
    }

    // Check if user is the instructor of the course
    if (mcq.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this MCQ"
      });
    }

    // Validate correct answer if options are provided
    if (options && Array.isArray(options) && correctAnswer !== undefined) {
      if (correctAnswer < 0 || correctAnswer >= options.length) {
        return res.status(400).json({
          success: false,
          message: "Correct answer index must be within options range"
        });
      }
    }

    // Update fields
    if (question) mcq.question = question;
    if (options) mcq.options = options;
    if (correctAnswer !== undefined) mcq.correctAnswer = correctAnswer;

    await mcq.save();

    res.status(200).json({
      success: true,
      message: "MCQ updated successfully",
      data: mcq
    });

  } catch (error) {
    console.error("Error updating MCQ:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update MCQ",
      error: error.message
    });
  }
};

// Delete an MCQ
exports.deleteMCQ = async (req, res) => {
  try {
    const { mcqId } = req.params;
    const instructorId = req.user.id;

    // Find the MCQ
    const mcq = await MCQ.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: "MCQ not found"
      });
    }

    // Check if user is the instructor of the course
    if (mcq.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this MCQ"
      });
    }

    await MCQ.findByIdAndDelete(mcqId);

    res.status(200).json({
      success: true,
      message: "MCQ deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting MCQ:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete MCQ",
      error: error.message
    });
  }
};

// Validate student answers and calculate score
exports.validateAnswers = async (req, res) => {
  try {
    const { courseId, subsectionId } = req.params;
    const { answers } = req.body;
    const studentId = req.user.id;

    // Check if student is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const isEnrolled = course.studentsEnrolled.some(
      student => student.toString() === studentId
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in the course to take the quiz"
      });
    }

    // Build query based on whether subsectionId is provided
    const query = { courseId };
    if (subsectionId) {
      query.subsectionId = subsectionId;
    }

    // Get all MCQs for the course or subsection with correct answers
    const mcqs = await MCQ.find(query);

    // Calculate score
    let score = 0;
    const results = [];

    mcqs.forEach(mcq => {
      const studentAnswer = answers[mcq._id.toString()];
      const isCorrect = studentAnswer === mcq.correctAnswer;

      if (isCorrect) {
        score++;
      }

      results.push({
        questionId: mcq._id,
        question: mcq.question,
        options: mcq.options,
        studentAnswer,
        correctAnswer: mcq.correctAnswer,
        isCorrect
      });
    });

    res.status(200).json({
      success: true,
      data: {
        totalQuestions: mcqs.length,
        score,
        percentage: mcqs.length > 0 ? ((score / mcqs.length) * 100).toFixed(2) : 0,
        results
      }
    });

  } catch (error) {
    console.error("Error validating answers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate answers",
      error: error.message
    });
  }
};
