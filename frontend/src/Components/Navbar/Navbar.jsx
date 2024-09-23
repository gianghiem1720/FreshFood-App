import React, { useContext, useState } from 'react';
import './Navbar.css';
import logo from '../Assets/ff_logo.webp';
import cart_icon from '../Assets/cart_icon.png';
import avatar_icon from '../Assets/avatar_icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/nav_dropdown.png';

export const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { getTotalCartItems } = useContext(ShopContext);
  const navigate = useNavigate();

  // Hàm xử lý sự thay đổi của thanh tìm kiếm
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
        try {
            const response = await fetch(`http://localhost:4000/search?query=${query}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    } else {
        setSearchResults([]);
    }
};


  const handleResultClick = (product) => {
    const productId = Number(product.product_id);
    if (!isNaN(productId)) {
      navigate(`/product/${productId}`);
    } else {
      console.error('Invalid product ID:', product.product_id);
    }
  };
  
  

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="logo" />
        <p>FRESHFOOD</p>
      </div>
      <img 
        src={nav_dropdown} 
        alt="dropdown" 
        className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}
        onClick={() => setDropdownOpen(!dropdownOpen)} 
      />
      <ul className={`nav-menu ${dropdownOpen ? 'nav-menu-visible' : ''}`}>
        <li onClick={() => { setMenu("shop"); setDropdownOpen(false); }}>
          <Link to='/'>Shop</Link>{menu === "shop" ? <hr /> : <></>}
        </li>
        <li onClick={() => { setMenu("seafood"); setDropdownOpen(false); }}>
          <Link to='/seafood'>SeaFood</Link>{menu === "seafood" ? <hr /> : <></>}
        </li>
        <li onClick={() => { setMenu("meat"); setDropdownOpen(false); }}>
          <Link to='/meat'>Meat</Link>{menu === "meat" ? <hr /> : <></>}
        </li>
        <li onClick={() => { setMenu("vegetable"); setDropdownOpen(false); }}>
          <Link to='/vegetable'>Vegetable</Link>{menu === "vegetable" ? <hr /> : <></>}
        </li>
      </ul>
      <div className="nav-search-container">
        <input
          type="text"
          className="nav-search-input"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {searchQuery && (
          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <div key={product.product_id} className="search-result-item" onClick={() => handleResultClick(product)}>
                  <img src={`http://localhost:4000/uploads/${product.image_url}`} alt={product.product_name} className="search-result-image" />
                  <p className="search-result-name">{product.product_name}</p>
                </div>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        )}
      </div>
      <div className="nav-login-cart">
        {localStorage.getItem('auth-token') ? (
          <button onClick={() => { localStorage.removeItem('auth-token'); window.location.replace('/'); }}>
            Logout
          </button>
        ) : (
          <Link to='/login'>
            <button>Login</button>
          </Link>
        )}
        <Link to='/cart' className="nav-cart-link">
          <img src={cart_icon} alt="cart" />
          <div className="nav-cart-count">{getTotalCartItems()}</div>
        </Link>
        <Link to='/profile' className="nav-avatar-link">
          <img src={avatar_icon} alt="avatar" className="nav-avatar" />
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
