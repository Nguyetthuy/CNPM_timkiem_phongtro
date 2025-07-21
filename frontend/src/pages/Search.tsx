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
  const [allResults, setAllResults] = useState<Post[]>([]);
  const [results, setResults] = useState<Post[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    handleFilterSearch(1);
    // eslint-disable-next-line
  }, []);

  const search = () => {
    if (!query) {
      setResults(allResults);
      return;
    }
    const q = query.toLowerCase();
    setResults(
      allResults.filter(
        item =>
          item.title?.toLowerCase().includes(q) ||
          item.content?.toLowerCase().includes(q) ||
          item.note?.toLowerCase().includes(q) ||
          (item.authorId && userNames[item.authorId]?.toLowerCase().includes(q))
      )
    );
  };

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
      const data = await searchPosts(filters);
      setResults(data.results);
      setTotal(data.total);
      setPage(data.page);
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
        <div>
          <a href="/login" style={{ marginRight: 16, color: '#1976d2', fontWeight: 'bold', textDecoration: 'none' }}>Đăng nhập</a>
          <a href="/register" style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'none' }}>Đăng ký</a>
        </div>
      </div>
      {/* Bộ lọc nâng cao */}
      <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: 30 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input className="auth-input" placeholder="Từ khóa..." value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 2, minWidth: 180 }} />
          <input className="auth-input" placeholder="Vị trí" value={location} onChange={e => setLocation(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
          <input className="auth-input" placeholder="Giá từ" type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ flex: 1, minWidth: 100 }} />
          <input className="auth-input" placeholder="Giá đến" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ flex: 1, minWidth: 100 }} />
          <button className="auth-button" onClick={() => handleFilterSearch(1)} style={{ minWidth: 120 }}>Lọc nâng cao</button>
        </div>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <p style={{ margin: 0 }}>
            Tìm thấy <strong>{total}</strong> bài viết
            {query && ` cho từ khóa "${query}"`}
          </p>
        </div>
      </div>
        
        {errorMsg && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>{errorMsg}</div>
      )}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <div style={{ animation: 'spin 1s linear infinite' }}><FaSpinner size={40} color="#1976d2" /></div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 20 }}>
            {results.map((item: Post, idx) => (
              <div key={idx} style={{ 
                background: 'white',
                border: '1px solid #e0e0e0', 
                borderRadius: 12, 
                padding: 24, 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: 16 
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 12px 0', 
                      color: '#1976d2', 
                      fontSize: 24,
                      fontWeight: 'bold'
                    }}>
                      📝 {item.title}
                    </h3>
                    <p style={{ 
                      margin: '0 0 16px 0', 
                      color: '#333',
                      lineHeight: 1.6,
                      fontSize: 16
                    }}>
                      {item.content}
                    </p>
                    {item.note && (
                      <p style={{ 
                        margin: '0 0 16px 0', 
                        fontStyle: 'italic', 
                        color: '#666',
                        fontSize: 14,
                        background: '#fff3e0',
                        padding: 12,
                        borderRadius: 8
                      }}>
                        💡 <strong>Ghi chú:</strong> {item.note}
                      </p>
                    )}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12,
                      marginTop: 16,
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ 
                        background: '#e3f2fd', 
                        color: '#1976d2', 
                        padding: '6px 12px', 
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        👤 <strong>{item.authorId && userNames[item.authorId] ? userNames[item.authorId] : 'Unknown User'}</strong>
                      </span>
                      <span style={{ 
                        background: '#e8f5e8', 
                        color: '#2e7d32', 
                        padding: '6px 12px', 
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        ✅ Đã duyệt
                      </span>
                      <span style={{ 
                        color: '#666',
                        fontSize: 14
                      }}>
                        📅 {formatDate(item.createdAt)}
                      </span>
                      {item.price !== undefined && item.price !== null && (
                        <span style={{
                          background: '#fffde7',
                          color: '#fbc02d',
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: 14,
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          💰 {item.price.toLocaleString()} VNĐ
                        </span>
                      )}
                      {item.location && (
                        <span style={{
                          background: '#e1f5fe',
                          color: '#0288d1',
                          padding: '6px 12px',
                          borderRadius: 20,
                          fontSize: 14,
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          📍 {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {item.images && item.images.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: 18, 
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      📸 Hình ảnh ({item.images.length} ảnh):
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      gap: 12, 
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      {item.images.map((img: string, i: number) => (
                        <img 
                          key={i} 
                          src={img} 
                          alt={`Ảnh ${i + 1}`} 
                          style={{ 
                            width: 160, 
                            height: 160, 
                            objectFit: 'cover', 
                            borderRadius: 8, 
                            border: '2px solid #e0e0e0',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
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
            ))}
            
            {results.length === 0 && !loading && (
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
              <button onClick={handlePrevPage} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #1976d2', background: page === 1 ? '#eee' : '#1976d2', color: page === 1 ? '#888' : '#fff', fontWeight: 'bold', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Trước</button>
              <span style={{ padding: '8px 16px', fontWeight: 'bold', color: '#1976d2' }}>Trang {page} / {Math.ceil(total / limit)}</span>
              <button onClick={handleNextPage} disabled={page >= Math.ceil(total / limit)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #1976d2', background: page >= Math.ceil(total / limit) ? '#eee' : '#1976d2', color: page >= Math.ceil(total / limit) ? '#888' : '#fff', fontWeight: 'bold', cursor: page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer' }}>Sau</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* CSS cho spinner */
<style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>