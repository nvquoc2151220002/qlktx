import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";
import "../css/FinanceManagementPage.css";

const FinanceManagementPage = () => {
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [searchParams, setSearchParams] = useState({
    studentName: '',
    room: '',
    status: ''
  });
  const navigate = useNavigate();

  const fetchAllStudents = () => {
    setStudents([]); // Clear existing results first
    axios.get("http://localhost:8080/QL_KTX/api/getAllStudentsFinance.php", { 
      params: searchParams 
    })
    .then(response => {
      setStudents(Array.isArray(response.data) ? response.data : []);
    })
    .catch(error => console.error("Lỗi khi lấy danh sách sinh viên:", error));
  };

  const fetchPaymentHistory = () => {
    axios.get("http://localhost:8080/QL_KTX/api/getPaymentHistory.php")
      .then(response => {
        setHistory(Array.isArray(response.data) ? response.data : []);
      })
      .catch(error => console.error("Lỗi khi lấy lịch sử thanh toán:", error));
  };

  useEffect(() => {
    fetchAllStudents();
    fetchPaymentHistory();
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault(); // Tránh cộng dồn kết quả tìm kiếm
    fetchAllStudents();
  };

  const handlePayment = (studentId) => {
    if (window.confirm("Xác nhận thu phí cho sinh viên này?")) {
      axios.post("http://localhost:8080/QL_KTX/api/confirmPayment.php", { student_id: studentId })
        .then(response => {
          if (response.data.success) {
            alert("Thu phí thành công!");
            fetchAllStudents();
            fetchPaymentHistory();
          } else {
            alert(response.data.message || "Lỗi khi thu phí");
          }
        })
        .catch(error => console.error("Lỗi khi thu phí:", error));
    }
  };

  const exportToExcel = () => {
    if (viewingHistory) {
      const historyData = history.map((record, index) => ({
        'STT': index + 1,
        'Ngày thực hiện': new Date(record.created_at).toLocaleString(),
        'Admin': record.admin_name,
        'Loại': record.module === 'payment' ? 'UPDATE' : 
                record.action_type === 'ADD' ? 'CREATE' : 
                record.action_type === 'DELETE' ? 'DELETE' : 
                'Khác',
        'Chi tiết': record.description
      }));

      const ws = XLSX.utils.json_to_sheet(historyData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Lịch sử tài chính");
      XLSX.writeFile(wb, `lich_su_tai_chinh_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    } else {
      const dataToExport = students.map((student, index) => ({
        'STT': index + 1,
        'Tên sinh viên': student.full_name,
        'Phòng': `${student.building}${student.room_number}`,
        'Ngày tạo đơn': student.issue_date ? new Date(student.issue_date).toLocaleDateString() : '-',
        'Hạn thanh toán': student.due_date ? new Date(student.due_date).toLocaleDateString() : '-',
        'Số tiền nợ': student.status === "Đã thanh toán" ? "0" : student.amount_due,
        'Trạng thái': student.status || 'Đã thanh toán'
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách tài chính");
      XLSX.writeFile(wb, `danh_sach_tai_chinh_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    }
  };

  return (
    <>
      <Navbar />
      <Breadcrumb />
      <div className="finance-container">
        <h1>Quản lý tài chính</h1>
        <div className="finance-header">
          <button className="fee-management-btn" onClick={() => navigate("/finance/fee-management")}>
            🏦 Quản lý phí
          </button>
          <button className="history-toggle-btn" onClick={() => setViewingHistory(!viewingHistory)}>
            {viewingHistory ? "Quay lại" : "Lịch sử quản lý tài chính"}
          </button>
          <button className="export-btn" onClick={exportToExcel}>
            Xuất Excel
          </button>
        </div>

        {!viewingHistory ? (
          <>
            <div className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Tên sinh viên..."
                value={searchParams.studentName}
                onChange={(e) => setSearchParams({ ...searchParams, studentName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Số phòng..."
                value={searchParams.room}
                onChange={(e) => setSearchParams({ ...searchParams, room: e.target.value })}
              />
              <select
                value={searchParams.status}
                onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Quá hạn">Quá hạn</option>
              </select>
              <button className="search-btn" onClick={handleSearch}>Tìm kiếm</button>
            </div>

            <h2>Danh sách sinh viên</h2>
            <table className="finance-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sinh viên</th>
                  <th>Phòng</th>
                  <th>Ngày tạo đơn</th>
                  <th>Hạn thanh toán</th>
                  <th>Số tiền nợ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.student_id} className={student.status === "Quá hạn" ? "overdue" : ""}>
                    <td>{index + 1}</td>
                    <td>{student.full_name}</td>
                    <td>{student.building}{student.room_number}</td>
                    <td>{student.issue_date ? new Date(student.issue_date).toLocaleDateString() : '-'}</td>
                    <td>{student.due_date ? new Date(student.due_date).toLocaleDateString() : '-'}</td>
                    <td>{student.status === "Đã thanh toán" ? "0" : student.amount_due?.toLocaleString()} VNĐ</td>
                    <td className={`status ${(student.status || '').toLowerCase()}`}>
                      {student.status || 'Đã thanh toán'}
                    </td>
                    <td>
                      {(student.status === "Chưa thanh toán" || student.status === "Quá hạn") && (
                        <button className="pay-btn" onClick={() => handlePayment(student.student_id)}>
                          ✅ Thu phí
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <h2>Lịch sử quản lý tài chính</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Ngày thực hiện</th>
                  <th>Admin</th>
                  <th>Loại</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.log_id}>
                    <td>{new Date(record.created_at).toLocaleString()}</td>
                    <td>{record.admin_name}</td>
                    <td>{record.module === 'payment' ? 'UPDATE' : 
                         record.action_type === 'ADD' ? 'CREATE' : 
                         record.action_type === 'DELETE' ? 'DELETE' : 
                         'Khác'}</td>
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

export default FinanceManagementPage;
