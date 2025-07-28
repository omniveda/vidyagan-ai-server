const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure each page name is unique
  },
  content: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Page", pageSchema);
