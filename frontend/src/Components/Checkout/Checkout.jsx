import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import './Checkout.css';

const Checkout = () => {
  const [userFullName, setUserFullName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { getTotalCartAmount, all_product, cartItems, checkout, getFinalAmount, discount } = useContext(ShopContext);
  const navigate = useNavigate();

  const products = all_product.filter(product => cartItems[product.product_id] > 0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:4000/user', {
          headers: { 'auth-token': token }
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const userData = await response.json();
        setUserFullName(userData.full_name);
        setUserPhone(userData.phone);
        setUserAddress(userData.address);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handlePayment = () => {
    setShowModal(true);
  };

  const confirmOrder = async () => {
    setShowModal(false);
    try {
      await checkout(userPhone, userAddress, paymentMethod);
      setOrderConfirmed(true);
    } catch (error) {
      alert('Error during payment');
    }
  };

  const cancelOrder = () => {
    setShowModal(false);
  };

  const goBackToCart = () => {
    navigate('/cart');
  };

  if (orderConfirmed) {
    return (
      <div className="order-confirmation-container">
        <div className="order-confirmation">
          <h2>Your order has been confirmed!</h2>
          <p>Thank you for your purchase. You will receive an email confirmation shortly.</p>
          <button onClick={goBackToCart}>Back to Cart</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <div className="checkout-container">
        <div className="checkout-form">
          <div className="checkout-form-item">
            <label>Full Name:</label>
            <p>{userFullName}</p>
          </div>
          <div className="checkout-form-item">
            <label>Phone Number:</label>
            <p>{userPhone}</p>
          </div>
          <div className="checkout-form-item">
            <label>Shipping Address:</label>
            <p>{userAddress}</p>
          </div>
          <div className="checkout-form-item">
            <label htmlFor="deliveryMethod">Payment Method:</label>
            <div className="radio-group">
              <div>
                <input 
                  type="radio" 
                  id="online" 
                  name="paymentMethod" 
                  value="online" 
                  checked={paymentMethod === 'online'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
                <label htmlFor="online">Online Payment</label>
              </div>
              <div>
                <input 
                  type="radio" 
                  id="cod" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
                <label htmlFor="cod">Cash on Delivery</label>
              </div>
            </div>
          </div>
          <button onClick={handlePayment}>Confirm Order</button>
        </div>
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {products.map((product) => (
            <div key={product.product_id} className="checkout-summary-item">
              <span>{product.product_name}</span>
              <span>Quantity: {cartItems[product.product_id]}</span>
              <span>Price: {product.price} VND</span>
            </div>
          ))}
          <div className="checkout-total">
            <h3>Total Amount: {getFinalAmount()} VND</h3>
            {discount > 0 && <p>Discount Applied: {discount} VND</p>}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Are you sure you want to place this order?</h2>
            <button onClick={confirmOrder}>Yes</button>
            <button onClick={cancelOrder}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
