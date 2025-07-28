const express = require("express");
const {
  getPageContent,
  updatePageContent,
} = require("../controllers/PageController");

const router = express.Router();

// Fetch page content (public access)
router.get("/:pageName", getPageContent);

// Update page content (no auth or admin check)
router.put("/:pageName", updatePageContent); // Ensure no middleware is applied here

module.exports = router;
