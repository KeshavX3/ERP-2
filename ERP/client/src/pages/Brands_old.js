import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import brandService from '../services/brandService';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, brand: null });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: ''
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await brandService.getBrands({ limit: 100 });
      setBrands(response.brands);
    } catch (error) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: '', description: '', logo: '', website: '' });
    setEditingBrand(null);
    setShowModal(true);
  };

  const handleEdit = (brand) => {
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || ''
    });
    setEditingBrand(brand);
    setShowModal(true);
  };

  const handleDelete = (brand) => {
    setDeleteModal({ show: true, brand });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand._id, formData);
        toast.success('Brand updated successfully');
      } else {
        await brandService.createBrand(formData);
        toast.success('Brand created successfully');
      }
      setShowModal(false);
      loadBrands();
    } catch (error) {
      toast.error(editingBrand ? 'Failed to update brand' : 'Failed to create brand');
    }
  };

  const confirmDelete = async () => {
    try {
      await brandService.deleteBrand(deleteModal.brand._id);
      toast.success('Brand deleted successfully');
      setDeleteModal({ show: false, brand: null });
      loadBrands();
    } catch (error) {
      toast.error('Failed to delete brand');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Brands</h2>
            <Button variant="primary" onClick={handleAdd}>
              Add Brand
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Logo</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Website</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map(brand => (
                      <tr key={brand._id}>
                        <td>
                          <img
                            src={brand.logo || '/api/placeholder/60/60'}
                            alt={brand.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </td>
                        <td><strong>{brand.name}</strong></td>
                        <td>{brand.description || 'No description'}</td>
                        <td>
                          {brand.website ? (
                            <a href={brand.website} target="_blank" rel="noopener noreferrer">
                              {brand.website}
                            </a>
                          ) : (
                            'No website'
                          )}
                        </td>
                        <td>{new Date(brand.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleEdit(brand)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(brand)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingBrand ? 'Edit Brand' : 'Add Brand'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Logo URL</Form.Label>
              <Form.Control
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingBrand ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, brand: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{deleteModal.brand?.name}"?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ show: false, brand: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Brands;
