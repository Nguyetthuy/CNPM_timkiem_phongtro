import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDashboard } from '../api/user';
import { deletePost } from '../api/post';
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
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Kiểm tra URL parameters để hiển thị thông báo
    const urlParams = new URLSearchParams(window.location.search);
    const postCreated = urlParams.get('postCreated');
    if (postCreated === 'true') {
      setSuccess('Bài đăng đã được tạo thành công và đang chờ duyệt!');
      // Xóa parameter khỏi URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Kiểm tra thông báo bài đăng được duyệt
    const storedNotifications = JSON.parse(localStorage.getItem('postNotifications') || '[]');
    const userNotifications = storedNotifications.filter((n: any) => n.type === 'approved');
    if (userNotifications.length > 0) {
      setNotifications(userNotifications);
      // Tự động chuyển sang tab "Đã Duyệt" khi có thông báo
      setActiveTab('approved');
      // Xóa thông báo đã hiển thị
      const remainingNotifications = storedNotifications.filter((n: any) => n.type !== 'approved');
      localStorage.setItem('postNotifications', JSON.stringify(remainingNotifications));
      
      // Refresh dashboard để cập nhật số liệu
      fetchDashboard(token);
    }

    // Lắng nghe thay đổi localStorage để nhận thông báo real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'postNotifications' && e.newValue) {
        const newNotifications = JSON.parse(e.newValue);
        const newUserNotifications = newNotifications.filter((n: any) => n.type === 'approved');
        if (newUserNotifications.length > 0) {
          setNotifications(prev => [...prev, ...newUserNotifications]);
          setActiveTab('approved');
          fetchDashboard(token);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    fetchDashboard(token);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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

  const dismissNotification = (notificationId: number) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  // Tự động ẩn thông báo sau 10 giây
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications([]);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token') || '';
      await deletePost(postId, token);
      
      // Refresh dashboard để cập nhật danh sách
      fetchDashboard(token);
      
      alert('Xóa bài đăng thành công!');
    } catch (err) {
      alert('Xóa bài đăng thất bại');
    }
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 24 }}>
              <button onClick={handleCreatePost} style={{ background: 'linear-gradient(135deg, #43cea2, #185a9d)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}>Tạo bài đăng</button>
              <button onClick={handleLogout} style={{ background: 'linear-gradient(135deg, #d32f2f, #f44336)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}>Đăng xuất</button>
              <button onClick={() => navigate('/search')} style={{ background: 'linear-gradient(135deg, #1976d2, #64b5f6)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}>← Quay lại trang tìm kiếm</button>
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
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>⏳</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#f57c00' }}>Chờ Duyệt</h3>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#333' }}>{stats.pendingPosts}</div>
            {stats.pendingPosts > 0 && (
              <div style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: '#f44336',
                color: 'white',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {stats.pendingPosts}
              </div>
            )}
          </div>
        </div>

        {/* Thông báo cho bài đăng chờ duyệt */}
        {stats.pendingPosts > 0 && (
          <div style={{ 
            background: '#fff3e0', 
            border: '1px solid #ffb74d', 
            borderRadius: 8, 
            padding: 16, 
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ fontSize: 24 }}>⏳</div>
            <div>
              <strong>Bạn có {stats.pendingPosts} bài đăng đang chờ duyệt!</strong>
              <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                Admin sẽ xem xét và duyệt bài đăng của bạn sớm nhất có thể.
              </p>
            </div>
          </div>
        )}

        {/* Thông báo thành công */}
        {success && (
          <div style={{ 
            background: '#e8f5e8', 
            border: '1px solid #4caf50', 
            borderRadius: 8, 
            padding: 16, 
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ fontSize: 24 }}>✅</div>
            <div>
              <strong>{success}</strong>
              <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                Bài đăng của bạn sẽ được hiển thị ở tab "Chờ Duyệt" bên dưới.
              </p>
            </div>
          </div>
        )}

        {/* Thông báo bài đăng được duyệt */}
        {notifications.map(notification => (
          <div key={notification.id} style={{ 
            background: '#e3f2fd', 
            border: '1px solid #2196f3', 
            borderRadius: 8, 
            padding: 16, 
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            position: 'relative',
            animation: 'slideIn 0.5s ease-out',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
          }}>
            <div style={{ fontSize: 24, animation: 'bounce 1s infinite' }}>🎉</div>
            <div style={{ flex: 1 }}>
              <strong>Chúc mừng! {notification.message}</strong>
              <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                Bài đăng của bạn đã được duyệt và sẽ hiển thị ở tab "Đã Duyệt" bên dưới.
              </p>
              <small style={{ color: '#999' }}>
                {new Date(notification.timestamp).toLocaleString('vi-VN')}
              </small>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
                color: '#666',
                padding: 4,
                borderRadius: 4,
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#333'}
              onMouseOut={(e) => e.currentTarget.style.color = '#666'}
            >
              ✕
            </button>
          </div>
        ))}

        <style>
          {`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-5px);
              }
              60% {
                transform: translateY(-3px);
              }
            }
          `}
        </style>

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
                fontWeight: activeTab === 'pending' ? 'bold' : 'normal',
                position: 'relative'
              }}
            >
              ⏳ Bài Đăng Chờ Duyệt ({pendingPosts.length})
              {pendingPosts.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: '#f44336',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}>
                  {pendingPosts.length}
                </span>
              )}
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
                      <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
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
                      <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
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
const PostCard: React.FC<{ post: Post; onDelete?: (postId: string) => void }> = ({ post, onDelete }) => {
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
          {onDelete && (
            <button 
              onClick={() => onDelete(post._id)} 
              style={{ 
                background: 'linear-gradient(135deg, #f44336, #d32f2f)', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 'bold',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                marginBottom: 12
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              }}
            >
              🗑️ Xóa bài
            </button>
          )}
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