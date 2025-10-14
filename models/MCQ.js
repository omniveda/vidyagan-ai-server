const mongoose = require("mongoose");

// Define the MCQ schema
const mcqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number, // Index of the correct option (0-based)
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return value < this.options.length;
      },
      message: 'Correct answer index must be within options range'
    }
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  subsectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubSection",
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
mcqSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export the MCQ model
module.exports = mongoose.model("MCQ", mcqSchema);
