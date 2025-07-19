import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDashboard } from '../api/user';
import './AuthPages.css';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  status: string;
  images?: string[];
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Stats {
  totalPosts: number;
  approvedPosts: number;
  pendingPosts: number;
}

interface Dashboard {
  profile: User;
  stats: Stats;
  approvedPosts: Post[];
  pendingPosts: Post[];
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

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboard(token);
  }, [navigate]);

  const fetchDashboard = async (token: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserDashboard(token);
      setDashboard(data.dashboard);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError('Lỗi tải thông tin dashboard');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreatePost = () => {
    navigate('/create-post');
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

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-container">
          <h2 className="auth-title">Lỗi</h2>
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
          <button className="auth-button" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-container">
          <h2 className="auth-title">Không tìm thấy dữ liệu</h2>
        </div>
      </div>
    );
  }

  const { profile, stats, approvedPosts, pendingPosts } = dashboard;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '20px 0', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: 30
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1976d2', fontSize: 28 }}>👤 Trang Cá Nhân</h1>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                Xin chào, <strong>{profile.name}</strong> ({profile.email})
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={handleCreatePost}
                style={{ 
                  background: 'linear-gradient(135deg, #4caf50, #45a049)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
              >
                ✏️ Tạo Bài Đăng
              </button>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                🚪 Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 20, 
          marginBottom: 30 
        }}>
          <div style={{ 
            background: 'white', 
            padding: 24, 
            borderRadius: 12, 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>Tổng Bài Đăng</h3>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#333' }}>{stats.totalPosts}</div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: 24, 
            borderRadius: 12, 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>Đã Duyệt</h3>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#333' }}>{stats.approvedPosts}</div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: 24, 
            borderRadius: 12, 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>⏳</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#f57c00' }}>Chờ Duyệt</h3>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#333' }}>{stats.pendingPosts}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #e0e0e0'
          }}>
            <button 
              onClick={() => setActiveTab('approved')}
              style={{ 
                flex: 1, 
                padding: '16px 24px', 
                border: 'none', 
                background: activeTab === 'approved' ? '#e3f2fd' : 'transparent',
                color: activeTab === 'approved' ? '#1976d2' : '#666',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: activeTab === 'approved' ? 'bold' : 'normal'
              }}
            >
              ✅ Bài Đăng Đã Duyệt ({approvedPosts.length})
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              style={{ 
                flex: 1, 
                padding: '16px 24px', 
                border: 'none', 
                background: activeTab === 'pending' ? '#fff3e0' : 'transparent',
                color: activeTab === 'pending' ? '#f57c00' : '#666',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: activeTab === 'pending' ? 'bold' : 'normal'
              }}
            >
              ⏳ Bài Đăng Chờ Duyệt ({pendingPosts.length})
            </button>
          </div>

          <div style={{ padding: 24 }}>
            {activeTab === 'approved' ? (
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#1976d2' }}>Bài Đăng Đã Duyệt</h3>
                {approvedPosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                    <p>Chưa có bài đăng nào được duyệt.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {approvedPosts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#f57c00' }}>Bài Đăng Chờ Duyệt</h3>
                {pendingPosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                    <p>Không có bài đăng nào chờ duyệt.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {pendingPosts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component hiển thị bài đăng
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div style={{ 
      border: '1px solid #e0e0e0', 
      borderRadius: 8, 
      padding: 20, 
      backgroundColor: '#fafafa',
      transition: 'transform 0.2s, box-shadow 0.2s'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            color: '#1976d2', 
            fontSize: 18,
            fontWeight: 'bold'
          }}>
            {post.title}
          </h4>
          <p style={{ 
            margin: '0 0 12px 0', 
            color: '#333',
            lineHeight: 1.5
          }}>
            {post.content}
          </p>
          {post.note && (
            <p style={{ 
              margin: '0 0 8px 0', 
              fontStyle: 'italic', 
              color: '#666',
              fontSize: 14
            }}>
              💡 {post.note}
            </p>
          )}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            marginTop: 12
          }}>
            <span style={{ 
              background: post.status === 'approved' ? '#e8f5e8' : '#fff3e0', 
              color: post.status === 'approved' ? '#2e7d32' : '#f57c00', 
              padding: '4px 8px', 
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              {post.status === 'approved' ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
            </span>
            <span style={{ 
              color: '#666',
              fontSize: 12
            }}>
              📅 {formatDate(post.createdAt)}
            </span>
          </div>
        </div>
      </div>
      
      {post.images && post.images.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ 
            display: 'flex', 
            gap: 8, 
            flexWrap: 'wrap'
          }}>
            {post.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Ảnh ${index + 1}`}
                style={{ 
                  width: 80, 
                  height: 80, 
                  objectFit: 'cover', 
                  borderRadius: 6,
                  border: '1px solid #e0e0e0'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 