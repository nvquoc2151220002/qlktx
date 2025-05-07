import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import "../css/StudentManagementPage.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const StudentManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    name: "",
    room: "",
    school: "",
    department: "",
    status: "",
    contractStatus: ""
  });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchHistory();
  }, [currentPage]); // Xóa filters khỏi dependency array

  const fetchStudents = () => {
    axios
      .get("http://localhost:8080/QL_KTX/api/getStudents.php", { 
        params: {
          ...filters,
          page: currentPage,
          limit: itemsPerPage
        } 
      })
      .then((response) => {
        setStudents(response.data.students);
        setTotalStudents(response.data.total);
      })
      .catch((error) => console.error("Lỗi khi lấy danh sách sinh viên:", error));
  };

  const fetchHistory = () => {
    axios
      .get("http://localhost:8080/QL_KTX/api/getStudentHistory.php")
      .then((response) => setHistory(response.data))
      .catch((error) => console.error("Lỗi khi lấy lịch sử:", error));
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleDelete = (student) => {
    if (student.contract_status === "Hiệu lực") {
      const reason = prompt("Sinh viên có hợp đồng đang hiệu lực. Vui lòng nhập lý do xóa:");
      if (!reason) return;

      axios
        .post("http://localhost:8080/QL_KTX/api/deleteStudent.php", { 
          student_id: student.student_id,
          reason: reason 
        })
        .then((response) => {
          if (response.data.success) {
            showNotification("Xóa sinh viên thành công!", "success");
            fetchStudents();
            fetchHistory(); 
          } else {
            alert(response.data.error);
          }
        })
        .catch((error) => console.error("Lỗi khi xóa sinh viên:", error));
    } else if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
      axios
        .post("http://localhost:8080/QL_KTX/api/deleteStudent.php", { 
          student_id: student.student_id 
        })
        .then((response) => {
          if (response.data.success) {
            showNotification("Xóa sinh viên thành công!", "success");
            fetchStudents();
            fetchHistory(); 
          } else {
            alert(response.data.error);
          }
        })
        .catch((error) => console.error("Lỗi khi xóa sinh viên:", error));
    }
  };

  const handleRenewal = (studentId) => {
    if (window.confirm("Bạn có chắc chắn muốn gia hạn hợp đồng này?")) {
      axios
        .post("http://localhost:8080/QL_KTX/api/renewContract.php", { 
          student_id: studentId 
        })
        .then((response) => {
          if (response.data.success) {
            showNotification("Gia hạn hợp đồng thành công!", "success");
            fetchStudents();
            fetchHistory(); 
          } else {
            alert(response.data.error);
          }
        })
        .catch((error) => console.error("Lỗi khi gia hạn hợp đồng:", error));
    }
  };

  const exportToExcel = () => {
    if (viewingHistory) {
      const historyData = history.map(record => ({
        'Ngày thực hiện': new Date(record.created_at).toLocaleString(),
        'Admin': record.admin_name,
        'Hành động': record.action_type,
        'Chi tiết': record.description
      }));
      const ws = XLSX.utils.json_to_sheet(historyData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "History");
      XLSX.writeFile(wb, "lich_su_quan_ly_sinh_vien.xlsx");
    } else {
      const studentData = students.map((student, index) => ({
        'STT': (currentPage - 1) * itemsPerPage + index + 1,
        'Họ tên': student.full_name,
        'Phòng': student.building + student.room_number,
        'Tình trạng tốt nghiệp': student.status,
        'Ngày bắt đầu': new Date(student.start_date).toLocaleDateString('vi-VN'),
        'Ngày kết thúc': new Date(student.end_date).toLocaleDateString('vi-VN'),
        'Trạng thái hợp đồng': student.contract_status
      }));
      const ws = XLSX.utils.json_to_sheet(studentData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(wb, "danh_sach_sinh_vien.xlsx");
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = () => {
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    fetchStudents();
  };

  return (
    <>
      <Navbar />
      <Breadcrumb />
      <div className="student-management-container">
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        <div className="page-header">
          <h1>Quản lý Sinh viên</h1>
          <div className="header-actions">
            <button className="export-btn" onClick={exportToExcel}>Xuất Excel</button>
            <button className="history-toggle-btn" onClick={() => setViewingHistory(!viewingHistory)}>
              {viewingHistory ? "Quay lại" : "Lịch sử quản lý sinh viên"}
            </button>
          </div>
        </div>

        {!viewingHistory ? (
          <>
            <div className="filters">
              <div className="search-inputs">
                <input type="text" placeholder="Nhập tên sinh viên" value={filters.name} 
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
                <input type="text" placeholder="Nhập số phòng" value={filters.room} 
                  onChange={(e) => setFilters({ ...filters, room: e.target.value })} />
                <input type="text" placeholder="Nhập trường" value={filters.school} 
                  onChange={(e) => setFilters({ ...filters, school: e.target.value })} />
                <input type="text" placeholder="Nhập khoa" value={filters.department} 
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })} />
                <select value={filters.status} 
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="">Tất cả</option>
                  <option value="Đang học">Đang học</option>
                  <option value="Đã tốt nghiệp">Đã tốt nghiệp</option>
                  <option value="Bị đình chỉ">Bị đình chỉ</option>
                </select>
                <select value={filters.contractStatus} 
                  onChange={(e) => setFilters({ ...filters, contractStatus: e.target.value })}>
                  <option value="">Tất cả hợp đồng</option>
                  <option value="Hiệu lực">Hiệu lực</option>
                  <option value="Hết hạn">Hết hạn</option>
                </select>
              </div>
              <button className="search-btn" onClick={handleSearch}>Tìm kiếm</button>
            </div>

            <div className="total-students">
              Tổng sinh viên: {totalStudents}
            </div>

            <h2>Danh sách sinh viên</h2>

            <table className="student-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>Phòng</th>
                  <th>Tình trạng tốt nghiệp</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái hợp đồng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.student_id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{student.full_name}</td>
                    <td>{student.building}{student.room_number}</td>
                    <td>{student.status || "Chưa cập nhật"}</td>
                    <td>{new Date(student.start_date).toLocaleDateString('vi-VN')}</td>
                    <td>{new Date(student.end_date).toLocaleDateString('vi-VN')}</td>
                    <td className={student.contract_status === "Hiệu lực" ? "active" : "expired"}>
                      {student.contract_status || "Chưa có hợp đồng"}
                    </td>
                    <td>
                      <div className="button-container">
                        <div className="action-button">
                          <button className="edit-btn" onClick={() => navigate(`/students/student-detail/${student.student_id}`)}>Xem thông tin</button>
                        </div>
                        {student.contract_status === "Hết hạn" && (
                          <div className="action-button">
                            <button className="renew-btn" onClick={() => handleRenewal(student.student_id)}>Gia hạn</button>
                          </div>
                        )}
                        <div className="action-button">
                          <button className="delete-btn" onClick={() => handleDelete(student)}>Xóa</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              {Array.from({ length: Math.ceil(totalStudents / itemsPerPage) }).map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={currentPage === index + 1 ? 'active' : ''}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>Lịch sử quản lý sinh viên</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Ngày thực hiện</th>
                  <th>Admin</th>
                  <th>Hành động</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.log_id}>
                    <td>{new Date(record.created_at).toLocaleString()}</td>
                    <td>{record.admin_name}</td>
                    <td>{record.action_type}</td>
                    <td>{record.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default StudentManagementPage;
