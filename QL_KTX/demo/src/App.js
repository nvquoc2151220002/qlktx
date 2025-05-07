import React, { useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import RegistrationPage from "./components/RegistrationPage";
import FinanceManagementPage from "./components/FinanceManagementPage";
import FeeManagementPage from "./components/FeeManagementPage";
import StudentManagementPage from "./components/StudentManagementPage";
import EditStudentPage from "./components/EditStudentPage";
import LoginPage from "./components/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import StudentDetailPage from "./components/StudentDetailPage";
import ContractDetailPage from "./components/ContractDetailPage";

function App() {
  useEffect(() => {
    // Gọi API cập nhật Database khi ứng dụng khởi động
    const updateDB = async () => {
      try {
        const response = await axios.get("http://localhost:8080/QL_KTX/api/updateDatabase.php");
        if (response.data.success) {
          console.log("Updated database:", response.data.updates);
        }
      } catch (error) {
        console.error("Error updating database:", error);
      }
    };

    updateDB();
  }, []);

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/:roomId" element={
            <PrivateRoute>
              <RegistrationPage />
            </PrivateRoute>
          } />
          <Route path="/finance" element={
            <PrivateRoute>
              <FinanceManagementPage />
            </PrivateRoute>
          } />
          <Route path="/finance/fee-management" element={
            <PrivateRoute>
              <FeeManagementPage />
            </PrivateRoute>
          } />
          <Route path="/students" element={
            <PrivateRoute>
              <StudentManagementPage />
            </PrivateRoute>
          } />
          <Route path="/students/student-detail/:studentId" element={
            <PrivateRoute>
              <StudentDetailPage />
            </PrivateRoute>
          } />
          <Route path="/students/student-detail/edit-student/:studentId" element={
            <PrivateRoute>
              <EditStudentPage />
            </PrivateRoute>
          } />
          <Route path="/students/student-detail/contract/:studentId" element={
            <PrivateRoute>
              <ContractDetailPage />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
