const fs = require('fs')
const path = require('path')

// Local PDF storage function
exports.uploadPdfToLocal = async (file, folder) => {
    console.log("Uploading PDF to local storage:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.mimetype,
        folder: folder
    });

    // Validate file is actually a PDF
    if (!file.mimetype.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('File must be a PDF');
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('PDF file size must be less than 10MB');
    }

    try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../../uploads');
        const folderDir = path.join(uploadsDir, folder);
        
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        if (!fs.existsSync(folderDir)) {
            fs.mkdirSync(folderDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${folder}_${timestamp}_${sanitizedName}`;
        const filePath = path.join(folderDir, fileName);

        // Copy file to destination
        fs.copyFileSync(file.tempFilePath, filePath);

        // Generate public URL
        const publicUrl = `/uploads/${folder}/${fileName}`;

        console.log("PDF upload successful:", {
            local_path: filePath,
            public_url: publicUrl,
            file_name: fileName,
            file_size: file.size
        });

        return {
            secure_url: publicUrl,
            public_id: fileName,
            local_path: filePath,
            bytes: file.size,
            format: 'pdf',
            resource_type: 'pdf'
        };
    } catch (error) {
        console.error("PDF upload failed:", error);
        throw error;
    }
}

// Function to serve PDF files with authentication
exports.servePdf = (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', folder, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'PDF not found' });
    }

    // Set proper headers for PDF serving
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=' + filename);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
} 