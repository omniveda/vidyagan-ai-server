// // Import the Mongoose library
// const mongoose = require("mongoose");

// // Define the user schema using the Mongoose Schema constructor
// const userSchema = new mongoose.Schema(
//   {
//     // Define the name field with type String, required, and trimmed
//     firstName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     lastName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     // Define the email field with type String, required, and trimmed
//     email: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Define the password field with type String and required
//     password: {
//       type: String,
//       required: true,
//     },
//     // Define the role field with type String and enum values of "Admin", "Student", or "Visitor"
//     accountType: {
//       type: String,
//       enum: ["Admin", "Student", "Instructor"],
//       required: true,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//     approved: {
//       type: Boolean,
//       default: true,
//     },
//     additionalDetails: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       // type: String,
//       // required: false,
//       ref: "Profile",
//     },
//     courses: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Course",
//       },
//     ],
//     token: {
//       type: String,
//     },
//     resetPasswordExpires: {
//       type: Date,
//     },
//     image: {
//       type: String,
//       //at registration image cannot be uploaded
//       // required: true,
//     },
//     courseProgress: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "courseProgress",
//       },
//     ],
//     contactNumber: {
//       type: String,
//       required: true,
//       trim: true,
//       match: /^\+\d{1,4}\d{7,15}$/, // Validate country code and phone number
//     },

//     // Add timestamps for when the document is created and last modified
//   },
//   { timestamps: true }
// );

// // Export the Mongoose model for the user schema, using the name "user"
// module.exports = mongoose.model("user", userSchema);

// claude notification
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["Admin", "Student", "Instructor"],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: true,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Profile",
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    image: {
      type: String,
    },
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseProgress",
      },
    ],
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^\+\d{1,4}\d{7,15}$/,
    },
    // Add FCM token for push notifications
    fcmToken: {
      type: String,
      default: null,
    },
    // Notification preferences
    notificationPreferences: {
      marketing: {
        type: Boolean,
        default: true,
      },
      courseUpdates: {
        type: Boolean,
        default: true,
      },
      newFeatures: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
