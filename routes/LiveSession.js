const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  createLiveSession,
  getCourseLiveSessions,
  getLiveSession,
  updateSessionStatus,
  enrollInSession,
  unenrollFromSession,
  deleteLiveSession,
  getUpcomingSessions
} = require('../controllers/LiveSession');
const { verifyWebhookSignature, handleZoomWebhook } = require('../controllers/ZoomWebhook');

// Protected routes (require authentication)
router.use(auth);

// Create a new live session (instructor only)
router.post('/create', createLiveSession);

// Get all live sessions for a course
router.get('/course/:courseId', getCourseLiveSessions);

// Get a specific live session
router.get('/:sessionId', getLiveSession);

// Update session status (instructor only)
router.patch('/:sessionId/status', updateSessionStatus);

// Enroll in a live session
router.post('/:sessionId/enroll', enrollInSession);

// Unenroll from a live session
router.post('/:sessionId/unenroll', unenrollFromSession);

// Delete a live session (instructor only)
router.delete('/:sessionId', deleteLiveSession);

// Get upcoming sessions for user
router.get('/upcoming/all', getUpcomingSessions);

// Zoom webhook (no auth required)
router.post('/webhook', verifyWebhookSignature, handleZoomWebhook);

module.exports = router; 