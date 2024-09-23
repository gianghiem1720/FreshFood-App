import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
      cart[index] = 0;
  }
  return cart;
}

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoid, setPromoId] =  useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/products')
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched products:", data);
        setAll_Product(data);
      })
      .catch((error) => console.error('Error fetching products:', error));

      fetch('http://localhost:4000/getcart', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched cart data:", data);
        setCartItems(data);
      })
      .catch((error) => console.error('Error fetching cart:', error));
  }, []);

  const addToCart = async (productId, quantity) => {
    try {
      const response = await fetch('http://localhost:4000/add-to-cart', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
  
      if (!response.ok) {
        throw new Error('Error adding to cart');
      }
  
 
      setCartItems(prevItems => {
        const updatedItems = { ...prevItems, [productId]: (prevItems[productId] || 0) + quantity };
        return updatedItems;
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  
  
  
  const removeFromCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:4000/remove-from-cart', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!response.ok) {
        throw new Error('Error removing from cart');
      }

      setCartItems((prevItems) => {
        const updatedItems = { ...prevItems };
        delete updatedItems[productId];
        return updatedItems;
      });

    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      const response = await fetch('http://localhost:4000/update-cart-quantity', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });

      if (!response.ok) {
        throw new Error('Error updating cart quantity');
      }

      setCartItems((prevItems) => {
        const updatedItems = {
          ...prevItems,
          [productId]: quantity,
        };
        console.log("Updated cart items:", updatedItems);
        return updatedItems;
      });
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const checkout = async (phoneNumber, address) => {
    const promo_id = promoid;

    try {
        const response = await fetch('http://localhost:4000/checkout', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'auth-token': `${localStorage.getItem('auth-token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber, address, promo_id })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error during checkout');
        }

        setCartItems(getDefaultCart());

        return await response.json();
    } catch (error) {
        console.error('Error during checkout:', error);
        throw error;
    }
};

  
  const getTotalCartAmount = () => {
    return all_product.reduce((acc, product) => {
      const quantity = cartItems[product.product_id] || 0;
      return acc + (product.price * quantity);
    }, 0);
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((acc, quantity) => acc + quantity, 0);
  }

  const applyPromoCode = async (promoCode) => {
    try {
        const response = await fetch('http://localhost:4000/apply-promo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': `${localStorage.getItem('auth-token')}`
            },
            body: JSON.stringify({ promo_code: promoCode }),
        });
        const data = await response.json();

        if (response.ok) {
            setDiscount(data.discount_amount);
            setPromoId(data.promo_id);
            setPromoMessage('Promo code applied successfully!');
        } else {
            setPromoMessage(data.message);
        }
    } catch (error) {
        console.error('Error applying promo code:', error);
        setPromoMessage('Error applying promo code');
    }
};


  const getFinalAmount = () => {
    let amount = getTotalCartAmount();
    if (discount > 0) {
      amount -= discount;
    }
    return amount;
  };
  
  const contextValue = { getTotalCartItems, getTotalCartAmount, all_product, cartItems, addToCart, removeFromCart, updateCartQuantity, checkout,applyPromoCode, 
    discount,promoMessage, getFinalAmount,promoid};

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider;
