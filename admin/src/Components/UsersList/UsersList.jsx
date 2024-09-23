import React, { useEffect, useState } from 'react';
import './UsersList.css';

const UsersList = () => {
  const [allUsers, setAllUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/users');
      const data = await response.json();
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Hàm định dạng ngày tháng năm
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className='users-list'>
      <h1>All Users List</h1>
      <div className="userslist-format-main">
        <p>User ID</p>
        <p>Full Name</p>
        <p>Email</p>
        <p>Phone</p>
        <p>Address</p>
        <p>Role</p>
        <p>Created Time</p>
      </div>
      <div className="userslist-allusers">
        <hr />
        {allUsers.map((user) => (
          <React.Fragment key={user.user_id}>
            <div className="userslist-format-main userslist-format">
              <p>{user.user_id}</p>
              <p>{user.full_name}</p>
              <p>{user.email}</p>
              <p>{user.phone}</p>
              <p>{user.address}</p>
              <p>{user.role}</p> {/* Hiển thị thông tin role */}
              <p>{formatDate(user.created_at)}</p>
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
