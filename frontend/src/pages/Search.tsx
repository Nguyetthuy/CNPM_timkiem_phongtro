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
}

interface User {
  name: string;
  email: string;
}

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container">
        <h2 className="auth-title">Tìm kiếm bài viết</h2>
        <div style={{ width: '100%' }}>
          <input
            className="auth-input"
            placeholder="Tìm kiếm theo tiêu đề, nội dung, ghi chú hoặc tên tác giả..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="auth-button" style={{ marginBottom: 16 }} onClick={search}>Tìm kiếm</button>
          
          <div style={{ width: '100%', textAlign: 'left', paddingLeft: 0 }}>
            {results.map((item: Post, idx) => (
              <div key={idx} style={{ 
                marginBottom: 20, 
                border: '1px solid #e0e0e0', 
                borderRadius: 8, 
                padding: 16, 
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: 12 
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      color: '#1976d2', 
                      fontSize: 20,
                      fontWeight: 'bold'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      color: '#333',
                      lineHeight: 1.6
                    }}>
                      {item.content}
                    </p>
                    {item.note && (
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        fontStyle: 'italic', 
                        color: '#666',
                        fontSize: 14
                      }}>
                        💡 {item.note}
                      </p>
                    )}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      marginTop: 12
                    }}>
                      <span style={{ 
                        background: '#e3f2fd', 
                        color: '#1976d2', 
                        padding: '4px 8px', 
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        👤 {item.authorId && userNames[item.authorId] ? userNames[item.authorId] : 'Unknown User'}
                      </span>
                      <span style={{ 
                        background: '#e8f5e8', 
                        color: '#2e7d32', 
                        padding: '4px 8px', 
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        ✅ Đã duyệt
                      </span>
                    </div>
                  </div>
                </div>
                
                {item.images && item.images.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: 8, 
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      {item.images.map((img: string, i: number) => (
                        <img 
                          key={i} 
                          src={img} 
                          alt={`Ảnh ${i + 1}`} 
                          style={{ 
                            width: 120, 
                            height: 120, 
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
                fontSize: 16
              }}>
                {query ? 'Không tìm thấy bài viết nào phù hợp.' : 'Chưa có bài viết nào.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}