// Import necessary modules
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const { uploadImageToCloudinary } = require("../utils/imageUploader")


// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { sectionId, title, description } = req.body
    const video = req.files ? req.files.video : undefined
    const pdf = req.files ? req.files.pdf : undefined

    // Check if required fields except video/pdf are provided
    if (!sectionId || !title || !description) {
      return res
        .status(404)
        .json({ success: false, message: "SectionId, title and description are required" })
    }

    let videoUrl = undefined
    let timeDuration = undefined
    if (video) {
      // Upload the video file to Cloudinary
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      videoUrl = uploadDetails.secure_url
      timeDuration = `${uploadDetails.duration}`
    }

    let pdfUrl = undefined
    if (pdf) {
      // Save PDF locally in uploads/course-ebooks/
      const pdfPath = `uploads/course-ebooks/${Date.now()}_${pdf.name}`
      await pdf.mv(pdfPath)
      pdfUrl = `/${pdfPath}`
    }

    // Create a new sub-section with the necessary information
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: videoUrl,
      pdfUrl: pdfUrl,
    })

    // Update the corresponding section with the newly created sub-section
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection")

    // Return the updated section in the response
    return res.status(200).json({ success: true, data: updatedSection })
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating new sub-section:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    if (req.files && req.files.pdf !== undefined) {
      const pdf = req.files.pdf
      // Save PDF locally in uploads/course-ebooks/
      const pdfPath = `uploads/course-ebooks/${Date.now()}_${pdf.name}`
      await pdf.mv(pdfPath)
      subSection.pdfUrl = `/${pdfPath}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}