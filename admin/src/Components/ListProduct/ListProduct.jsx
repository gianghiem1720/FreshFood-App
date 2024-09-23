import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editProductId, setEditProductId] = useState(null);
  const [editProduct, setEditProduct] = useState({
    product_name: '',
    price: '',
    quantity: '',
    category_id: '',
    is_fresh: false,
  });
  const [removeSuccessMessage, setRemoveSuccessMessage] = useState(''); // Trạng thái thông báo xóa sản phẩm

  // Hàm fetch dữ liệu sản phẩm từ backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:4000/admin/products');
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Hàm fetch danh mục từ backend
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Tìm tên danh mục dựa trên category_id
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.category_name : 'Unknown';
  };

  // Hàm xóa sản phẩm
  const removeProduct = async (id) => {
    try {
      await fetch('http://localhost:4000/removeproducts', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: id }),
      });
      setRemoveSuccessMessage('Product removed successfully!'); // Thiết lập thông báo thành công
      fetchProducts();
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  // Hàm hiển thị form chỉnh sửa sản phẩm
  const showEditForm = (product) => {
    setEditProductId(product.product_id);
    setEditProduct({
      product_name: product.product_name,
      price: product.price,
      quantity: product.quantity,
      category_id: product.category_id,
      is_fresh: product.is_fresh,
    });
  };

  // Hàm xử lý thay đổi dữ liệu trong form chỉnh sửa
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProduct({ ...editProduct, [name]: value });
  };

  // Hàm cập nhật sản phẩm
  const updateProduct = async () => {
    try {
      await fetch(`http://localhost:4000/updateproduct/${editProductId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: editProductId,
          product_name: editProduct.product_name,
          category_id: editProduct.category_id,
          price: editProduct.price,
          quantity: editProduct.quantity,
          is_fresh: editProduct.is_fresh,
        }),
      });
      setEditProductId(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      {removeSuccessMessage && <p className="success-message">{removeSuccessMessage}</p>} {/* Hiển thị thông báo thành công */}
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Category</p>
        <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allProducts.map((product) => (
          <React.Fragment key={product.product_id}>
            <div className="listproduct-format-main listproduct-format">
              <img 
                src={`http://localhost:4000/uploads/${product.image_url}`} 
                alt={product.product_name} 
                className="listproduct-product-icon" 
              />
              <p>{product.product_name}</p>
              <p>{product.price} VND</p>
              <p>{product.quantity}</p>
              <p>{getCategoryName(product.category_id)}</p>
              <div>
                <button onClick={() => showEditForm(product)}>Edit</button>
                <img 
                  onClick={() => removeProduct(product.product_id)} 
                  src={cross_icon} 
                  alt="Remove" 
                  className="listproduct-remove-icon" 
                />
              </div>
            </div>
            {editProductId === product.product_id && (
              <div className="edit-product-form">
                <input
                  type="text"
                  name="product_name"
                  value={editProduct.product_name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                />
                <input
                  type="number"
                  name="price"
                  value={editProduct.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                />
                <input
                  type="number"
                  name="quantity"
                  value={editProduct.quantity}
                  onChange={handleInputChange}
                  placeholder="Quantity"
                />
                <select
                  name="category_id"
                  value={editProduct.category_id}
                  onChange={handleInputChange}
                >
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
                <label>
                  <input
                    type="checkbox"
                    name="is_fresh"
                    checked={editProduct.is_fresh}
                    onChange={(e) => setEditProduct({ ...editProduct, is_fresh: e.target.checked })}
                  />
                  Fresh
                </label>
                <button onClick={updateProduct}>Save</button>
              </div>
            )}
            <hr />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
