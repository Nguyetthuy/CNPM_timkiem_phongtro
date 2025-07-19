import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    setRole(localStorage.getItem('role'));
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setRole(null);
    window.location.href = '/login';
  };

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid gray', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/login" style={{ marginRight: 10 }}>Đăng nhập</Link>
        <Link to="/register" style={{ marginRight: 10 }}>Đăng ký</Link>
        <Link to="/search" style={{ marginRight: 10 }}>Tìm kiếm</Link>
        {isLoggedIn && <Link to="/create-post" style={{ marginRight: 10 }}>Tạo bài đăng</Link>}
        {role === 'admin' && <Link to="/admin" style={{ marginRight: 10 }}>Quản trị</Link>}
      </div>
      {isLoggedIn && (
        <div>
          <span style={{ marginRight: 10 }}>Xin chào, {role === 'admin' ? 'Admin' : 'User'}!</span>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer' }}>
            Đăng xuất
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;
