import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge, 
  Button, 
  Form, 
  Modal,
  Alert,
  Spinner,
  Tab,
  Tabs
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [orderStats, setOrderStats] = useState(null);

  // Fetch orders from backend
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    try {
      console.log('Fetching order stats...');
      const response = await fetch('/api/orders/stats/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const stats = await response.json();
        console.log('Order stats received:', stats);
        setOrderStats(stats);
      } else {
        console.error('Failed to fetch order stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, [filters]);

  // Add another useEffect to refresh data when component mounts or becomes visible
  useEffect(() => {
    const handleFocus = () => {
      fetchOrderStats();
      fetchOrders(pagination.current);
    };

    // Refresh when page becomes visible
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [pagination.current]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const order = await response.json();
      setSelectedOrder(order);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel order');
      }

      toast.success('Order cancelled successfully');
      fetchOrders(pagination.current);
      setShowModal(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status, deliveryStatus) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      confirmed: { variant: 'info', text: 'Confirmed' },
      processing: { variant: 'primary', text: 'Processing' },
      shipped: { variant: 'success', text: 'Shipped' },
      delivered: { variant: 'success', text: 'Delivered' },
      cancelled: { variant: 'danger', text: 'Cancelled' },
      delayed: { variant: 'danger', text: 'Delayed' },
      'in-transit': { variant: 'info', text: 'In Transit' }
    };

    const config = statusConfig[deliveryStatus] || statusConfig[status];
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your orders...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">
          <i className="fas fa-box me-2"></i>
          My Orders
        </h2>
        <p className="text-muted">Track and manage your order history</p>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={() => {
            fetchOrderStats();
            fetchOrders(pagination.current);
          }}
          className="ms-2"
        >
          <i className="fas fa-sync-alt me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Order Statistics */}
      {orderStats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{orderStats.totalOrders}</h3>
                <p className="mb-0">Total Orders</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">${orderStats.totalSpent?.toFixed(2) || '0.00'}</h3>
                <p className="mb-0">Total Spent</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">
                  {orderStats.statusBreakdown?.find(s => s._id === 'processing')?.count || 0}
                </h3>
                <p className="mb-0">Processing</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">
                  {orderStats.statusBreakdown?.find(s => s._id === 'shipped')?.count || 0}
                </h3>
                <p className="mb-0">Shipped</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card>
        <Card.Body>
          {orders.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>📦</div>
              <h5 className="text-muted">No orders found</h5>
              <p className="text-muted">
                {filters.status || filters.startDate || filters.endDate
                  ? 'Try adjusting your filters to see more orders.'
                  : 'Start shopping to see your orders here!'}
              </p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Delivery</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <strong>{order.formattedOrderId}</strong>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                      </td>
                      <td>
                        <strong>${order.total.toFixed(2)}</strong>
                      </td>
                      <td>
                        {getStatusBadge(order.status, order.deliveryStatus)}
                      </td>
                      <td>
                        {order.daysToDelivery > 0 ? (
                          <small className="text-muted">
                            {order.daysToDelivery} day{order.daysToDelivery > 1 ? 's' : ''} remaining
                          </small>
                        ) : (
                          <small className="text-success">
                            {order.status === 'delivered' ? 'Delivered' : 'Due today'}
                          </small>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewOrder(order.orderId)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => fetchOrders(pagination.current - 1)}
                          disabled={pagination.current === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(pagination.pages)].map((_, i) => (
                        <li key={i + 1} className={`page-item ${pagination.current === i + 1 ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => fetchOrders(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => fetchOrders(pagination.current + 1)}
                          disabled={pagination.current === pagination.pages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details - {selectedOrder?.formattedOrderId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Tabs defaultActiveKey="items" className="mb-3">
              <Tab eventKey="items" title="Items">
                <div className="mb-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="d-flex align-items-center mb-3 p-3 border rounded">
                      <img
                        src={item.image ? `http://localhost:5000${item.image}` : '/api/placeholder/80/80'}
                        alt={item.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        className="rounded me-3"
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.name}</h6>
                        <p className="text-muted mb-1">
                          {item.category?.name} - {item.brand?.name}
                        </p>
                        <div className="d-flex justify-content-between">
                          <span>Qty: {item.quantity}</span>
                          <strong>${((item.discountPrice || item.price) * item.quantity).toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab>
              
              <Tab eventKey="shipping" title="Shipping">
                <div className="mb-3">
                  <h6>Delivery Status</h6>
                  <div className="mb-3">
                    {getStatusBadge(selectedOrder.status, selectedOrder.deliveryStatus)}
                    {selectedOrder.trackingNumber && (
                      <div className="mt-2">
                        <strong>Tracking Number:</strong> {selectedOrder.trackingNumber}
                      </div>
                    )}
                  </div>
                  
                  <h6>Shipping Address</h6>
                  <address>
                    {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                    {selectedOrder.shippingAddress.address}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                    {selectedOrder.shippingAddress.country}<br />
                    <strong>Phone:</strong> {selectedOrder.shippingAddress.phone}<br />
                    <strong>Email:</strong> {selectedOrder.shippingAddress.email}
                  </address>
                  
                  <h6>Delivery Information</h6>
                  <p>
                    <strong>Estimated Delivery:</strong> {formatDate(selectedOrder.estimatedDelivery)}<br />
                    <strong>Delivery Option:</strong> {selectedOrder.deliveryOption}<br />
                    {selectedOrder.actualDelivery && (
                      <>
                        <strong>Actual Delivery:</strong> {formatDate(selectedOrder.actualDelivery)}
                      </>
                    )}
                  </p>
                </div>
              </Tab>
              
              <Tab eventKey="payment" title="Payment & Total">
                <div className="mb-3">
                  <h6>Payment Information</h6>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  
                  <h6>Order Summary</h6>
                  <div className="border rounded p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>${selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Tax:</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold h6">
                      <span>Total:</span>
                      <span className="text-success">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder && !['shipped', 'delivered', 'cancelled'].includes(selectedOrder.status) && (
            <Button
              variant="danger"
              onClick={() => handleCancelOrder(selectedOrder.orderId)}
            >
              Cancel Order
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders;
