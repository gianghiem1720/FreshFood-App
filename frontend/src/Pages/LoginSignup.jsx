import React, { useState, useEffect } from 'react';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "" // Thêm email vào formData
  });
  const [signupSuccess, setSignupSuccess] = useState(false); // Trạng thái thông báo đăng ký thành công

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        localStorage.setItem('auth-token', responseData.token);
        window.location.replace("/");
      } else {
        alert(responseData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

  const signup = async () => {
    try {
      const response = await fetch('http://localhost:4000/register', { 
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSignupSuccess(true); // Đặt trạng thái đăng ký thành công
        setState("Login"); // Chuyển về trạng thái đăng nhập
      } else {
        alert(responseData.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup');
    }
  };

  // Hiển thị thông báo đăng ký thành công nếu có
  useEffect(() => {
    if (signupSuccess) {
      alert('Registration successful! Please log in.');
      setSignupSuccess(false); // Đặt lại trạng thái sau khi thông báo đã được hiển thị
    }
  }, [signupSuccess]);

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" ? 
            <input name="full_name" value={formData.full_name} onChange={changeHandler} type="text" placeholder='Your Name' /> 
            : null
          }
          <input name='username' value={formData.username} onChange={changeHandler} type="text" placeholder='Your Username' />
          <input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Password' />
          {state === "Sign Up" ? 
            <input name="email" value={formData.email} onChange={changeHandler} type="email" placeholder='Your Email' /> 
            : null
          }
        </div>
        <button onClick={() => { state === "Login" ? login() : signup() }}>Continue</button>
        {state === "Sign Up" ? 
          <p className="loginsignup-login">
            Already have an account? <span onClick={() => { setState("Login") }}>Login here</span>
          </p> 
          : 
          <p className="loginsignup-login">
            Create an account? <span onClick={() => { setState("Sign Up") }}>Click here</span>
          </p>
        }
        <div className="loginsignup-agree">
          <input type="checkbox" name='' id='' />
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
