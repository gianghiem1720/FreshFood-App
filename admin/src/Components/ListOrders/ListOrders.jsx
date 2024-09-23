import React, { useEffect, useState } from 'react';
import './ListOrders.css';

const ListOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:4000/orders');
      const data = await response.json();
      setAllOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:4000/order/${orderId}`, {
        headers: {
          'Accept': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      console.log('Order details:', data);
      setSelectedOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId) => {
    try {
      await fetch('http://localhost:4000/updateOrderStatus', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId, status: 'Shipping' }),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const viewOrderDetails = async (order) => {
    await fetchOrderDetails(order.order_id);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className='list-orders'>
      <h1>All Orders List</h1>
      <div className="listorders-format-main">
        <p>Order ID</p>
        <p>User ID</p>
        <p>Total Amount</p>
        <p>Status</p>
        <p>Review</p>
      </div>
      <div className="listorders-allorders">
        <hr />
        {allOrders.map((order) => (
          <React.Fragment key={order.order_id}>
            <div className="listorders-format-main listorders-format">
              <p>{order.order_id}</p>
              <p>{order.user_id}</p>
              <p>${order.total_amount}</p>
              <p>{order.status}</p>
              <button 
                onClick={() => updateOrderStatus(order.order_id)} 
                disabled={order.status !== 'Pending'}
              >
                Approve
              </button>
              <button 
                onClick={() => viewOrderDetails(order)}
                style={{ marginLeft: '10px' }}
              >
                View Details
              </button>
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>

      {/* Chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="order-details active">
          <div className="order-details-header">
            <h3>Order Details (ID: {selectedOrder.order_id})</h3>
            <button onClick={closeOrderDetails}>Close</button>
          </div>
          <div className="order-details-item">
            <p><strong>Full Name:</strong> {selectedOrder.user.full_name || 'N/A'}</p>
            <p><strong>Phone:</strong> {selectedOrder.user.phone || 'N/A'}</p>
            <p><strong>Address:</strong> {selectedOrder.user.address || 'N/A'}</p>
            <p><strong>Total Amount:</strong> {selectedOrder.total_amount} VND</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString() || 'N/A'}</p>
            <h3>Products:</h3>
            <ul>
              {selectedOrder.order_details.map(detail => (
                <li key={detail.product_id}>
                  <p><strong>Product Name:</strong> {detail.product_name}</p>
                  <p><strong>Quantity:</strong> {detail.quantity}</p>
                  <p><strong>Price:</strong> {detail.price} VND</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrders;
