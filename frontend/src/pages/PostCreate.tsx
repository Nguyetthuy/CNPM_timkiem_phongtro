import React, { useState } from 'react';
import { createPost } from '../api/post';
import { Request } from 'express';

const PostCreate: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Chỉ được upload tối đa 5 ảnh.');
      return;
    }
    setImages(prev => [...prev, ...files].slice(0, 5));
    setError('');
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !content) {
      setError('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }
    if (images.length > 5) {
      setError('Chỉ được upload tối đa 5 ảnh.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('note', note);
      images.forEach((img) => formData.append('images', img));
      await createPost(formData, token);
      setSuccess('Tạo bài đăng thành công!');
      setTitle('');
      setContent('');
      setNote('');
      setImages([]);
    } catch (err) {
      setError('Tạo bài đăng thất bại.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Tạo bài đăng mới</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Tiêu đề:</label><br />
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Nội dung:</label><br />
          <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%' }} rows={4} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Ghi chú:</label><br />
          <input value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Ảnh (tối đa 5):</label><br />
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
          <div style={{ marginTop: 8 }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <span>{img.name}</span>
                <button type="button" onClick={() => handleRemoveImage(idx)} style={{ marginLeft: 8 }}>Xóa</button>
              </div>
            ))}
          </div>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit" disabled={loading} style={{ background: '#1976d2', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4 }}>
          {loading ? 'Đang tạo...' : 'Tạo bài đăng'}
        </button>
      </form>
    </div>
  );
};

export default PostCreate; 