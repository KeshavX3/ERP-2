import React, { useState, useRef } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import uploadService from '../services/uploadService';
import ImageWithFallback from './ImageWithFallback';

const FileUpload = ({ 
  onFileUpload, 
  currentImage, 
  label = "Upload Image", 
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  preview = true,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (file) => {
    if (!validateFile(file)) return;

    setUploading(true);
    
    try {
      // Create preview URL immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload file
      const response = await uploadService.uploadImage(file);
      
      if (response.success) {
        const imagePath = response.imagePath;
        setPreviewUrl(imagePath);
        onFileUpload(imagePath);
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      setPreviewUrl(currentImage || ''); // Reset to original
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onFileUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`file-upload-container ${className}`}>
      <Form.Label>{label}</Form.Label>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Upload area */}
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        style={{
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragOver ? '#f8f9fa' : '#fff',
          borderColor: dragOver ? '#007bff' : '#ddd',
          transition: 'all 0.3s ease',
          marginBottom: '15px'
        }}
      >
        {uploading ? (
          <div>
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Uploading...</span>
          </div>
        ) : (
          <div>
            <i className="fas fa-cloud-upload-alt fs-3 text-muted mb-2 d-block"></i>
            <p className="mb-2">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <small className="text-muted">
              JPG, PNG, GIF, WebP up to {Math.round(maxSize / 1024 / 1024)}MB
            </small>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && previewUrl && (
        <div className="image-preview mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label fw-bold mb-0">Preview:</label>
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={handleRemove}
              disabled={uploading}
            >
              <i className="fas fa-times"></i> Remove
            </Button>
          </div>
          <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
            <ImageWithFallback
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: '200px',
                maxHeight: '150px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>
      )}

      {/* Alternative URL input */}
      <div className="mt-3">
        <Form.Text className="text-muted">
          Or paste an image URL:
        </Form.Text>
        <Form.Control
          type="url"
          placeholder="https://example.com/image.jpg"
          onChange={(e) => {
            const url = e.target.value;
            if (url) {
              setPreviewUrl(url);
              onFileUpload(url);
            }
          }}
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default FileUpload;
