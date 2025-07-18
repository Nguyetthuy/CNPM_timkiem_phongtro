import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <nav style={{ padding: '10px', borderBottom: '1px solid gray' }}>
    <Link to="/login" style={{ marginRight: 10 }}>Đăng nhập</Link>
    <Link to="/register" style={{ marginRight: 10 }}>Đăng ký</Link>
    <Link to="/search">Tìm kiếm</Link>
  </nav>
);

export default Header;
