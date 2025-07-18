import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, []);
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid gray' }}>
      <Link to="/login" style={{ marginRight: 10 }}>Đăng nhập</Link>
      <Link to="/register" style={{ marginRight: 10 }}>Đăng ký</Link>
      <Link to="/search" style={{ marginRight: 10 }}>Tìm kiếm</Link>
      {role === 'user' && <Link to="/create-post">Đăng bài</Link>}
    </nav>
  );
};

export default Header;
