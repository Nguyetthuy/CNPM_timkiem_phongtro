// ===============================
// frontend/src/pages/Search.tsx
// ===============================
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuthPages.css';
import { getApprovedPosts } from '../api/post';
import { getUserById } from '../api/auth';

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

  useEffect(() => {
    (async () => {
      try {
        const data = await getApprovedPosts();
        setAllResults(data);
        setResults(data);
        
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
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    })();
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
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          padding: 32, 
          borderRadius: 12, 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: 30
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            color: '#1976d2', 
            marginBottom: 24,
            fontSize: 28,
            fontWeight: 'bold'
          }}>
            🔍 Tìm kiếm bài viết
          </h2>
          
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <input
              className="auth-input"
              placeholder="Tìm kiếm theo tiêu đề, nội dung, ghi chú hoặc tên tác giả..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="auth-button" onClick={search}>
              🔍 Tìm kiếm
            </button>
          </div>
          
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p style={{ margin: 0 }}>
              Tìm thấy <strong>{results.length}</strong> bài viết
              {query && ` cho từ khóa "${query}"`}
            </p>
          </div>
        </div>
        
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
          
          {results.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              marginTop: 32,
              padding: 40,
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
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
      </div>
    </div>
  );
}