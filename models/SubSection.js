const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
	title: { type: String },
	timeDuration: { type: String },
	description: { type: String },
	videoUrl: { type: String },
	pdfUrl: { type: String }, // Added field for PDF URL
});

module.exports = mongoose.model("SubSection", SubSectionSchema);
