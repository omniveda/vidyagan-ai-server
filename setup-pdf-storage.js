#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📚 PDF Storage Setup for Vidyagan AI');
console.log('=====================================\n');

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
} else {
    console.log('✅ Uploads directory already exists');
}

// Create course-ebooks directory
const courseEbooksDir = path.join(uploadsDir, 'course-ebooks');
if (!fs.existsSync(courseEbooksDir)) {
    fs.mkdirSync(courseEbooksDir, { recursive: true });
    console.log('✅ Created course-ebooks directory');
} else {
    console.log('✅ Course ebooks directory already exists');
}

console.log('\n📋 PDF Storage Configuration:');
console.log('✅ PDFs will be stored on your server VM');
console.log('✅ No external dependencies');
console.log('✅ Full control over files');
console.log('✅ No serving limitations');

console.log('\n📁 PDF files will be stored in:');
console.log(`   ${courseEbooksDir}`);

console.log('\n🚀 Your PDF storage is ready!');
console.log('   - Local storage is configured and ready to use');
console.log('   - PDFs will be served from /uploads/course-ebooks/filename.pdf');
console.log('   - Maximum file size: 10MB');
console.log('   - Supported format: PDF only');
console.log('   - Files are cached for 1 year for better performance');

console.log('\n💡 Usage in your code:');
console.log('   const { uploadPdfToLocal } = require("./utils/pdfUploader");');
console.log('   const result = await uploadPdfToLocal(file, "course-ebooks");');
console.log('   // PDF will be available at: result.secure_url');

console.log('\n🔒 Security Features:');
console.log('   - Only enrolled students can access course PDFs');
console.log('   - PDFs are served with proper headers');
console.log('   - File validation on upload'); 