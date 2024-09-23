import React, { useContext, useEffect, useState } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';

const CartItems = () => {
  const { getTotalCartAmount, all_product, cartItems, removeFromCart, updateCartQuantity, applyPromoCode, discount, promoMessage } = useContext(ShopContext);
  const [promoCode, setPromoCode] = useState('');
  const [unusedPromos, setUnusedPromos] = useState([]);
  const [usedPromos, setUsedPromos] = useState([]);
  const [view, setView] = useState('unused');
  const navigate = useNavigate();

  const cartProducts = all_product.filter(product => cartItems[product.product_id] > 0);

  useEffect(() => {
    console.log('Cart items:', cartItems);
  }, [cartItems]);

  useEffect(() => {
    if (view === 'unused') {
      fetchUnusedPromos();
    } else {
      fetchUsedPromos();
    }
  }, [view]);

  const fetchUnusedPromos = async () => {
    try {
      const response = await fetch('http://localhost:4000/unused-promos', {
        headers: {
          'auth-token': localStorage.getItem('auth-token')
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setUnusedPromos(data);
    } catch (error) {
      console.error('Error fetching unused promos:', error);
    }
  };

  const fetchUsedPromos = async () => {
    try {
      const response = await fetch('http://localhost:4000/used-promos', {
        headers: {
          'auth-token': localStorage.getItem('auth-token')
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setUsedPromos(data);
    } catch (error) {
      console.error('Error fetching used promos:', error);
    }
  };

  const handleIncreaseQuantity = (productId) => {
    updateCartQuantity(productId, (cartItems[productId] || 0) + 1);
  };

  const handleDecreaseQuantity = (productId) => {
    if (cartItems[productId] > 1) {
      updateCartQuantity(productId, cartItems[productId] - 1);
    }
  };

  const handleApplyPromoCode = () => {
    applyPromoCode(promoCode);
  };

  const totalAmount = getTotalCartAmount();
  const finalAmount = totalAmount - discount;

  return (
    <div className='cartitems'>
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Name</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {cartProducts.length > 0 ? (
        cartProducts.map((product) => (
          <div key={product.product_id}>
            <div className="cartitems-format cartitems-format-main">
              <img src={`http://localhost:4000/uploads/${product.image_url}`} alt="" className='carticon-product-icon' />
              <p>{product.product_name}</p>
              <p>{product.price} VND</p>
              <div className='cartitems-quantity-controls'>
                <button onClick={() => handleDecreaseQuantity(product.product_id)}>-</button>
                <p>{cartItems[product.product_id]}</p>
                <button onClick={() => handleIncreaseQuantity(product.product_id)}>+</button>
              </div>
              <p>{product.price * cartItems[product.product_id]} VND</p>
              <img className='cartitems-remove-icon' src={remove_icon} onClick={() => removeFromCart(product.product_id)} alt="" />
            </div>
            <hr />
          </div>
        ))
      ) : (
        <p>No items in cart.</p>
      )}
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>{totalAmount} VND</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>{finalAmount} VND</h3>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
  <p>If you have a promo code, enter it here</p>
  <div className="cartitems-promobox">
    <input 
      type="text" 
      placeholder='Promo code' 
      value={promoCode}
      onChange={(e) => setPromoCode(e.target.value)} 
    />
    <button onClick={handleApplyPromoCode}>Submit</button>
  </div>
  {promoMessage && <p className="promo-message">{promoMessage}</p>}
  <div className="cartitems-promo-buttons-wrapper">
    <div className="cartitems-promo-buttons">
      <button onClick={() => setView('unused')}>View Unused Promos</button>
      <button onClick={() => setView('used')}>View Used Promos</button>
    </div>
  </div>
  <div className="cartitems-promo-list">
    {view === 'unused' ? (
      <ul>
        {unusedPromos.length > 0 ? (
          unusedPromos.map(promo => (
            <li key={promo.promo_id}>{promo.promo_code} - {promo.discount_amount} VND</li>
          ))
        ) : (
          <p>No unused promo codes available.</p>
        )}
      </ul>
    ) : (
      <ul>
        {usedPromos.length > 0 ? (
          usedPromos.map(promo => (
            <li key={promo.promo_id}>{promo.promo_code} - {promo.discount_amount} VND</li>
          ))
        ) : (
          <p>No used promo codes available.</p>
        )}
      </ul>
    )}
  </div>
</div>
      </div>
    </div>
  );
}

export default CartItems;
