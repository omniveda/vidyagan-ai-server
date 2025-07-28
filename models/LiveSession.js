const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sessionTitle: {
    type: String,
    required: true,
    trim: true
  },
  sessionDescription: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  zoomMeetingId: {
    type: String,
    required: true,
    unique: true
  },
  zoomJoinUrl: {
    type: String,
    required: true
  },
  zoomPassword: {
    type: String,
    default: ''
  },
  zoomStartUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  recordingUrl: {
    type: String,
    default: null
  },
  recordingPassword: {
    type: String,
    default: null
  },
  recordingAvailable: {
    type: Boolean,
    default: false
  },
  recordingExpiryDate: {
    type: Date,
    default: null
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // <-- lowercase
    required: true
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user' // <-- lowercase
  }],
  maxParticipants: {
    type: Number,
    default: 100
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none',
  },
  recurringEndDate: {
    type: Date,
    default: null
  },
  settings: {
    autoRecord: {
      type: Boolean,
      default: true
    },
    cloudRecording: {
      type: Boolean,
      default: true
    },
    waitingRoom: {
      type: Boolean,
      default: true
    },
    muteOnEntry: {
      type: Boolean,
      default: true
    },
    allowJoinBeforeHost: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
liveSessionSchema.index({ courseId: 1, startTime: 1 });
liveSessionSchema.index({ status: 1, startTime: 1 });
liveSessionSchema.index({ zoomMeetingId: 1 });

// Virtual for checking if session is live
liveSessionSchema.virtual('isLive').get(function() {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now && this.status === 'live';
});

// Virtual for checking if session is upcoming
liveSessionSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.startTime > now && this.status === 'scheduled';
});

// Virtual for checking if session is past
liveSessionSchema.virtual('isPast').get(function() {
  const now = new Date();
  return this.endTime < now;
});

// Method to check if user is enrolled
liveSessionSchema.methods.isUserEnrolled = function(userId) {
  return this.enrolledStudents.includes(userId);
};

// Method to add enrolled student
liveSessionSchema.methods.addEnrolledStudent = function(userId) {
  if (!this.enrolledStudents.includes(userId)) {
    this.enrolledStudents.push(userId);
  }
  return this.save();
};

// Method to remove enrolled student
liveSessionSchema.methods.removeEnrolledStudent = function(userId) {
  this.enrolledStudents = this.enrolledStudents.filter(id => id.toString() !== userId.toString());
  return this.save();
};

module.exports = mongoose.model('LiveSession', liveSessionSchema); 