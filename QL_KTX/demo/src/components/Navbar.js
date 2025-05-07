import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <h2 className="logo">QL Ký Túc Xá</h2>
      <ul className="nav-links">
        <li><a href="/">Trang chủ</a></li>
        {user && (
          <>
            <li><a href="/finance">Quản lý tài chính</a></li>
            <li><a href="/students">Quản lý sinh viên</a></li>
          </>
        )}
        {user ? (
          <>
            <li><span className="username">{user.username}</span></li>
            <li><button className="logout-btn" onClick={handleLogout}>Đăng xuất</button></li>
          </>
        ) : (
          <li><a href="/login">Đăng nhập</a></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
