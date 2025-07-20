import React, { useEffect, useState } from 'react';
import { getPendingPosts, approvePost } from '../api/post';
import { getUserById } from '../api/auth';

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

const Admin: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

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

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      await approvePost(id, token);
      setPosts(posts => posts.filter(p => p._id !== id));
    } catch (err) {
      alert('Duyệt bài thất bại');
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#1976d2', 
        marginBottom: 32,
        fontSize: 28,
        fontWeight: 'bold'
      }}>
        🛠️ Quản trị duyệt bài
      </h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
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
            backgroundColor: '#fafafa',
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
              <button 
                onClick={() => handleApprove(post._id)} 
                style={{ 
                  background: 'linear-gradient(135deg, #4caf50, #45a049)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 24px', 
                  borderRadius: 8,
                  cursor: 'pointer',
                  marginLeft: 20,
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
          background: '#f5f5f5',
          borderRadius: 12
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>Tuyệt vời!</h3>
          <p style={{ margin: 0, fontSize: 16 }}>Không có bài nào chờ duyệt.</p>
        </div>
      )}
    </div>
  );
};

export default Admin; 