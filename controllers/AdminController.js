// Import models
const User = require("../models/User");
const Course = require("../models/Course");
const Payment = require("../models/Payment"); // Assuming you have a payment model

// exports.getAdminAnalytics = async (req, res) => {
//   try {
//     // Fetch the counts
//     const instructorCount = await User.countDocuments({ accountType: "Instructor" });
//     const studentCount = await User.countDocuments({ accountType: "Student" });
//     const courseCount = await Course.countDocuments();
//     const paymentCount = await Payment.countDocuments({ status: "Success" }); // Add status field in Payment schema if not present
//     const failedPaymentCount = await Payment.countDocuments({ status: "Failed" });

//     // Return the data
//     res.status(200).json({
//       success: true,
//       data: {
//         instructors: instructorCount,
//         students: studentCount,
//         courses: courseCount,
//         payments: paymentCount,
//         failedPayments: failedPaymentCount,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };



exports.getAdminAnalytics = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ accountType: "Student" });
    const enrolledStudents = await Payment.countDocuments({ status: "Success" }); // Or another logic
    const activeStudents = studentCount; // Replace with actual logic for active students if applicable

    res.status(200).json({
      success: true,
      data: {
        totalStudents: studentCount,
        studentsEnrolled: enrolledStudents,
        activeStudents: activeStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ success: false, message: "Error fetching analytics" });
  }
};




exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ accountType: "Student" })
      .select("firstName lastName email courses")
      .populate({
        path: "courses", // Populate courses
        select: "courseName instructor", // Select course name and instructor
        populate: {
          path: "instructor", // Populate instructor details
          select: "firstName lastName",
        },
      });

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, message: "Error fetching students" });
  }
};


exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ accountType: "Instructor" })
      .select("firstName lastName email courses")
      .populate({
        path: "courses", // Populate courses taught by the instructor
        select: "courseName",
      });

    res.status(200).json({ success: true, instructors });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching instructors",
    });
  }
};
