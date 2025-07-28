// // routes/admin.js
// const express = require("express");
// const router = express.Router();
// const { authenticateJWT, verifyAdmin } = require("../middlewares/auth");
// const AdminController = require("../controllers/AdminController");

// router.get("/dashboard-stats", authenticateJWT, verifyAdmin, AdminController.getDashboardStats);

// module.exports = router;

const express = require("express");
const { getAdminAnalytics } = require("../controllers/AdminController.js");
const { auth, isAdmin } = require("../middlewares/auth.js");

const {
  getAllStudents,
  getAllInstructors,
} = require("../controllers/AdminController.js");

const router = express.Router();

// Ensure only admin can access this route
router.get("/analytics", auth, isAdmin, getAdminAnalytics);

router.get("/students", auth, isAdmin, getAllStudents); // Route for fetching students
router.get("/instructors", auth, isAdmin, getAllInstructors); // Route for fetching instructors

module.exports = router;
