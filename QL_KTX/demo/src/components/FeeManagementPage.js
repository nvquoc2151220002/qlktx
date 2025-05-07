import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";
import "../css/FeeManagementPage.css";

const FeeManagementPage = () => {
  const [fees, setFees] = useState([]);
  const [newFee, setNewFee] = useState({ fee_type: "", amount: "" });
  const [editingFees, setEditingFees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFees = async () => {
    try {
      const response = await axios.get("http://localhost:8080/QL_KTX/api/getFees.php");
      if (response.data && !response.data.error) {
        setFees(response.data);
      } else {
        setError(response.data.message || "Lỗi khi tải danh sách phí");
      }
    } catch (error) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleAddFee = async () => {
    if (!newFee.fee_type || !newFee.amount) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/QL_KTX/api/addFee.php", newFee);
      if (!response.data.error) {
        setFees([response.data, ...fees]);
        setNewFee({ fee_type: "", amount: "" });
        alert("Thêm phí thành công!");
      } else {
        alert(response.data.message || "Lỗi khi thêm phí");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    }
  };

  const handleUpdateFee = async (feeId) => {
    const newAmount = editingFees[feeId];
    if (!newAmount) return;

    try {
      const response = await axios.post("http://localhost:8080/QL_KTX/api/updateFee.php", {
        fee_id: feeId,
        amount: newAmount
      });
      
      if (response.data.success) {
        setFees(fees.map(fee => 
          fee.fee_id === feeId ? { ...fee, amount: parseFloat(newAmount) } : fee
        ));
        alert("Cập nhật thành công!");
      } else {
        alert(response.data.message || "Lỗi khi cập nhật phí");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    }
  };

  const handleAmountChange = (feeId, value) => {
    setEditingFees({
      ...editingFees,
      [feeId]: value
    });
  };

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm("Bạn có chắc muốn xóa loại phí này?")) return;

    try {
      const response = await axios.post("http://localhost:8080/QL_KTX/api/deleteFee.php", {
        fee_id: feeId
      });
      
      if (response.data.success) {
        setFees(fees.filter(fee => fee.fee_id !== feeId));
        alert("Xóa phí thành công!");
      } else {
        alert(response.data.message || "Lỗi khi xóa phí");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <Navbar />
      <Breadcrumb />
      <div className="fee-container">
        <h1>Quản lý phí</h1>
        <table className="fee-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Loại phí</th>
              <th>Số tiền</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>-</td>
              <td>
                <input
                  type="text"
                  placeholder="Loại phí"
                  value={newFee.fee_type}
                  onChange={(e) => setNewFee({ ...newFee, fee_type: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Số tiền"
                  value={newFee.amount}
                  onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                />
              </td>
              <td>-</td>
              <td>
                <div className="button-container">
                  <div className="action-button">
                    <button className="add-btn" onClick={handleAddFee}>
                      Thêm
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            {fees.map((fee, index) => (
              <tr key={fee.fee_id}>
                <td>{index + 1}</td>
                <td>{fee.fee_type}</td>
                <td>
                  <input
                    type="number"
                    defaultValue={fee.amount}
                    onChange={(e) => handleAmountChange(fee.fee_id, e.target.value)}
                  />
                </td>
                <td>{fee.created_at}</td>
                <td>
                  <div className="button-container">
                    <div className="action-button">
                      <button
                        className="update-btn"
                        onClick={() => handleUpdateFee(fee.fee_id)}
                      >
                        Cập nhật
                      </button>
                    </div>
                    <div className="action-button">
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteFee(fee.fee_id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
};

export default FeeManagementPage;
