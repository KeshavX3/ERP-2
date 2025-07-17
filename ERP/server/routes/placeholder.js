const express = require('express');
const path = require('path');

const router = express.Router();

// Serve a simple SVG placeholder
router.get('/placeholder/:width/:height', (req, res) => {
  const { width = 400, height = 300 } = req.params;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#dee2e6" stroke-width="2"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6c757d" text-anchor="middle" dy=".3em">
        No Image
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

module.exports = router;
