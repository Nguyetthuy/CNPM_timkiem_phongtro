// frontend/src/pages/Login.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../api/auth';
import './AuthPages.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginApi(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role); // Lưu role
      onLogin();
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/create-post');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Đăng nhập thất bại';
      setError(msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container">
        <h2 className="auth-title">Đăng Nhập</h2>
        {error && <div className="auth-message error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label className="auth-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@example.com"
            required
          />
          <label className="auth-label">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="auth-input"
            placeholder="Nhập mật khẩu"
            required
          />
          <button
            type="submit"
            className="auth-button"
          >
            Đăng nhập
          </button>
        </form>
        <p style={{ marginTop: 24, width: '100%', textAlign: 'center' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" className="auth-link">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
