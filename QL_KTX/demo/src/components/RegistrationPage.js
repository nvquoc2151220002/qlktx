import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";
import "../css/RegistrationPage.css";

const RegistrationPage = () => {
  const { roomId } = useParams(); // Lấy roomId từ URL
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [studentImage, setStudentImage] = useState(null);
  const [student, setStudent] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "Nam",
    phone: "",
    email: "",
    school: "",
    department: "",
    graduation_date: ""
  });

  // Lấy thông tin phòng từ API
  useEffect(() => {
    axios.get(`http://localhost:8080/QL_KTX/api/getRoomById.php?room_id=${roomId}`)
      .then(response => setRoom(response.data))
      .catch(error => console.error("Lỗi khi lấy phòng:", error));
  }, [roomId]);

  // Xử lý khi người dùng nhập thông tin
  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setStudentImage(e.target.files[0]);
    }
  };

  // Gửi yêu cầu đăng ký
  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra tính hợp lệ của thông tin sinh viên
    if (!student.full_name || !student.date_of_birth || !student.phone || !student.email || !student.school || !student.department || !student.graduation_date) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (!/^[0-9]{10}$/.test(student.phone)) {
      alert("Số điện thoại không hợp lệ.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      alert("Email không hợp lệ.");
      return;
    }

    const formData = new FormData();
    Object.keys(student).forEach(key => {
      formData.append(key, student[key]);
    });
    formData.append('room_id', roomId);
    formData.append('room_number', room.room_number);
    formData.append('building', room.building);
    if (studentImage) {
      formData.append('student_image', studentImage);
    }

    axios.post("http://localhost:8080/api/registerStudent.php", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      if (response.data.error) {
        alert(response.data.message);
      } else {
        alert("Đăng ký thành công!");
        navigate("/"); // Quay về trang chủ sau khi đăng ký
      }
    })
    .catch(error => console.error("Lỗi khi đăng ký:", error));
  };

  return (
    <>
      <Navbar />
      <Breadcrumb />
      <div className="register-container">
        <h1>Đăng ký chỗ ở</h1>
        {room ? (
          <div className="room-info">
            <h2>Phòng {room.room_number} - {room.building}</h2>
            <p>Sức chứa: {room.capacity}</p>
            <p>Đang ở: {room.current_occupancy}/{room.capacity}</p>
            <p>Giá: {room.price.toLocaleString()} VNĐ</p>
          </div>
        ) : <p>Đang tải thông tin phòng...</p>}

        {/* Form nhập thông tin sinh viên */}
        <form onSubmit={handleSubmit}>
          <div className="student-photo-section">
          <label>Ảnh 3x4</label>
            {studentImage && (
              <img
                src={URL.createObjectURL(studentImage)}
                alt="Preview"
                className="photo-preview"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
            />
          </div>

          <div className="form-group">
            <label>Họ và tên:</label>
            <input type="text" name="full_name" required onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label>Ngày sinh:</label>
            <input type="date" name="date_of_birth" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Giới tính:</label>
            <select name="gender" onChange={handleChange}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số điện thoại:</label>
            <input type="text" name="phone" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Trường:</label>
            <input type="text" name="school" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Khoa:</label>
            <input type="text" name="department" required onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Ngày tốt nghiệp:</label>
            <input type="date" name="graduation_date" 
              value={student.graduation_date} onChange={handleChange} />
          </div>

          <button type="submit">Xác nhận đăng ký</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default RegistrationPage;
