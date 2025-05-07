import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/StudentDetailPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const StudentDetailPage = () => {
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
    image_url: "",
    room_number: "",
    building: "",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:8080/QL_KTX/api/getStudentDetail.php?student_id=${studentId}`)
      .then((response) => setStudent(response.data))
      .catch((error) => console.error("Lỗi khi tải thông tin sinh viên:", error));
  }, [studentId]);

  return (
    <>
      <Navbar />
      <Breadcrumb />
      <div className="student-detail-container">
        <h1>Thông tin sinh viên</h1>
        <div className="student-photo">
          <img
            src={student.image_url ? student.image_url : "/images/person.jpg"}
            alt="Ảnh sinh viên"
            className="photo-3x4"
          />
        </div>
        <div className="student-info">
          <div className="info-group">
            <label>Họ và tên:</label>
            <p>{student.full_name}</p>
          </div>

          <div className="info-group">
            <label>Ngày sinh:</label>
            <p>{new Date(student.date_of_birth).toLocaleDateString()}</p>
          </div>

          <div className="info-group">
            <label>Giới tính:</label>
            <p>{student.gender}</p>
          </div>

          <div className="info-group">
            <label>Số điện thoại:</label>
            <p>{student.phone}</p>
          </div>

          <div className="info-group">
            <label>Email:</label>
            <p>{student.email}</p>
          </div>

          <div className="info-group">
            <label>Trường:</label>
            <p>{student.school}</p>
          </div>

          <div className="info-group">
            <label>Khoa:</label>
            <p>{student.department}</p>
          </div>

          <div className="info-group">
            <label>Ngày tốt nghiệp:</label>
            <p>{student.graduation_date ? new Date(student.graduation_date).toLocaleDateString() : "Chưa cập nhật"}</p>
          </div>

          <div className="info-group">
            <label>Tình trạng:</label>
            <p>{student.status}</p>
          </div>

          <div className="info-group">
            <label>Phòng:</label>
            <p>{student.building}{student.room_number}</p>
          </div>
        </div>
        <div className="button-group">
          <button 
            className="edit-btn" 
            onClick={() => navigate(`/students/student-detail/edit-student/${studentId}`)}
          >
            Cập nhật thông tin
          </button>
          <button 
            className="view-contract-btn" 
            onClick={() => navigate(`/students/student-detail/contract/${studentId}`)}
          >
            Xem hợp đồng
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentDetailPage;