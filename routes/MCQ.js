const express = require("express");
const router = express.Router();

// Import MCQ Controllers
const {
  createMCQ,
  getMCQsByCourse,
  getMCQsForStudent,
  updateMCQ,
  deleteMCQ,
  validateAnswers
} = require("../controllers/MCQController");

// Import Middlewares
const {
  auth,
  isInstructor,
  isStudent
} = require("../middlewares/auth");

// ********************************************************************************************************
//                                      MCQ routes
// ********************************************************************************************************

// Create MCQ - Instructor only
router.post("/create", auth, isInstructor, createMCQ);

// Get MCQs for a course - Instructor only
router.get("/course/:courseId", auth, isInstructor, getMCQsByCourse);

// Get MCQs for enrolled students
router.get("/student/course/:courseId", auth, isStudent, getMCQsForStudent);

// Update MCQ - Instructor only
router.put("/:mcqId", auth, isInstructor, updateMCQ);

// Delete MCQ - Instructor only
router.delete("/:mcqId", auth, isInstructor, deleteMCQ);

// Validate student answers and calculate score
router.post("/validate", auth, isStudent, validateAnswers);

module.exports = router;
