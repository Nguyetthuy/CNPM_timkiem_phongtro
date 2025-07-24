// ===============================
// frontend/src/pages/Search.tsx
// ===============================
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuthPages.css';
import { getApprovedPosts, searchPosts, ratePost } from '../api/post';
import { getUserById } from '../api/auth';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
  rating?: number; // Added rating field
  ratingAvg?: number; // Added ratingAvg field
  ratingCount?: number; // Added ratingCount field
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

// Popup thông tin liên hệ user
const UserContactPopup: React.FC<{ user: any }> = ({ user }) => (
  <div style={{
    position: 'absolute',
    top: 28,
    left: 0,
    zIndex: 100,
    background: '#fff',
    border: '1px solid #90caf9',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(25,118,210,0.12)',
    padding: 16,
    minWidth: 220,
    color: '#1976d2',
    fontSize: 15
  }}>
    <div style={{ fontWeight: 'bold', marginBottom: 6 }}>👤 {user.name}</div>
    {user.phone && <div>📞 <b>{user.phone}</b></div>}
    <div>✉️ {user.email}</div>
  </div>
);

// PostCard component cho mỗi bài đăng
const PostCard: React.FC<{ item: Post; userNames: any }> = ({ item, userNames }) => {
  const [localRating, setLocalRating] = React.useState<number | null>(null);
  const [avg, setAvg] = React.useState(item.ratingAvg || 0);
  const [count, setCount] = React.useState(item.ratingCount || 0);
  const handleRate = async (star: number) => {
    setLocalRating(star);
    try {
      const data = await ratePost(item._id, star);
      setAvg(data.ratingAvg);
      setCount(data.ratingCount);
    } catch {}
  };
  const [showContact, setShowContact] = React.useState(false);
  const [contactInfo, setContactInfo] = React.useState<any>(null);
  const handleMouseEnter = async () => {
    setShowContact(true);
    if (!contactInfo && item.authorId) {
      try {
        const user = await getUserById(item.authorId);
        setContactInfo(user);
      } catch {}
    }
  };
  const handleMouseLeave = () => setShowContact(false);
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 20,
      backgroundColor: '#fafafa',
      transition: 'transform 0.2s, box-shadow 0.2s',
      maxWidth: 1000,
      width: '66vw',
      margin: '0 auto',
      minHeight: 260
    }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1976d2', fontSize: 18, fontWeight: 'bold' }}>
            📝 {item.title}
          </h3>
          {/* Đánh giá sao */}
          <div style={{ marginBottom: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{ color: (localRating ? i < localRating : i < avg) ? '#FFD700' : '#ccc', fontSize: 22, cursor: 'pointer' }}
                onClick={() => handleRate(i + 1)}
                title={`Đánh giá ${i + 1} sao`}
              >
                ★
              </span>
            ))}
            <span style={{ marginLeft: 8, color: '#666', fontSize: 14 }}>
              {avg.toFixed(1)} ({count} lượt)
            </span>
          </div>
          <p style={{ margin: '0 0 12px 0', color: '#333', lineHeight: 1.5 }}>
            {item.content}
          </p>
          {item.note && (
            <p style={{ margin: '0 0 8px 0', fontStyle: 'italic', color: '#666', fontSize: 14 }}>
              💡 {item.note}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <span style={{ background: '#e8f5e8', color: '#2e7d32', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
              ✅ Đã duyệt
            </span>
            {item.createdAt && !isNaN(Date.parse(item.createdAt)) && (
              <span style={{ color: '#666', fontSize: 12 }}>
                📅 {formatDate(item.createdAt)}
              </span>
            )}
            {item.price !== undefined && item.price !== null && (
              <span style={{ background: '#fffde7', color: '#fbc02d', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
                💰 {item.price.toLocaleString()} VNĐ
              </span>
            )}
            {item.location && (
              <span style={{ background: '#e1f5fe', color: '#0288d1', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
                📍 {item.location}
              </span>
            )}
            {item.authorId && userNames[item.authorId] && (
              <span
                style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold', position: 'relative', cursor: 'pointer' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                👤 <strong>{userNames[item.authorId]}</strong>
                {showContact && contactInfo && (
                  <UserContactPopup user={contactInfo} />
                )}
              </span>
            )}
            {(!item.authorId || !userNames[item.authorId]) && (
              <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
                👤 <strong>Unknown User</strong>
              </span>
            )}
          </div>
        </div>
      </div>
      {item.images && item.images.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {item.images.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt={`Ảnh ${i + 1}`}
                style={{
                  width: 200,
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 6,
                  border: '1px solid #e0e0e0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(25,118,210,0.18)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Search() {
  const navigate = useNavigate();
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
  const isAdmin = localStorage.getItem('role') === 'admin';

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
      if (query) filters.keyword = query;
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
            // Gọi endpoint mới /api/user-public/:id
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
      {/* Nút quay lại trang Admin nếu là admin */}
      {isAdmin && (
        <div style={{ marginBottom: 24, textAlign: 'right' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'linear-gradient(135deg, #1976d2, #64b5f6)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}>← Quay lại trang Admin</button>
        </div>
      )}
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
          <div style={{ display: 'grid', gap: 20, justifyContent: 'center' }}>
            {results.filter(item => item.status === 'approved').map((item: Post, idx) => (
              <PostCard key={item._id || idx} item={item} userNames={userNames} />
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