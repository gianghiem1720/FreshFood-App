import React, { useEffect, useState } from 'react';
import './MyOrders.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isPreview, setIsPreview] = useState(false);
    const token = localStorage.getItem('auth-token');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:4000/myorders', {
                    method: 'GET',
                    headers: {
                        'auth-token': token,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, [token]);

    const handleViewDetails = async (order) => {
        try {
            const response = await fetch(`http://localhost:4000/order/${order.order_id}`, {
                method: 'GET',
                headers: {
                    'auth-token': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setSelectedOrder(data);
            setIsPreview(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const handleConfirmReceived = async (order_id) => {
        try {
            const response = await fetch(`http://localhost:4000/order/${order_id}/confirm`, {
                method: 'PUT',
                headers: {
                    'auth-token': token, // Sử dụng token để xác thực người dùng
                    'Content-Type': 'application/json' // Chỉ định kiểu dữ liệu gửi đi là JSON
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            // Cập nhật trạng thái đơn hàng trong danh sách `orders`
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.order_id === order_id ? { ...order, status: 'Received' } : order
                )
            );
        } catch (error) {
            console.error('Error confirming order:', error);
        }
    };
    

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setIsPreview(false);
    };

    const generatePDF = () => {
        if (!selectedOrder) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Order Details", 14, 20);

        doc.setFontSize(14);
        doc.text(`Order ID: ${selectedOrder.order_id}`, 14, 30);
        doc.text(`Order Date: ${new Date(selectedOrder.order_date).toLocaleDateString()}`, 14, 40);
        doc.text(`Total Amount: ${selectedOrder.total_amount} VND`, 14, 50);
        doc.text(`Final Amount: ${selectedOrder.final_amount} VND`, 14, 60);
        doc.text(`Status: ${selectedOrder.status}`, 14, 70);

        doc.text("User Information", 14, 90);
        doc.text(`Full Name: ${selectedOrder.user.full_name}`, 14, 100);
        doc.text(`Phone: ${selectedOrder.user.phone}`, 14, 110);
        doc.text(`Address: ${selectedOrder.user.address}`, 14, 120);

        doc.text("Products:", 14, 140);

        const tableColumn = ["Product Name", "Quantity", "Price"];
        const tableRows = selectedOrder.order_details.map(detail => [
            detail.product_name,
            detail.quantity,
            `${detail.price} / item`
        ]);

        doc.autoTable(tableColumn, tableRows, { startY: 150 });

        doc.save('order-details.pdf');
    };

    return (
        <div className="my-orders-container">
            <div className="my-orders-header">
                <h1 className="my-orders-title">My Orders</h1>
                <a href="/profile" className="back-to-profile-button">
                    Back to Profile
                </a>
            </div>
            {orders.length === 0 ? (
                <p className="my-orders-no-orders">No orders found.</p>
            ) : (
                <div className="my-orders-list-container">
                    <ul className="my-orders-list">
                        {orders.map(order => (
                            <li key={order.order_id} className="my-orders-item">
                                <div className="order-details">
                                    <h2 className="my-orders-id">Order ID: {order.order_id}</h2>
                                    <p className="my-orders-date">Order Date: {new Date(order.order_date).toLocaleDateString()}</p>
                                    <p className="my-orders-amount">Total Amount: ${order.total_amount} VND</p>
                                    <p className="my-orders-status">Status: {order.status}</p>
                                </div>
                                <div className="order-actions">
                                    <button 
                                        onClick={() => handleViewDetails(order)} 
                                        className="view-details-button"
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        onClick={() => handleConfirmReceived(order.order_id)} 
                                        className={`confirm-received-button ${order.status === 'Received' ? 'confirmed' : ''}`}
                                        disabled={order.status === 'Received'}
                                    >
                                        {order.status === 'Received' ? 'Received' : 'Confirm Received'}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {selectedOrder && (
                <div className="order-details-modal">
                    <div className="order-details-modal-content">
                        <span className="close-modal" onClick={handleCloseModal}>&times;</span>
                        <h2>Order Details</h2>
                        <p><strong>Order ID:</strong> {selectedOrder.order_id}</p>
                        <p><strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                        <p><strong>Total Amount:</strong> {selectedOrder.total_amount} VND</p>
                        <p><strong>Final Amount:</strong> {selectedOrder.final_amount} VND</p>
                        <p><strong>Status:</strong> {selectedOrder.status}</p>
                        <h3>User Information</h3>
                        <p><strong>Full Name:</strong> {selectedOrder.user.full_name}</p>
                        <p><strong>Phone:</strong> {selectedOrder.user.phone}</p>
                        <p><strong>Address:</strong> {selectedOrder.user.address}</p>
                        <h3>Products:</h3>
                        <ul>
                            {selectedOrder.order_details.map(detail => (
                                <li key={detail.product_id}>
                                    <p><strong>Product Name:</strong> {detail.product_name}</p>
                                    <p><strong>Quantity:</strong> {detail.quantity}</p>
                                    <p><strong>Price:</strong> {detail.price}/1 item</p>
                                </li>
                            ))}
                        </ul>
                        {/* Nút xem trước và xuất PDF */}
                        <div className="preview-export-buttons">
                            {!isPreview ? (
                                <button onClick={() => setIsPreview(true)} className="view-preview-button">Preview</button>
                            ) : (
                                <>
                                    <button onClick={generatePDF} className="export-pdf-button">Export to PDF</button>
                                    <button onClick={() => setIsPreview(false)} className="cancel-preview-button">Cancel Preview</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
