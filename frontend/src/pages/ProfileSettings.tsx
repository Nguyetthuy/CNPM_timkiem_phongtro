import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    getProfile(token).then(data => {
      setForm({ ...form, name: data.name, email: data.email, phone: data.phone || '', oldPassword: '', newPassword: '' });
      setLoading(false);
    }).catch(() => {
      setError('Không thể tải thông tin hồ sơ');
      setLoading(false);
    });
    // eslint-disable-next-line
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const token = localStorage.getItem('token') || '';
    try {
      await updateProfile(form, token);
      setSuccess('Cập nhật hồ sơ thành công!');
      setForm({ ...form, oldPassword: '', newPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', padding: 40 }}>
      <div style={{ maxWidth: 500, margin: '0 auto', background: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(25,118,210,0.08)', padding: 32 }}>
        <h2 style={{ color: '#1976d2', textAlign: 'center', marginBottom: 24 }}>👤 Quản lý Hồ sơ</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: 'bold', textAlign: 'left', display: 'block', marginBottom: 8 }}>Tên:</label>
          <input name="name" value={form.name} onChange={handleChange} className="auth-input" style={{ marginBottom: 16, textAlign: 'left' }} required />
          <label style={{ fontWeight: 'bold', textAlign: 'left', display: 'block', marginBottom: 8 }}>Email:</label>
          <input name="email" value={form.email} onChange={handleChange} className="auth-input" style={{ marginBottom: 16, textAlign: 'left' }} required type="email" />
          <label style={{ fontWeight: 'bold', textAlign: 'left', display: 'block', marginBottom: 8 }}>Số điện thoại:</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="auth-input" style={{ marginBottom: 16, textAlign: 'left' }} />
          <label style={{ fontWeight: 'bold', textAlign: 'left', display: 'block', marginBottom: 8 }}>Đổi mật khẩu:</label>
          <input name="oldPassword" value={form.oldPassword} onChange={handleChange} className="auth-input" style={{ marginBottom: 8, textAlign: 'left' }} type="password" placeholder="Mật khẩu cũ" autoComplete="current-password" />
          <input name="newPassword" value={form.newPassword} onChange={handleChange} className="auth-input" style={{ marginBottom: 16, textAlign: 'left' }} type="password" placeholder="Mật khẩu mới" autoComplete="new-password" />
          {error && <div style={{ color: '#d32f2f', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: '#388e3c', marginBottom: 12, textAlign: 'center' }}>{success}</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="submit" className="auth-button" style={{ flex: 1 }}>Lưu thay đổi</button>
            <button type="button" className="auth-button" style={{ flex: 1, background: '#f5f5f5', color: '#1976d2' }} onClick={() => navigate('/profile')}>← Quay lại trang cá nhân</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings; 