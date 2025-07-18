import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/auth';
import './AuthPages.css';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await registerApi(name, email, password);
      setSuccess('🎉 Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Đăng ký thất bại';
      setError(msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container">
        <h2 className="auth-title">Đăng Ký</h2>
        {error && <div className="auth-message error">{error}</div>}
        {success && <div className="auth-message success">{success}</div>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label className="auth-label">Tên</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="auth-input"
            placeholder="Tên đầy đủ"
            required
          />
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
            placeholder="Mật khẩu mạnh"
            required
          />
          <button
            type="submit"
            disabled={!name || !email || !password}
            className="auth-button"
          >
            Đăng ký
          </button>
        </form>
        <p style={{ marginTop: 24, width: '100%', textAlign: 'center' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" className="auth-link">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
