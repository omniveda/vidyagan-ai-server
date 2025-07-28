const Page = require("../models/Page");

exports.getPageContent = async (req, res) => {
  try {
    const { pageName } = req.params;
    const formattedPageName = pageName.replace(/-/g, " "); // Replace hyphens with spaces
    const page = await Page.findOne({ name: formattedPageName });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Page content fetched successfully",
      data: {
        content: page.content,
      },
    });
  } catch (error) {
    console.error("Error fetching page content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch page content",
      error: error.message,
    });
  }
};

exports.updatePageContent = async (req, res) => {
  try {
    const { pageName } = req.params;
    const { content } = req.body;
    const formattedPageName = pageName.replace(/-/g, " "); // Replace hyphens with spaces

    // Update or create the page
    const updatedPage = await Page.findOneAndUpdate(
      { name: formattedPageName },
      { content },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Page content updated successfully",
      data: updatedPage,
    });
  } catch (error) {
    console.error("Error updating page content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update page content",
      error: error.message,
    });
  }
};
