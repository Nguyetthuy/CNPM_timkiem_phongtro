import React, { useEffect, useState } from 'react';
import { getPendingPosts, approvePost, getApprovedPosts, deletePost } from '../api/post';
import { getUserById } from '../api/auth';
import { useNavigate } from 'react-router-dom';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  status: string;
  images?: string[];
  note?: string;
}

interface Stats {
  pendingCount: number;
  approvedCount: number;
  totalCount: number;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');
  const [posts, setPosts] = useState<Post[]>([]);
  const [approvedPosts, setApprovedPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ pendingCount: 0, approvedCount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const [pendingData, approvedData] = await Promise.all([
        getPendingPosts(token),
        getApprovedPosts()
      ]);
      
      setStats({
        pendingCount: pendingData.length,
        approvedCount: approvedData.length,
        totalCount: pendingData.length + approvedData.length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const data = await getPendingPosts(token);
      setPosts(data);
      
      // Lấy tên của tất cả user đã đăng bài
      const userIds = [...new Set(data.map((post: Post) => post.authorId))];
      const userNamesMap: { [key: string]: string } = {};
      
      for (const userId of userIds) {
        if (userId && typeof userId === 'string') {
          try {
            const userData = await getUserById(userId);
            userNamesMap[userId] = userData.name;
          } catch (error) {
            userNamesMap[userId] = 'Unknown User';
          }
        }
      }
      
      setUserNames(userNamesMap);
    } catch (err: any) {
      setError('Lỗi tải bài chưa duyệt');
    }
    setLoading(false);
  };

  const fetchApprovedPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getApprovedPosts();
      setApprovedPosts(data);
      // Lấy tên user
      const userIds = [...new Set(data.map((post: Post) => post.authorId))];
      const userNamesMap: { [key: string]: string } = { ...userNames };
      for (const userId of userIds) {
        if (userId && typeof userId === 'string' && !userNamesMap[userId]) {
          try {
            const userData = await getUserById(userId);
            userNamesMap[userId] = userData.name;
          } catch (error) {
            userNamesMap[userId] = 'Unknown User';
          }
        }
      }
      setUserNames(userNamesMap);
    } catch (err: any) {
      setError('Lỗi tải bài đã duyệt');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    fetchStats();
    fetchApprovedPosts();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await approvePost(id, token);
      
      // Lưu thông báo cho user
      const approvedPost = posts.find(p => p._id === id);
      if (approvedPost) {
        const notifications = JSON.parse(localStorage.getItem('postNotifications') || '[]');
        notifications.push({
          id: Date.now(),
          type: 'approved',
          postId: id,
          postTitle: approvedPost.title,
          timestamp: new Date().toISOString(),
          message: `Bài đăng "${approvedPost.title}" đã được duyệt thành công!`
        });
        localStorage.setItem('postNotifications', JSON.stringify(notifications));
      }
      
      setPosts(posts => posts.filter(p => p._id !== id));
      // Refresh stats và danh sách bài đã duyệt sau khi duyệt
      fetchStats();
      fetchApprovedPosts();
      
      // Hiển thị thông báo thành công cho admin
      if (approvedPost) {
        alert(`Duyệt bài thành công!\nBài đăng: "${approvedPost.title}"\nTác giả: ${approvedPost.authorId && userNames[approvedPost.authorId] ? userNames[approvedPost.authorId] : 'Unknown User'}`);
      } else {
        alert('Duyệt bài thành công!');
      }
    } catch (err) {
      alert('Duyệt bài thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token') || '';
      await deletePost(id, token);
      
      setPosts(posts => posts.filter(p => p._id !== id));
      // Refresh stats sau khi xóa
      fetchStats();
      
      alert('Xóa bài đăng thành công!');
    } catch (err) {
      alert('Xóa bài đăng thất bại');
    }
  };

  const handleDeleteApproved = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;
    try {
      const token = localStorage.getItem('token') || '';
      await deletePost(id, token);
      setApprovedPosts(posts => posts.filter(p => p._id !== id));
      fetchStats();
      fetchApprovedPosts();
      alert('Xóa bài đăng thành công!');
    } catch (err) {
      alert('Xóa bài đăng thất bại');
    }
  };

  // Menu cho admin
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/search';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', padding: '40px 20px' }}>
      {/* Menu admin */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 32, margin: 0, cursor: 'pointer' }} onClick={() => navigate('/admin')}>🛠️ Admin Panel</h1>
        <div>
          <button onClick={() => navigate('/search')} style={{ marginRight: 16, color: '#1976d2', fontWeight: 'bold', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>Tìm kiếm</button>
          <button onClick={handleLogout} style={{ color: '#d32f2f', fontWeight: 'bold', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>Đăng xuất</button>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setTab('pending')} style={{ padding: '10px 24px', borderRadius: 8, border: tab === 'pending' ? '2px solid #1976d2' : '1px solid #ccc', background: tab === 'pending' ? '#1976d2' : '#fff', color: tab === 'pending' ? '#fff' : '#1976d2', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Bài chờ duyệt</button>
        <button onClick={() => setTab('approved')} style={{ padding: '10px 24px', borderRadius: 8, border: tab === 'approved' ? '2px solid #1976d2' : '1px solid #ccc', background: tab === 'approved' ? '#1976d2' : '#fff', color: tab === 'approved' ? '#fff' : '#1976d2', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>Bài đã duyệt</button>
      </div>
      {tab === 'pending' ? (
        <>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ 
              textAlign: 'center', 
              color: '#1976d2', 
              marginBottom: 32,
              fontSize: 28,
              fontWeight: 'bold'
            }}>
              🛠️ Quản trị duyệt bài
            </h2>

            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 20, 
              marginBottom: 30 
            }}>
              <div style={{ 
                background: 'white', 
                padding: 20, 
                borderRadius: 12, 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>Tổng Bài Đăng</h3>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>{stats.totalCount}</div>
              </div>
              
              <div style={{ 
                background: 'white', 
                padding: 20, 
                borderRadius: 12, 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>Đã Duyệt</h3>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>{stats.approvedCount}</div>
              </div>
              
              <div style={{ 
                background: 'white', 
                padding: 20, 
                borderRadius: 12, 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#f57c00' }}>Chờ Duyệt</h3>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>{stats.pendingCount}</div>
              </div>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: 18, color: '#666' }}>Đang tải...</p>
              </div>
            ) : null}
            
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
            
            <div style={{ display: 'grid', gap: 20 }}>
              {posts.map(post => (
                <div key={post._id} style={{ 
                  border: '2px solid #e3f2fd', 
                  borderRadius: 12, 
                  padding: 24, 
                  backgroundColor: 'white',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 12px 0', 
                        color: '#1976d2', 
                        fontSize: 22,
                        fontWeight: 'bold'
                      }}>
                        📝 {post.title}
                      </h3>
                      <p style={{ 
                        margin: '0 0 12px 0', 
                        color: '#333',
                        lineHeight: 1.6,
                        fontSize: 16
                      }}>
                        {post.content}
                      </p>
                      {post.note && (
                        <p style={{ 
                          margin: '0 0 12px 0', 
                          fontStyle: 'italic', 
                          color: '#666',
                          fontSize: 14,
                          background: '#fff3e0',
                          padding: 8,
                          borderRadius: 6
                        }}>
                          💡 Ghi chú: {post.note}
                        </p>
                      )}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12,
                        marginTop: 16
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
                          👤 {post.authorId && userNames[post.authorId] ? userNames[post.authorId] : 'Unknown User'}
                        </span>
                        <span style={{ 
                          background: '#fff3e0', 
                          color: '#f57c00', 
                          padding: '6px 12px', 
                          borderRadius: 20,
                          fontSize: 14,
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          ⏳ Chờ duyệt
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginLeft: 20 }}>
                      <button 
                        onClick={() => handleApprove(post._id)} 
                        style={{ 
                          background: 'linear-gradient(135deg, #4caf50, #45a049)', 
                          color: 'white', 
                          border: 'none', 
                          padding: '12px 24px', 
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 16,
                          fontWeight: 'bold',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
                        ✅ Duyệt bài
                      </button>
                      <button 
                        onClick={() => handleDelete(post._id)} 
                        style={{ 
                          background: 'linear-gradient(135deg, #f44336, #d32f2f)', 
                          color: 'white', 
                          border: 'none', 
                          padding: '12px 24px', 
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 16,
                          fontWeight: 'bold',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
                    </div>
                  </div>
                  
                  {post.images && post.images.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <h4 style={{ 
                        margin: '0 0 12px 0', 
                        fontSize: 16, 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        📸 Hình ảnh ({post.images.length} ảnh):
                      </h4>
                      <div style={{ 
                        display: 'flex', 
                        gap: 12, 
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                      }}>
                        {post.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Ảnh ${index + 1}`}
                            style={{ 
                              width: 140, 
                              height: 140, 
                              objectFit: 'cover', 
                              borderRadius: 8,
                              border: '2px solid #e0e0e0',
                              cursor: 'pointer',
                              transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
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
            </div>
            
            {(!loading && posts.length === 0) && (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                marginTop: 60,
                padding: 40,
                background: 'white',
                borderRadius: 12,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>Tuyệt vời!</h3>
                <p style={{ margin: 0, fontSize: 16 }}>Không có bài nào chờ duyệt.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            color: '#1976d2', 
            marginBottom: 32,
            fontSize: 28,
            fontWeight: 'bold'
          }}>
            🛠️ Quản trị bài đã duyệt
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <p style={{ fontSize: 18, color: '#666' }}>Đang tải...</p>
            </div>
          ) : null}
          
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
          
          <div style={{ display: 'grid', gap: 20 }}>
            {approvedPosts.map(post => (
              <div key={post._id} style={{ border: '2px solid #e0e0e0', borderRadius: 12, padding: 24, backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#1976d2', fontSize: 22, fontWeight: 'bold' }}>📝 {post.title}</h3>
                    <p style={{ margin: '0 0 12px 0', color: '#333', lineHeight: 1.6, fontSize: 16 }}>{post.content}</p>
                    {post.note && (<p style={{ margin: '0 0 12px 0', fontStyle: 'italic', color: '#666', fontSize: 14, background: '#fff3e0', padding: 8, borderRadius: 6 }}>💡 Ghi chú: {post.note}</p>)}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                      <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '6px 12px', borderRadius: 20, fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>👤 {post.authorId && userNames[post.authorId] ? userNames[post.authorId] : 'Unknown User'}</span>
                      <span style={{ background: '#e8f5e8', color: '#2e7d32', padding: '6px 12px', borderRadius: 20, fontSize: 14, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>✅ Đã duyệt</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginLeft: 20 }}>
                    <button onClick={() => handleDeleteApproved(post._id)} style={{ background: 'linear-gradient(135deg, #f44336, #d32f2f)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 'bold', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>🗑️ Xóa bài</button>
                  </div>
                </div>
                {post.images && post.images.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>📸 Hình ảnh ({post.images.length} ảnh):</h4>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {post.images.map((img, index) => (
                        <img key={index} src={img} alt={`Ảnh ${index + 1}`} style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 8, border: '2px solid #e0e0e0', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(!loading && approvedPosts.length === 0) && (
              <div style={{ textAlign: 'center', color: '#666', marginTop: 60, padding: 40, background: 'white', borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>Chưa có bài đã duyệt</h3>
                <p style={{ margin: 0, fontSize: 16 }}>Hãy duyệt bài hoặc tạo bài đăng mới!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 