import React, { useEffect, useState } from 'react';
import './Popular.css';
import Item from '../Item/Item';
import { useNavigate } from 'react-router-dom';

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const navigate = useNavigate(); // Khởi tạo useNavigate hook

  useEffect(() => {
    fetch('http://localhost:4000/popularin')
      .then((response) => response.json())
      .then((data) => setPopularProducts(data))
      .catch((error) => console.error('Error fetching popular products:', error));
  }, []);

  const handleItemClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className='popular'>
      <h1>POPULAR</h1>
      <hr />
      <div className="popular-item">
        {popularProducts.map((item) => (
          <Item
            key={item.product_id}
            product_name={item.product_name}
            image={`http://localhost:4000/uploads/${item.image_url}`}
            price={item.price}
            quantity={item.quantity_remaining}
            onClick={() => handleItemClick(item.product_id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Popular;
