import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import uploadService from '../services/uploadService';
import ImageWithFallback from './ImageWithFallback';

const ProductForm = ({ show, onHide, product, categories, brands, onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', description: '', image: '', price: '', discount: '', category: '', brand: '', tags: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Debug logging
  console.log('🔍 ProductForm: Props received:', {
    show,
    product: product ? 'Product exists' : 'No product',
    categoriesCount: categories?.length || 0,
    brandsCount: brands?.length || 0
  });

  useEffect(() => {
    console.log('🔍 ProductForm: useEffect triggered', { product, show });
    if (product) {
      console.log('🔍 ProductForm: Setting form data for existing product:', product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        image: product.image || '',
        price: product.price || '',
        discount: product.discount || '',
        category: product.category?._id || '',
        brand: product.brand?._id || '',
        tags: product.tags?.join(', ') || ''
      });
      setImagePreview(product.image || '');
    } else {
      console.log('🔍 ProductForm: Setting form data for new product');
      setFormData({ name: '', description: '', image: '', price: '', discount: '', category: '', brand: '', tags: '' });
      setImagePreview('');
    }
    setErrors({});
  }, [product, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, image: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingImage(true);
    setErrors({ ...errors, image: '' });

    try {
      const response = await uploadService.uploadImage(file);
      if (!response?.imagePath) {
        throw new Error(response?.message || 'Server response missing image path');
      }
      setFormData({ ...formData, image: response.imagePath });
      setImagePreview(response.imagePath);
      setErrors({ ...errors, image: '' });
    } catch (error) {
      let errorMessage = 'Failed to upload image';
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) errorMessage = 'Authentication failed. Please login again.';
        else if (status === 400) errorMessage = data?.message || 'Invalid file or request';
        else if (status === 500) errorMessage = 'Server error. Please try again later.';
        else errorMessage = data?.message || `Server error (${status})`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check if the backend is running on port 5000.';
      } else {
        errorMessage = error.message;
      }
      setErrors({ ...errors, image: errorMessage });
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }

    if (formData.discount && (formData.discount < 0 || formData.discount > 100)) {
      newErrors.discount = 'Discount must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 ProductForm: handleSubmit called');
    console.log('📝 Form data before validation:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      console.log('🚀 ProductForm: Calling onSubmit with data:', submitData);
      await onSubmit(submitData);
      console.log('✅ ProductForm: onSubmit completed successfully');
    } catch (error) {
      console.error('❌ ProductForm: onSubmit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{product ? 'Edit Product' : 'Add Product'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Show loading state if categories or brands haven't loaded */}
        {(!categories || !brands || categories.length === 0 || brands.length === 0) && (
          <div className="alert alert-info">
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Loading categories and brands... 
              <small className="ms-2">
                (Categories: {categories?.length || 0}, Brands: {brands?.length || 0})
              </small>
            </div>
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Product Name *</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} isInvalid={!!errors.name} placeholder="Enter product name" />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Enter product description" />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select name="category" value={formData.category} onChange={handleChange} isInvalid={!!errors.category}>
                  <option value="">Select Category</option>
                  {(categories || []).map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Brand *</Form.Label>
                <Form.Select name="brand" value={formData.brand} onChange={handleChange} isInvalid={!!errors.brand}>
                  <option value="">Select Brand</option>
                  {(brands || []).map(brand => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.brand}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Price *</Form.Label>
                <Form.Control type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} isInvalid={!!errors.price} placeholder="0.00" />
                <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Discount (%)</Form.Label>
                <Form.Control type="number" step="0.01" name="discount" value={formData.discount} onChange={handleChange} isInvalid={!!errors.discount} placeholder="0" />
                <Form.Control.Feedback type="invalid">{errors.discount}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Product Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} isInvalid={!!errors.image} disabled={uploadingImage} />
            <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
            <Form.Text className="text-muted">Upload an image file (JPEG, PNG, GIF, WebP). Max size: 5MB</Form.Text>
            
            {imagePreview && (
              <div className="mt-3">
                <ImageWithFallback src={imagePreview} alt="Preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            )}
            
            {uploadingImage && (
              <div className="mt-2">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Uploading...</span>
                </div>
                Uploading image...
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tags</Form.Label>
            <Form.Control type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Enter tags separated by commas" />
            <Form.Text className="text-muted">Separate multiple tags with commas</Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ProductForm;
