import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import "../css/Breadcrumb.css";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Map của đường dẫn URL với tên hiển thị
  const breadcrumbNameMap = {
    'finance': 'Quản lý tài chính',
    'fee-management': 'Quản lý phí',
    'students': 'Quản lý sinh viên',
    'student-detail': 'Chi tiết sinh viên',
    'edit-student': 'Chỉnh sửa sinh viên',
    'register': 'Đăng ký phòng',
  };

  const isNumeric = (str) => {
    return !isNaN(str) && !isNaN(parseFloat(str));
  };

  return (
    <div className="breadcrumb">
      <Link to="/">Trang chủ</Link>
      {pathnames.map((name, index) => {
        // Skip numeric IDs in the breadcrumb display
        if (isNumeric(name)) return null;

        const routeTo = pathnames.slice(0, index + 1).join('/');
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={name}>
            <span className="separator">/</span>
            {isLast ? (
              <span className="current">{breadcrumbNameMap[name] || name}</span>
            ) : (
              <Link to={`/${routeTo}`}>{breadcrumbNameMap[name] || name}</Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumb;