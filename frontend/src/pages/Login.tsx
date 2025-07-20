// frontend/src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/auth';
import './AuthPages.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      
      // Redirect dựa trên role
      if (response.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Đăng nhập thất bại';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container">
        <h2 className="auth-title">Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
            style={{ 
              background: loading ? '#ccc' : undefined,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16 }}>
          Chưa có tài khoản?{' '}
          <button 
            onClick={() => navigate('/register')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#1976d2', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Đăng ký ngay
          </button>
        </p>
        
        {/* Admin credentials hint */}
        <div style={{ 
          marginTop: 20, 
          padding: 12, 
          background: '#f5f5f5', 
          borderRadius: 8,
          fontSize: 14,
          color: '#666'
        }}>
          <strong>Admin:</strong> admin@gmail.com / 12345
        </div>
      </div>
    </div>
  );
};

export default Login;
