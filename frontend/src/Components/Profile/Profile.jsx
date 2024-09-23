import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const navigate = useNavigate(); // Hook để điều hướng

  useEffect(() => {
    // Fetch user information
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const response = await axios.get('http://localhost:4000/user', {
          headers: { 'auth-token': token }
        });
        setUser(response.data);
        setFormData({
          full_name: response.data.full_name,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      await axios.put('http://localhost:4000/user', formData, {
        headers: { 'auth-token': token }
      });
      setUser(formData);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      {editMode ? (
        <div className="profile-form">
          <div>
            <label>Full Name:</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="profile-buttons">
            <button onClick={handleSave}>Save</button>
            <button className="cancel" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="profile-info">
          <div className="info-item">
            <label>Full Name:</label>
            <p className="info-value">{user.full_name}</p>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <p className="info-value">{user.email}</p>
          </div>
          <div className="info-item">
            <label>Phone:</label>
            <p className="info-value">{user.phone}</p>
          </div>
          <div className="info-item">
            <label>Address:</label>
            <p className="info-value">{user.address}</p>
          </div>
          <button className="edit" onClick={() => setEditMode(true)}>Edit</button>
          <Link to={'/orders'}>
            <button className="view-orders">View My Orders</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Profile;
