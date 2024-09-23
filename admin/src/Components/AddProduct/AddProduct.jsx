import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    product_name: "",
    category_id: 1,
    price: "",
    quantity: "",
    is_fresh: true,
    description: "",
    hsd: "", // Thay vì expiry_date
    image_url: ""
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const Add_Product = async () => {
    let responseData;
    let product = { ...productDetails };

    let formData = new FormData();
    formData.append('image', image);

    try {
      // Upload image
      await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData
      })
        .then((resp) => resp.json())
        .then((data) => { responseData = data });

      if (responseData.success) {
        product.image_url = responseData.image_url;

        // Add product
        await fetch('http://localhost:4000/addproducts', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(product)
        })
          .then((resp) => resp.json())
          .then((data) => {
            data.message === 'Product added successfully'
              ? alert("Product Added")
              : alert("Failed to add product");
          });
      }
    } catch (error) {
      console.error('Error:', error);
      alert("An error occurred");
    }
  };

  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product name</p>
        <input
          value={productDetails.product_name}
          onChange={changeHandler}
          type="text"
          name='product_name'
          placeholder='Type here'
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.price}
            onChange={changeHandler}
            type="text"
            name='price'
            placeholder='Type here'
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Quantity</p>
          <input
            value={productDetails.quantity}
            onChange={changeHandler}
            type="text"
            name='quantity'
            placeholder='Type here'
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Is Fresh</p>
          <select
            value={productDetails.is_fresh}
            onChange={(e) => setProductDetails({ ...productDetails, is_fresh: e.target.value === 'true' })}
            name="is_fresh"
            className='add-product-selector'
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category_id}
          onChange={changeHandler}
          name="category_id"
          className='add-product-selector'
        >
          <option value={1}>Meat</option>
          <option value={2}>Seafood</option>
          <option value={3}>Vegetable</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <p>Description</p>
        <textarea
          value={productDetails.description}
          onChange={changeHandler}
          name='description'
          placeholder='Type here'
        />
      </div>
      <div className="addproduct-itemfield">
        <p>Expiry Date (hsd)</p>
        <input
          value={productDetails.hsd}
          onChange={changeHandler}
          type="date"
          name='hsd'
        />
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className='addproduct-thumnail-img'
            alt=""
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name='image'
          id='file-input'
          hidden
        />
      </div>
      <button onClick={Add_Product} className='addproduct-btn'>ADD</button>
    </div>
  );
};

export default AddProduct;
