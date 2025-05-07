import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/EditStudentPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const EditStudentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    school: "",
    department: "",
    graduation_date: "",
    status: "",
    image_url: ""
  });
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/QL_KTX/api/getStudentDetail.php?student_id=${studentId}`)
      .then((response) => {
        setStudent({
          ...response.data,
          student_id: studentId
        });
      })
      .catch((error) => console.error("Lỗi khi tải dữ liệu sinh viên:", error));
  }, [studentId]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Add all student data to formData
    Object.keys(student).forEach(key => {
      formData.append(key, student[key]);
    });

    // Add new image if selected
    if (newImage) {
      formData.append('new_image', newImage);
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/QL_KTX/api/updateStudent.php",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert("Cập nhật thành công!");
        navigate("/students");
      } else {
        alert(response.data.error);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
    }
  };

  return (
    <>
      <Navbar />
      <Breadcrumb />
      <div className="edit-student-container">
        <h1>Cập nhật thông tin sinh viên</h1>
        <form onSubmit={handleSubmit}>
          <div className="student-photo-section">
            <img
              src={newImage ? URL.createObjectURL(newImage) : (student.image_url || "/images/person.jpg")}
              alt="Ảnh sinh viên"
              className="photo-preview"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
            />
          </div>

          <div className="form-row">
            <label>Họ và tên:</label>
            <input type="text" name="full_name" value={student.full_name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Ngày sinh:</label>
            <input type="date" name="date_of_birth" value={student.date_of_birth} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Giới tính:</label>
            <select name="gender" value={student.gender} onChange={handleChange} required>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="form-row">
            <label>Số điện thoại:</label>
            <input type="text" name="phone" value={student.phone} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Email:</label>
            <input type="email" name="email" value={student.email} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Trường:</label>
            <input type="text" name="school" value={student.school} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Khoa:</label>
            <input type="text" name="department" value={student.department} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Ngày tốt nghiệp:</label>
            <input type="date" name="graduation_date" value={student.graduation_date} onChange={handleChange} />
          </div>

          <div className="form-row">
            <label>Tình trạng:</label>
            <select name="status" value={student.status} onChange={handleChange} required>
              <option value="Đang học">Đang học</option>
              <option value="Đã tốt nghiệp">Đã tốt nghiệp</option>
              <option value="Bị đình chỉ">Bị đình chỉ</option>
            </select>
          </div>

          <button type="submit" className="save-btn">Lưu thay đổi</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default EditStudentPage;
