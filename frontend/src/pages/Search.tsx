// ===============================
// frontend/src/pages/Search.tsx
// ===============================
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuthPages.css';
import { getApprovedPosts, searchPosts } from '../api/post';
import { getUserById } from '../api/auth';
import { FaSpinner } from 'react-icons/fa';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  note?: string;
  images?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  price?: number; // Added price field
  location?: string; // Added location field
}

interface User {
  name: string;
  email: string;
}

// Utility function để format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [filteredResults, setFilteredResults] = useState<Post[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [modalImg, setModalImg] = useState<string | null>(null);

  useEffect(() => {
    handleFilterSearch(1);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Lọc theo từ khóa mỗi khi query hoặc results thay đổi
    if (!query) {
      setFilteredResults(results);
    } else {
      const q = query.toLowerCase();
      setFilteredResults(
        results.filter(
          item =>
            item.title?.toLowerCase().includes(q) ||
            item.content?.toLowerCase().includes(q) ||
            item.note?.toLowerCase().includes(q) ||
            (item.authorId && userNames[item.authorId]?.toLowerCase().includes(q))
        )
      );
    }
  }, [query, results, userNames]);

  const handleFilterSearch = async (newPage = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const filters: any = {};
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;
      if (location) filters.location = location;
      filters.page = newPage;
      filters.limit = limit;
      filters.status = 'approved'; // Chỉ lấy bài đã duyệt
      const data = await searchPosts(filters);
      setResults(data.results);
      setTotal(data.total);
      setPage(data.page);
      // Lấy tên user cho các authorId duy nhất
      const userIds: string[] = Array.from(new Set(data.results.map((item: Post) => item.authorId)));
      const userNamesMap: Record<string, string> = {};
      await Promise.all(userIds.map(async (id) => {
        if (id) {
          try {
            const user = await getUserById(id);
            userNamesMap[id] = user.name;
          } catch {
            userNamesMap[id] = 'Unknown User';
          }
        }
      }));
      setUserNames(userNamesMap);
    } catch (error) {
      setResults([]);
      setErrorMsg('Lỗi khi tìm kiếm. Vui lòng thử lại!');
    }
    setLoading(false);
  };

  const handlePrevPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (page > 1) handleFilterSearch(page - 1);
  };
  const handleNextPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (page < Math.ceil(total / limit)) handleFilterSearch(page + 1);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-container">
          <h2 className="auth-title">Đang tải...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', padding: '40px 20px' }}>
      {/* Thanh menu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 32, margin: 0, cursor: 'pointer' }} onClick={() => window.location.reload()}>🏠 FindHouse</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {token && role !== 'admin' && (
            <button
              onClick={() => window.location.href = '/profile'}
              style={{
                background: 'linear-gradient(135deg, #1976d2, #64b5f6)',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: 8,
                padding: '10px 28px',
                fontSize: 18,
                cursor: 'pointer',
                marginRight: 8
              }}
            >
              Trang cá nhân
            </button>
          )}
          {!token && <a href="/login" style={{ marginRight: 8, color: '#fff', fontWeight: 'bold', textDecoration: 'none', background: 'linear-gradient(135deg, #1976d2, #64b5f6)', padding: '8px 20px', borderRadius: 8 }}>Đăng nhập</a>}
          {!token && <a href="/register" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none', background: 'linear-gradient(135deg, #43cea2, #185a9d)', padding: '8px 20px', borderRadius: 8 }}>Đăng ký</a>}
        </div>
      </div>
      {/* Bộ lọc nâng cao */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="auth-input" placeholder="Từ khóa..." value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 2, minWidth: 180 }} />
        <input className="auth-input" placeholder="Vị trí" value={location} onChange={e => setLocation(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
        <input className="auth-input" placeholder="Giá từ" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ flex: 1, minWidth: 100 }} />
        <input className="auth-input" placeholder="Giá đến" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ flex: 1, minWidth: 100 }} />
        <button className="auth-button" onClick={() => handleFilterSearch(1)} style={{ minWidth: 90, background: 'linear-gradient(135deg, #43cea2, #185a9d)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', padding: '6px 16px' }}>Tìm kiếm</button>
      </div>
      {/* XÓA các đoạn sau bộ lọc:
      {role === 'admin' && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <button onClick={() => window.location.href = '/admin'} style={{ background: 'linear-gradient(135deg, #1976d2, #64b5f6)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 15, cursor: 'pointer', minWidth: 90 }}>← Quay lại trang admin</button>
        </div>
      )}
      {token && role !== 'admin' && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <button onClick={() => window.location.href = '/profile'} style={{ background: 'linear-gradient(135deg, #43cea2, #185a9d)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 15, cursor: 'pointer', minWidth: 90 }}>← Quay lại trang cá nhân</button>
        </div>
      )}
      {!token && (
        <div style={{ textAlign: 'center', marginBottom: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <a href="/login" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none', background: 'linear-gradient(135deg, #1976d2, #64b5f6)', padding: '6px 16px', borderRadius: 8, fontSize: 15, minWidth: 90 }}>Đăng nhập</a>
          <a href="/register" style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'none', background: 'linear-gradient(135deg, #43cea2, #185a9d)', padding: '6px 16px', borderRadius: 8, fontSize: 15, minWidth: 90 }}>Đăng ký</a>
        </div>
      )} */}
      {/* Đảm bảo chỉ còn dòng hiển thị số lượng bài đăng duy nhất: */}
      <div style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>
        <p style={{ margin: 0 }}>
          Tìm thấy <strong>{total}</strong> bài viết
          {query && ` cho từ khóa "${query}"`}
        </p>
      </div>
      {/* Bộ lọc nâng cao */}
        
        {errorMsg && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>{errorMsg}</div>
      )}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <div style={{ animation: 'spin 1s linear infinite' }}><FaSpinner size={40} color="#1976d2" /></div>
        </div>
      ) : (
        <>
          {/* XÓA các đoạn sau bộ lọc:
          <div style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>
            <p style={{ margin: 0 }}>
              Tìm thấy <strong>{total}</strong> bài viết
              {query && ` cho từ khóa "${query}"`}
            </p>
          </div> */}
          <div style={{ display: 'grid', gap: 28, justifyContent: 'center' }}>
            {filteredResults
              .filter(item => item.status === 'approved')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((item: Post, idx) => (
              <div key={idx} style={{ 
                background: 'white',
                border: '1px solid #e0e0e0', 
                borderRadius: 16, 
                padding: 32, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.13)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                maxWidth: 850,
                margin: '0 auto'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#1976d2', 
                    fontSize: 20,
                    fontWeight: 'bold'
                  }}>
                    📝 {item.title}
                  </h3>
                  <div style={{ margin: '0 0 6px 0', color: '#2196f3', fontWeight: 'bold', fontSize: 17 }}>
                    👤 {item.authorId && userNames[item.authorId] ? userNames[item.authorId] : 'Unknown User'}
                  </div>
                  <p style={{ 
                    margin: '0 0 10px 0', 
                    color: '#333',
                    lineHeight: 1.5,
                    fontSize: 16
                  }}>
                    {item.content}
                  </p>
                  {item.note && (
                    <p style={{ 
                      margin: '0 0 10px 0', 
                      fontStyle: 'italic', 
                      color: '#666',
                      fontSize: 14,
                      background: '#fff3e0',
                      padding: 10,
                      borderRadius: 7
                    }}>
                      💡 <strong>Ghi chú:</strong> {item.note}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '5px 10px', borderRadius: 13, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                      👤 {item.authorId && userNames[item.authorId] ? userNames[item.authorId] : 'Unknown User'}
                    </span>
                    <span style={{ background: '#e8f5e8', color: '#2e7d32', borderRadius: 13, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px' }}>
                      ✅ Đã duyệt
                    </span>
                    {item.createdAt && (
                      <span style={{ background: '#ede7f6', color: '#512da8', borderRadius: 13, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px' }}>
                        📅 {formatDate(item.createdAt)}
                      </span>
                    )}
                    {item.price && (
                      <span style={{ background: '#fffde7', color: '#fbc02d', padding: '5px 10px', borderRadius: 13, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                        💰 {item.price.toLocaleString()} VNĐ
                      </span>
                    )}
                    {item.location && (
                      <span style={{ background: '#e1f5fe', color: '#0288d1', padding: '5px 10px', borderRadius: 13, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                        📍 {item.location}
                      </span>
                    )}
                  </div>
                  {item.images && item.images.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: 18, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
                        📸 Hình ảnh ({item.images.length} ảnh):
                      </h4>
                      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {item.images.map((img: string, i: number) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt={`Ảnh ${i + 1}`} 
                            style={{ 
                              width: 160, 
                              height: 160, 
                              objectFit: 'cover', 
                              borderRadius: 10, 
                              border: '2px solid #e0e0e0',
                              cursor: 'pointer',
                              transition: 'transform 0.2s'
                            }}
                            onClick={() => setModalImg(img)}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredResults.length === 0 && !loading && (
              <div style={{ textAlign: 'center', color: '#666', marginTop: 32, padding: 40, background: 'white', borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>
                  {query ? '🔍' : '📝'}
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
                  {query ? 'Không tìm thấy bài viết nào phù hợp' : 'Chưa có bài viết nào'}
                </h3>
                <p style={{ margin: 0, fontSize: 16 }}>
                  {query ? 'Thử tìm kiếm với từ khóa khác.' : 'Hãy đăng ký và tạo bài viết đầu tiên!'}
                </p>
              </div>
            )}
          </div>
          {/* Pagination */}
          {total > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 8 }}>
              <button onClick={handlePrevPage} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: page === 1 ? '#bdbdbd' : 'linear-gradient(135deg, #1976d2, #64b5f6)', color: '#fff', fontWeight: 'bold', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 16 }}>Trước</button>
              <span style={{ padding: '8px 16px', fontWeight: 'bold', color: '#1976d2', fontSize: 16 }}>Trang {page} / {Math.ceil(total / limit)}</span>
              <button onClick={handleNextPage} disabled={page >= Math.ceil(total / limit)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: page >= Math.ceil(total / limit) ? '#bdbdbd' : 'linear-gradient(135deg, #1976d2, #64b5f6)', color: '#fff', fontWeight: 'bold', cursor: page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer', fontSize: 16 }}>Sau</button>
            </div>
          )}
        </>
      )}
      {modalImg && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModalImg(null)}>
          <img src={modalImg} alt="Phóng to" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} />
        </div>
      )}
    </div>
  );
}

/* CSS cho spinner */
<style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>