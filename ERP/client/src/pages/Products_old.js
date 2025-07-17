import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import brandService from '../services/brandService';
import ProductModal from '../components/ProductModal';
import ProductForm from '../components/ProductForm';
import ImageWithFallback from '../components/ImageWithFallback';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    page: 1
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(filters);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories({ limit: 100 });
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandService.getBrands({ limit: 100 });
      setBrands(response.brands);
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowFormModal(true);
  };

  const handleDelete = (product) => {
    setDeleteModal({ show: true, product });
  };

  const confirmDelete = async () => {
    try {
      await productService.deleteProduct(deleteModal.product._id);
      toast.success('Product deleted successfully');
      setDeleteModal({ show: false, product: null });
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(formData);
        toast.success('Product created successfully');
      }
      setShowFormModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filtering
    });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      page: 1
    });
  };

  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h3 mb-0 text-dark fw-bold">Products</h1>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowFormModal(true)}
                className="px-4"
              >
                <i className="fas fa-plus me-2"></i>
                Add Product
              </Button>
            </div>
          </Col>
        </Row>

        {/* Enhanced Filters */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Label className="fw-semibold">Search Products</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by name or description..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="form-control-lg"
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Label className="fw-semibold">Category</Form.Label>
                    <Form.Select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="form-select-lg"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label className="fw-semibold">Brand</Form.Label>
                    <Form.Select
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      className="form-select-lg"
                    >
                      <option value="">All Brands</option>
                      {brands.map(brand => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label className="fw-semibold">Min Price</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="$0"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="form-control-lg"
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Label className="fw-semibold">Max Price</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="$999999"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="form-control-lg"
                    />
                  </Col>
                  <Col md={1} className="d-flex align-items-end">
                    <Button
                      variant="outline-secondary"
                      onClick={clearFilters}
                      className="w-100"
                      size="lg"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      {/* Products Table */}
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
                <>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id}>
                          <td>
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          </td>
                          <td>
                            <strong>{product.name}</strong>
                            <br />
                            <small className="text-muted">
                              {product.description?.substring(0, 50)}...
                            </small>
                          </td>
                          <td>{product.category?.name}</td>
                          <td>{product.brand?.name}</td>
                          <td>
                            <div>
                              {product.discount > 0 && (
                                <small className="text-decoration-line-through text-muted">
                                  {formatPrice(product.price)}
                                </small>
                              )}
                              <div className="fw-bold">
                                {formatPrice(product.discountPrice)}
                              </div>
                              {product.discount > 0 && (
                                <small className="text-success">
                                  {product.discount}% off
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => handleView(product)}
                              >
                                View
                              </Button>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(product)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                      <Pagination>
                        <Pagination.First
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.current === 1}
                        />
                        <Pagination.Prev
                          onClick={() => handlePageChange(pagination.current - 1)}
                          disabled={pagination.current === 1}
                        />
                        {[...Array(pagination.pages)].map((_, index) => (
                          <Pagination.Item
                            key={index + 1}
                            active={index + 1 === pagination.current}
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next
                          onClick={() => handlePageChange(pagination.current + 1)}
                          disabled={pagination.current === pagination.pages}
                        />
                        <Pagination.Last
                          onClick={() => handlePageChange(pagination.pages)}
                          disabled={pagination.current === pagination.pages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Product View Modal */}
      <ProductModal
        show={showModal}
        onHide={() => setShowModal(false)}
        product={selectedProduct}
      />

      {/* Product Form Modal */}
      <ProductForm
        show={showFormModal}
        onHide={() => {
          setShowFormModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        categories={categories}
        brands={brands}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, product: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{deleteModal.product?.name}"?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ show: false, product: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </div>
  );
};

export default Products;
