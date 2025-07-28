const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
const {
  sendNotificationToAll,
  sendNotificationToGroup,
  getNotificationHistory,
  registerFcmToken,
} = require("../controllers/notificationController.js");

console.log("sendNotificationToAll:", sendNotificationToAll);
console.log("sendNotificationToGroup:", sendNotificationToGroup);
console.log("getNotificationHistory:", getNotificationHistory);
console.log("registerFcmToken:", registerFcmToken);

const router = express.Router();

// Admin routes - protected with admin middleware
router.post("/send-to-all", auth, isAdmin, sendNotificationToAll);
router.post("/send-to-group", auth, isAdmin, sendNotificationToGroup);
router.get("/history", auth, isAdmin, getNotificationHistory);

// User routes
router.post("/register-token", auth, registerFcmToken);

module.exports = router;
