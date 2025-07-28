const PDFDocument = require('pdfkit');
const Course = require('../models/Course');
const User = require('../models/User');
const CourseProgress = require('../models/CourseProgress');
const RatingAndReview = require("../models/RatingAndRaview");

exports.downloadCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Fetch user and course
    const user = await User.findById(userId);
    const course = await Course.findById(courseId)
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection'
        }
      });
    if (!user || !course) {
      return res.status(404).json({ success: false, message: 'User or Course not found' });
    }

    // Check course progress
    const progress = await CourseProgress.findOne({ userId, courseID: courseId });
    if (!progress) {
      return res.status(403).json({ success: false, message: 'No progress found for this course' });
    }
    const totalLectures = course.courseContent.reduce((acc, section) => acc + section.subSection.length, 0);
    if (totalLectures === 0 || progress.completedVideos.length !== totalLectures) {
      return res.status(403).json({ success: false, message: 'Course not fully completed' });
    }

    // Check if user has reviewed the course
    const hasReviewed = await RatingAndReview.findOne({ user: userId, course: courseId });
    if (!hasReviewed) {
      return res.status(403).json({ success: false, message: 'Please submit a review before downloading your certificate.' });
    }

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${courseId}.pdf"`);
    doc.pipe(res);

    // Certificate design (simple)
    doc
      .fontSize(24)
      .text('Certificate of Completion', { align: 'center', underline: true })
      .moveDown(2);
    doc
      .fontSize(16)
      .text(`This is to certify that`, { align: 'center' })
      .moveDown(1);
    doc
      .fontSize(18)
      .text(`${user.firstName} ${user.lastName}`, { align: 'center', bold: true })
      .moveDown(1);
    doc
      .fontSize(16)
      .text(`has successfully completed the course`, { align: 'center' })
      .moveDown(1);
    doc
      .fontSize(18)
      .text(`${course.courseName}`, { align: 'center', bold: true })
      .moveDown(2);
    doc
      .fontSize(16)
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' })
      .moveDown(1);
    doc
      .fontSize(16)
      .text('SecCouncil', { align: 'center' });
    doc.end();
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate certificate', error: error.message });
  }
}; 