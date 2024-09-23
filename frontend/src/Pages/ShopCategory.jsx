import React, { useContext, useEffect, useState } from 'react';
import './CSS/ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';
import Item from '../Components/Item/Item';
import { useNavigate } from 'react-router-dom';

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc'); // Thứ tự sắp xếp mặc định là tăng dần
  const navigate = useNavigate();

  useEffect(() => {
    if (all_product) {
      const filtered = all_product.filter(product => product.category_id === props.category);
      const sorted = [...filtered].sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      });
      setFilteredProducts(sorted);
    }
  }, [all_product, props.category, sortOrder]);

  const handleItemClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="Banner" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{filteredProducts.length}</span> out of {all_product.length} products
        </p>
        <div className="shopcategory-sort">
          <p>Sort by:</p>
          <select onChange={(e) => handleSortChange(e.target.value)} value={sortOrder}>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      <div className="shopcategory-products">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <Item
              key={item.product_id}
              product_name={item.product_name}
              image={`http://localhost:4000/uploads/${item.image_url}`}
              price={item.price}
              quantity={item.quantity}
              onClick={() => handleItemClick(item.product_id)}
            />
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
      <div className='shopcategory-loadmore'>
        Explore more
      </div>
    </div>
  );
};

export default ShopCategory;
