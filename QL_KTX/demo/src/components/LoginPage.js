import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../css/LoginPage.css";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  useEffect(() => {
    // Nếu đã đăng nhập, chuyển về trang chủ
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/QL_KTX/api/login.php", credentials);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert(response.data.message);
        
        // Điều hướng đến trang được yêu cầu trước đó hoặc trang chủ
        const from = location.state?.from || '/';
        navigate(from);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <h1>Đăng nhập</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            required
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            required
            onChange={handleChange}
          />
          <button type="submit">Đăng nhập</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;