import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../css/HomePage.css";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchParams, setSearchParams] = useState({
    building: "",
    roomNumber: "",
    status: ""
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
    fetchInitialRooms();
  }, []);

  const fetchInitialRooms = async () => {
    try {
      const response = await axios.get("http://localhost:8080/QL_KTX/api/getRooms.php");
      setRooms(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng:", error);
    }
  };

  const handleSearch = () => {
    axios
      .get("http://localhost:8080/QL_KTX/api/searchRooms.php", { params: searchParams })
      .then((response) => setRooms(response.data))
      .catch((error) => console.error("Lỗi khi tìm kiếm phòng:", error));
  };

  const handleNavigation = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: path } });
    }
  };

  const getDefaultRoomImage = (building) => {
    const images = {
      'A': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500',
      'B': 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500',
      'C': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500',
      'D': 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500',
    };
    return images[building] || images['A'];
  };

  const groupRoomsByBuilding = (rooms) => {
    return rooms.reduce((acc, room) => {
      const building = room.building;
      if (!acc[building]) {
        acc[building] = [];
      }
      acc[building].push(room);
      return acc;
    }, {});
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        <h1 className="home-title">🏠 Hệ thống quản lý Ký túc xá</h1>
        <p className="home-subtitle">
          Hỗ trợ tìm kiếm, Đăng ký chỗ ở nhanh chóng, quản lý sinh viên và tài chính một cách dễ dàng.
        </p>

        <div className="search-form">
          <input
            type="text"
            placeholder="Nhập khu nhà..."
            value={searchParams.building}
            onChange={(e) => setSearchParams({ ...searchParams, building: e.target.value })}
          />
          <input
            type="text"
            placeholder="Nhập số phòng..."
            value={searchParams.roomNumber}
            onChange={(e) => setSearchParams({ ...searchParams, roomNumber: e.target.value })}
          />
          <select
            value={searchParams.status}
            onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Còn trống">Còn trống</option>
            <option value="Đã đầy">Đã đầy</option>
            <option value="Bảo trì">Bảo trì</option>
          </select>
          <button className="search-button" onClick={handleSearch}>🔍 Tìm kiếm</button>
        </div>

        <div className="building-section">
          <h2 className="building-section-title">👨 Khu Nam</h2>
          <div className="room-list">
            {rooms
              .filter(room => ['A', 'B'].includes(room.building))
              .map((room) => (
                <div key={room.room_id} className="room-card">
                  <img 
                    src={getDefaultRoomImage(room.building)} 
                    alt={`Phòng ${room.building}${room.room_number}`} 
                    className="room-image"
                  />
                  <h3>Phòng {room.building}{room.room_number}</h3>
                  <p>Sức chứa: {room.capacity}</p>
                  <p>Đang ở: {room.current_occupancy}/{room.capacity}</p>
                  <p>Giá: {room.price.toLocaleString()} VNĐ</p>
                  <p className={`status ${room.status === "Còn trống" ? "available" : "full"}`}>
                    {room.status}
                  </p>
                  {room.status === "Còn trống" && (
                    <button 
                      className="register-btn" 
                      onClick={() => handleNavigation(`/register/${room.room_id}`)}
                    >
                      Đăng ký ở
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="building-section">
          <h2 className="building-section-title">👩 Khu Nữ</h2>
          <div className="room-list">
            {rooms
              .filter(room => ['C', 'D'].includes(room.building))
              .map((room) => (
                <div key={room.room_id} className="room-card">
                  <img 
                    src={getDefaultRoomImage(room.building)} 
                    alt={`Phòng ${room.building}${room.room_number}`} 
                    className="room-image"
                  />
                  <h3>Phòng {room.building}{room.room_number}</h3>
                  <p>Sức chứa: {room.capacity}</p>
                  <p>Đang ở: {room.current_occupancy}/{room.capacity}</p>
                  <p>Giá: {room.price.toLocaleString()} VNĐ</p>
                  <p className={`status ${room.status === "Còn trống" ? "available" : "full"}`}>
                    {room.status}
                  </p>
                  {room.status === "Còn trống" && (
                    <button 
                      className="register-btn" 
                      onClick={() => handleNavigation(`/register/${room.room_id}`)}
                    >
                      Đăng ký ở
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
