import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import ImageWithFallback from '../components/ImageWithFallback';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, hasPermission } = useAuth();
  
  console.log('🏷️ Categories: Component loaded', { isAuthenticated, hasPermission: hasPermission('view_categories') });
  
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, category: null });
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });

  useEffect(() => {
    loadCategories();
    loadCategoryCounts();
  }, []);

  const loadCategories = async () => {
    console.log('📥 Categories: Loading categories...');
    setLoading(true);
    try {
      const response = await categoryService.getCategories({ limit: 100 });
      console.log('✅ Categories: Loaded categories:', response.categories?.length);
      setCategories(response.categories);
    } catch (error) {
      console.error('❌ Categories: Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryCounts = async () => {
    try {
      const categories = await categoryService.getCategories({ limit: 100 });
      const counts = {};
      for (const category of categories.categories) {
        try {
          const products = await productService.getProducts({ category: category._id, limit: 1 });
          counts[category._id] = products.total || 0;
        } catch (error) {
          counts[category._id] = 0;
        }
      }
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Failed to load category counts:', error);
    }
  };

  const handleCategoryClick = (category, e) => {
    if (e.target.closest('.action-buttons')) return;
    
    console.log('Category clicked:', category.name, category._id);
    // Navigate with state only for now
    navigate('/products', {
      state: {
        categoryFilter: category._id,
        categoryName: category.name
      }
    });
  };

  const handleAdd = () => {
    setFormData({ name: '', description: '', image: '' });
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (category) => {
    setDeleteModal({ show: true, category });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clean up form data - ensure empty strings for optional fields
    const cleanFormData = {
      ...formData,
      description: formData.description || '',
      image: formData.image || ''
    };
    
    try {
      console.log('Submitting category data:', cleanFormData);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, cleanFormData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(cleanFormData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      loadCategories();
      loadCategoryCounts();
    } catch (error) {
      console.error('Category submit error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`${editingCategory ? 'Failed to update' : 'Failed to create'} category: ${errorMessage}`);
    }
  };

  const confirmDelete = async () => {
    try {
      await categoryService.deleteCategory(deleteModal.category._id);
      toast.success('Category deleted successfully');
      setDeleteModal({ show: false, category: null });
      loadCategories();
      loadCategoryCounts();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Clean up navigation effect
  useEffect(() => {
    if (location.state?.categoryFilter) {
      toast.info(`Showing products from category: ${location.state.categoryName}`);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);

  // Test API connectivity
  useEffect(() => {
    const testAPIConnection = async () => {
      try {
        console.log('🔗 Categories: Testing API connection to:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/categories?limit=1`);
        console.log('🔗 Categories: API response status:', response.status);
        if (!response.ok) {
          console.error('🔗 Categories: API not responding properly');
        } else {
          console.log('✅ Categories: API connection successful');
        }
      } catch (error) {
        console.error('❌ Categories: API connection failed:', error);
      }
    };

    testAPIConnection();
  }, []);

  return (
    <div className="fade-in">
      <div className="modern-page-header">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle">Organize your products with beautiful categories</p>
            {/* Debug info for development */}
            <small className="text-muted">
              Auth: {isAuthenticated ? 'Yes' : 'No'} | 
              Permission: {hasPermission('view_categories') ? 'Yes' : 'No'} | 
              Categories: {categories.length}
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              <i className="fas fa-th-large me-1"></i>Grid
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('table')}
              size="sm"
            >
              <i className="fas fa-list me-1"></i>Table
            </Button>
            {hasPermission('create_category') && (
              <Button variant="primary" onClick={handleAdd}>
                <i className="fas fa-plus me-2"></i>Add Category
              </Button>
            )}
          </div>
        </div>
      </div>

      <Container fluid className="px-0">
        {/* Main Content */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="categories-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                width: '100%',
                margin: '0 auto',
                maxWidth: '1200px',
                padding: '0 16px',
                overflowX: 'hidden'
              }}>
                {categories.map(category => (
                  <div key={category._id} className="category-card-container">
                    <Card className="category-card h-100 shadow-sm" style={{ cursor: 'pointer', maxWidth: '400px', minWidth: '260px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }} onClick={(e) => handleCategoryClick(category, e)}>
                      <div className="category-image-container" style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                        <ImageWithFallback 
                          src={category.image} 
                          alt={category.name} 
                          className="category-image" 
                          fallbackSrc="https://via.placeholder.com/300x200/667eea/ffffff?text=Category"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                        <div className="category-overlay">
                          <Badge bg="primary" className="product-count-badge">{categoryCounts[category._id] || 0} Products</Badge>
                        </div>
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <div className="flex-grow-1">
                          <h5 className="category-title">{category.name}</h5>
                          <p className="category-description text-muted">{category.description || 'No description available'}</p>
                        </div>
                        <div className="category-footer">
                          <small className="text-muted">Created: {new Date(category.createdAt).toLocaleDateString()}</small>
                        </div>
                        {hasPermission('edit_category') && (
                          <div className="action-buttons mt-2">
                            <Button variant="warning" size="sm" className="me-2" onClick={(e) => { e.stopPropagation(); handleEdit(category); }}>
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(category); }}>
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <Card.Body>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Products</th>
                          <th>Created</th>
                          {hasPermission('edit_category') && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(category => (
                          <tr key={category._id} style={{ cursor: 'pointer' }} onClick={(e) => handleCategoryClick(category, e)}>
                            <td>
                              <ImageWithFallback src={category.image} alt={category.name} className="table-image" fallbackSrc="/api/placeholder/60/60" />
                            </td>
                            <td><strong>{category.name}</strong></td>
                            <td>{category.description || 'No description'}</td>
                            <td><Badge bg="primary">{categoryCounts[category._id] || 0} Products</Badge></td>
                            <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                            {hasPermission('edit_category') && (
                              <td>
                                <div className="action-buttons d-flex gap-2">
                                  <Button variant="warning" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(category); }}>Edit</Button>
                                  <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(category); }}>Delete</Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editingCategory ? 'Edit Category' : 'Add Category'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInputChange} />
              </Form.Group>
              
              <FileUpload
                label="Category Image"
                currentImage={formData.image}
                onFileUpload={(imagePath) => {
                  setFormData(prev => ({ ...prev, image: imagePath }));
                }}
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
              />
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">{editingCategory ? 'Update' : 'Create'}</Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, category: null })}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete "{deleteModal.category?.name}"? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteModal({ show: false, category: null })}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Categories;
