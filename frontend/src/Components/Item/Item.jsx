import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom';

const Item = (props) => {
  console.log("Item props:", props);

  return (
    <div className='item' onClick={props.onClick}>
      <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt={props.product_name} />
      <p>{props.product_name}</p>
      <div className="item-prices">
        <div className="item-price-new">
          {props.price} VND
        </div>
        <div className="item-price-old">
          {props.quantity} items
        </div>
      </div>
    </div>
  );
}

export default Item;
