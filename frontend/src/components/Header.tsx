import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    setRole(localStorage.getItem('role'));
    setIsLoggedIn(!!localStorage.getItem('token'));
    
    // Kiểm tra thông báo mới
    const checkNotifications = () => {
      const notifications = JSON.parse(localStorage.getItem('postNotifications') || '[]');
      const userNotifications = notifications.filter((n: any) => n.type === 'approved');
      setNotificationCount(userNotifications.length);
    };
    
    checkNotifications();
    
    // Lắng nghe thay đổi localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'postNotifications') {
        checkNotifications();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('postNotifications');
    setIsLoggedIn(false);
    setRole(null);
    setNotificationCount(0);
    window.location.href = '/login';
  };

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid gray', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/login" style={{ marginRight: 10 }}>Đăng nhập</Link>
        <Link to="/register" style={{ marginRight: 10 }}>Đăng ký</Link>
        <Link to="/search" style={{ marginRight: 10 }}>Tìm kiếm</Link>
        {isLoggedIn && <Link to="/create-post" style={{ marginRight: 10 }}>Tạo bài đăng</Link>}
        {isLoggedIn && role !== 'admin' && <Link to="/profile" style={{ marginRight: 10 }}>Trang cá nhân</Link>}
        {role === 'admin' && <Link to="/admin" style={{ marginRight: 10 }}>Quản trị</Link>}
      </div>
      {isLoggedIn && (
        <div>
          <span style={{ marginRight: 10 }}>Xin chào, {role === 'admin' ? 'Admin' : 'User'}!</span>
          {notificationCount > 0 && role !== 'admin' && (
            <Link to="/profile" style={{ 
              marginRight: 10, 
              position: 'relative',
              textDecoration: 'none',
              color: '#1976d2',
              fontWeight: 'bold'
            }}>
              Trang cá nhân
              <span style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: '#f44336',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                animation: 'pulse 1s infinite'
              }}>
                {notificationCount}
              </span>
            </Link>
          )}
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer' }}>
            Đăng xuất
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Header;
