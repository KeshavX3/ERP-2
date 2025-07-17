const express = require('express');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Test endpoint for debugging
router.get('/test', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Upload route is working',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Upload single image
router.post('/image', authenticateToken, (req, res) => {
  console.log('Upload route hit - User:', req.user?.id);
  console.log('Request headers:', req.headers);
  
  upload.single('image')(req, res, (err) => {
    console.log('Multer middleware executed');
    console.log('Error:', err);
    console.log('File:', req.file);
    
    try {
      if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false,
            message: 'File size too large. Maximum size is 5MB.' 
          });
        }
        if (err.message.includes('Only image files are allowed')) {
          return res.status(400).json({ 
            success: false,
            message: 'Only image files are allowed (JPEG, PNG, GIF, WebP).' 
          });
        }
        return res.status(400).json({ 
          success: false,
          message: err.message || 'Upload failed' 
        });
      }

      if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({ 
          success: false,
          message: 'No file uploaded' 
        });
      }

      console.log('File uploaded successfully:', req.file);

      // Return the file path relative to the uploads directory
      const imagePath = `/uploads/${req.file.filename}`;
      
      const responseData = {
        success: true,
        message: 'Image uploaded successfully',
        imagePath: imagePath,
        filename: req.file.filename
      };
      
      console.log('Sending response:', responseData);
      res.json(responseData);
      
    } catch (error) {
      console.error('Upload catch error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to upload image: ' + error.message 
      });
    }
  });
});

// Upload multiple images
router.post('/images', authenticateToken, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    
    res.json({
      message: 'Images uploaded successfully',
      imagePaths: imagePaths,
      count: req.files.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

module.exports = router;
