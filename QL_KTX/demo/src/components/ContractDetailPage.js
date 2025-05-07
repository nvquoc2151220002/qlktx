import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../css/ContractDetailPage.css";

const ContractDetailPage = () => {
  const [contract, setContract] = useState(null);
  const { studentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContractDetail();
  }, [studentId]);

  const fetchContractDetail = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/QL_KTX/api/getContractDetail.php?student_id=${studentId}`
      );
      if (response.data.success) {
        setContract(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching contract details:", error);
      alert("Có lỗi xảy ra khi lấy thông tin hợp đồng");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!contract) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="contract-detail-container">
        <div className="contract-header">
          <h2>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
          <h3>Độc lập - Tự do - Hạnh phúc</h3>
          <h1>HỢP ĐỒNG THUÊ CHỖ Ở NỘI TRÚ</h1>
          <p className="contract-semester">HỌC KỲ 2, NĂM HỌC 2024-2025</p>
          <p className="contract-number">Số: {contract.contract_id}/KTX.DAU-SV</p>
        </div>

        <div className="contract-content">
          <div className="contract-section">
            <h3>BÊN A: KÝ TÚC XÁ TRƯỜNG ĐẠI HỌC KIẾN TRÚC ĐÀ NẴNG</h3>
            <p>Ông: Nguyễn Văn Hưng</p>
            <p>Chức vụ: Tổ trưởng Tổ Quản lý KTX - PVCĐ</p>
            <p>Địa chỉ: 14 Doãn Uẫn, Khuê Mỹ, Ngũ Hành Sơn, TP.Đà Nẵng</p>
            <p>Điện thoại: 0236.3962.965</p>
          </div>

          <div className="contract-section">
            <h3>BÊN B: BÊN ĐĂNG KÝ NỘI TRÚ</h3>
            <div className="info-grid">
              <div className="info-group">
                <label>Sinh viên:</label>
                <p>{contract.full_name}</p>
              </div>
              <div className="info-group">
                <label>Lớp:</label>
                <p>{contract.class}</p>
              </div>
              <div className="info-group">
                <label>Khoa:</label>
                <p>{contract.department}</p>
              </div>
              <div className="info-group">
                <label>Trường:</label>
                <p>{contract.school}</p>
              </div>
              <div className="info-group">
                <label>CMND/CCCD:</label>
                <p>{contract.cmnd_cccd}</p>
              </div>
              <div className="info-group">
                <label>Ngày cấp:</label>
                <p>{contract.date_of_issue ? new Date(contract.date_of_issue).toLocaleDateString('vi-VN') : ''}</p>
              </div>
              <div className="info-group">
                <label>Nơi cấp:</label>
                <p>{contract.place_of_issue}</p>
              </div>
              <div className="info-group">
                <label>Hộ khẩu thường trú:</label>
                <p>{contract.permanent_residence}</p>
              </div>
              <div className="info-group">
                <label>Điện thoại:</label>
                <p>{contract.phone}</p>
              </div>
              <div className="info-group">
                <label>Email:</label>
                <p>{contract.email}</p>
              </div>
            </div>
          </div>

          <div className="contract-section">
            <h3>ĐIỀU I: ĐIỀU KHOẢN CHUNG</h3>
            <div className="info-grid">
              <div className="info-group">
                <label>Phòng số:</label>
                <p>{contract.room_number}</p>
              </div>
              <div className="info-group">
                <label>Khu KTX:</label>
                <p>{contract.building}</p>
              </div>
              <div className="info-group">
                <label>Thời gian:</label>
                <p>Từ ngày {new Date(contract.start_date).toLocaleDateString('vi-VN')} đến ngày {new Date(contract.end_date).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>

          <div className="contract-section">
            <h3>ĐIỀU III: ĐIỀU KHOẢN THANH TOÁN</h3>
            <table className="fee-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>NỘI DUNG</th>
                  <th>SỐ LƯỢNG</th>
                  <th>ĐƠN GIÁ (VNĐ)</th>
                  <th>THÀNH TIỀN (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Lệ phí KTX</td>
                  <td>1 tháng</td>
                  <td>{formatCurrency(contract.fees.dormitory_fee)}</td>
                  <td>{formatCurrency(contract.fees.dormitory_fee)}</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Tiền nước sinh hoạt</td>
                  <td>1 tháng</td>
                  <td>{formatCurrency(contract.fees.parking_fee)}</td>
                  <td>{formatCurrency(contract.fees.parking_fee)}</td>
                </tr>
                <tr className="total-row">
                  <td colSpan="4">TỔNG CỘNG:</td>
                  <td>{formatCurrency(contract.fees.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
      <Footer />
    </>
  );
};

export default ContractDetailPage;
