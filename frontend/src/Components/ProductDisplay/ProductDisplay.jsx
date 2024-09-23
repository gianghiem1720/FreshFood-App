import React, { useEffect, useState, useContext } from 'react';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';

const ProductDisplay = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false); // Trạng thái lưu trữ việc thêm vào giỏ hàng
  const { addToCart } = useContext(ShopContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:4000/products/${productId}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (isAdded) {
      setIsAdded(false);
    }
  }, [isAdded]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      return alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
    }
    
    try {
      const response = await fetch('http://localhost:4000/add-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      
      if (response.ok) {
        alert('Sản phẩm đã được thêm vào giỏ hàng');
        addToCart(productId, quantity); // Cập nhật giỏ hàng trong context
      } else {
        const data = await response.json();
        alert(data.message || 'Lỗi khi thêm sản phẩm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      alert('Lỗi khi thêm sản phẩm vào giỏ hàng');
    }
  };
  

  if (!product) return <div>Loading...</div>;

  return (
    <div className='productdisplay'>
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={`http://localhost:4000/uploads/${product.image_url}`} alt="" />
          <img src={`http://localhost:4000/uploads/${product.image_url}`} alt="" />
          <img src={`http://localhost:4000/uploads/${product.image_url}`} alt="" />
          <img src={`http://localhost:4000/uploads/${product.image_url}`} alt="" />
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={`http://localhost:4000/uploads/${product.image_url}`} alt="" />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.product_name}</h1>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old"></div>
          <div className="productdisplay-right-price-new">{product.price} VND</div>
        </div>
        <div className="productdisplay-right-description">
          HSD: 
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Quantity</h1>
          <div className="productdisplay-right-sizes">
            <input
              type="number"
              value={quantity}
              min="1"
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
        </div>
        <button onClick={handleAddToCart}>ADD TO CART</button>
      </div>
    </div>
  );
};

export default ProductDisplay;
