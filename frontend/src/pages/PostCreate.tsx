import React, { useState } from 'react';
import { createPost, uploadImages } from '../api/post';
import { useNavigate } from 'react-router-dom';

const PostCreate: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      setError('Chỉ được upload tối đa 10 ảnh.');
      return;
    }
    setImages(prev => [...prev, ...files].slice(0, 10));
    
    // Tạo preview
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews].slice(0, 10));
    setError('');
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !content) {
      setError('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }
    if (images.length > 10) {
      setError('Chỉ được upload tối đa 10 ảnh.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      
      // Upload ảnh trước
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const imageFormData = new FormData();
        images.forEach(image => {
          imageFormData.append('images', image);
        });
        
        const uploadResult = await uploadImages(imageFormData, token);
        imageUrls = uploadResult.images.map((img: any) => img.url);
      }

      // Tạo bài đăng với ảnh (không cần gửi author, sẽ lấy từ JWT token)
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('note', note);
      imageUrls.forEach(url => {
        formData.append('images', url);
      });
      
      await createPost(formData, token);
      setSuccess('Tạo bài đăng thành công! Đang chuyển hướng...');
      
      // Redirect về trang cá nhân với parameter thành công
      setTimeout(() => {
        navigate('/profile?postCreated=true', { replace: true });
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Tạo bài đăng thất bại.';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ margin: 0, color: '#1976d2', fontSize: 28 }}>✏️ Tạo Bài Đăng Mới</h2>
          <button 
            onClick={() => navigate('/profile')}
            style={{ 
              background: '#f5f5f5', 
              color: '#666', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            ← Quay lại
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
              Tiêu đề:
            </label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: 12, 
                border: '1px solid #ddd', 
                borderRadius: 8,
                fontSize: 16
              }} 
              placeholder="Nhập tiêu đề bài đăng..."
              required
            />
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
              Nội dung:
            </label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: 12, 
                border: '1px solid #ddd', 
                borderRadius: 8,
                fontSize: 16,
                minHeight: 120,
                resize: 'vertical'
              }} 
              placeholder="Nhập nội dung bài đăng..."
              required
            />
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
              Ghi chú (tùy chọn):
            </label>
            <input 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: 12, 
                border: '1px solid #ddd', 
                borderRadius: 8,
                fontSize: 16
              }} 
              placeholder="Thêm ghi chú nếu cần..."
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
              Hình ảnh (tối đa 10 ảnh):
            </label>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageChange}
              style={{ 
                width: '100%', 
                padding: 12, 
                border: '1px solid #ddd', 
                borderRadius: 8,
                fontSize: 16
              }}
            />
            
            {previewImages.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#666' }}>Preview ảnh:</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {previewImages.map((preview, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{ 
                          width: 100, 
                          height: 100, 
                          objectFit: 'cover', 
                          borderRadius: 8,
                          border: '2px solid #e0e0e0'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div style={{ 
              background: '#ffebee', 
              color: '#c62828', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 16,
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              background: '#e8f5e8', 
              color: '#2e7d32', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 16,
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                flex: 1,
                background: loading ? '#ccc' : 'linear-gradient(135deg, #4caf50, #45a049)', 
                color: 'white', 
                padding: '16px 24px', 
                border: 'none', 
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 16,
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Đang tạo...' : 'Tạo Bài Đăng'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/profile')}
              style={{ 
                background: '#f5f5f5', 
                color: '#666', 
                border: 'none', 
                padding: '16px 24px', 
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreate; 