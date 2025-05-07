import React from "react";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Liên hệ</h3>
          <p>📞 Hotline: 0814 298 xxx</p>
          <p>📧 Email: quoc_xxxxxxxxxx@dau.edu.vn</p>
          <p>🏢 Địa chỉ: 14 Doãn Uẩn - Khuê Mỹ - Ngũ Hành Sơn - TP.Đà Nẵng</p>
        </div>
        <div className="footer-section">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/rooms">Xem phòng</a></li>
            <li><a href="/register">Đăng ký</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Theo dõi chúng tôi</h3>
          <div className="social-links">
            <a href="#facebook">Facebook</a>
            <a href="#twitter">Twitter</a>
            <a href="#instagram">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Ký Túc Xá. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
