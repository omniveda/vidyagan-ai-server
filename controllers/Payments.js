const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

const Payment = require("../models/Payment");



// Capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {
//   const { courses } = req.body
//   const userId = req.user.id
//   if (courses.length === 0) {
//     return res.json({ success: false, message: "Please Provide Course ID" })
//   }

//   let total_amount = 0

//   for (const course_id of courses) {
//     let course
//     try {
//       // Find the course by its ID
//       course = await Course.findById(course_id)

//       // If the course is not found, return an error
//       if (!course) {
//         return res
//           .status(200)
//           .json({ success: false, message: "Could not find the Course" })
//       }

//       // Check if the user is already enrolled in the course
//       const uid = new mongoose.Types.ObjectId(userId)
//       if (course.studentsEnrolled.includes(uid)) {
//         return res
//           .status(200)
//           .json({ success: false, message: "Student is already Enrolled" })
//       }

//       // Add the price of the course to the total amount
//       total_amount += course.price
//     } catch (error) {
//       console.log(error)
//       return res.status(500).json({ success: false, message: error.message })
//     }
//   }

//   const currency = "INR"
//   const options = {
//     amount: total_amount * 100,
//     currency,
//     receipt: Math.random(Date.now()).toString(),
//   }

//   try {
//     // Initiate the payment using Razorpay
//     const paymentResponse = await instance.orders.create(options)
//     console.log(paymentResponse)
//     res.json({
//       success: true,
//       data: paymentResponse,
//     })
//   } catch (error) {
//     console.log(error)
//     res
//       .status(500)
//       .json({ success: false, message: "Could not initiate order." })
//   }
// }


exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" });
  }

  let total_amount = 0;

  for (const course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);

      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" });
      }

      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" });
      }

      total_amount += course.price;
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const currency = "INR";
  const options = {
    amount: total_amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    const paymentResponse = await instance.orders.create(options);

    // Log payment in the database
    const payment = new Payment({
      userId,
      courses,
      orderId: paymentResponse.id,
      amount: options.amount / 100,
      status: "Pending",
    });
    await payment.save();

    console.log(paymentResponse);
    res.json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." });
  }
};





// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id
 
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")


    
  // if (expectedSignature === razorpay_signature) {
  //   await enrollStudents(courses, userId, res)
  //   return res.status(200).json({ success: true, message: "Payment Verified" })
  // }



  if (expectedSignature === razorpay_signature) {
    try {
      // Update payment status
      const payment = await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { paymentId: razorpay_payment_id, status: "Success", updatedAt: Date.now() },
        { new: true }
      );
  
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }
  
      // Enroll students in courses
      await enrollStudents(courses, userId, res);
      return res.status(200).json({ success: true, message: "Payment Verified", payment });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  

  

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}

// Get user receipts
exports.getUserReceipts = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find all payments for the user (both Success and Pending)
    const payments = await Payment.find({ 
      userId: userId,
      status: { $in: ["Success", "Pending"] }
    }).populate({
      path: "courses",
      select: "courseName price thumbnail instructor",
      populate: {
        path: "instructor",
        select: "firstName lastName"
      }
    }).populate({
      path: "userId",
      select: "firstName lastName email"
    }).sort({ createdAt: -1 });

    if (!payments || payments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No receipts found",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Receipts fetched successfully",
      data: payments
    });

  } catch (error) {
    console.log("Error fetching receipts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching receipts",
      error: error.message
    });
  }
};

// Get specific receipt by payment ID
exports.getReceiptById = async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user.id;

  try {
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: userId,
      status: { $in: ["Success", "Pending"] }
    }).populate({
      path: "courses",
      select: "courseName price thumbnail instructor",
      populate: {
        path: "instructor",
        select: "firstName lastName"
      }
    }).populate({
      path: "userId",
      select: "firstName lastName email"
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Receipt fetched successfully",
      data: payment
    });

  } catch (error) {
    console.log("Error fetching receipt:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching receipt",
      error: error.message
    });
  }
};

// Get all payments (for debugging)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).populate({
      path: "courses",
      select: "courseName price thumbnail instructor",
      populate: {
        path: "instructor",
        select: "firstName lastName"
      }
    }).populate({
      path: "userId",
      select: "firstName lastName email"
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All payments fetched successfully",
      data: payments
    });

  } catch (error) {
    console.log("Error fetching all payments:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message
    });
  }
};











