// ===============================
// frontend/src/pages/Search.tsx
// ===============================
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuthPages.css';
import { getApprovedPosts } from '../api/post';

export default function Search() {
  const [query, setQuery] = useState('');
  const [allResults, setAllResults] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getApprovedPosts();
      setAllResults(data);
      setResults(data);
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
          item.note?.toLowerCase().includes(q)
      )
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-container">
        <h2 className="auth-title">Tìm kiếm bài viết</h2>
        <div style={{ width: '100%' }}>
          <input
            className="auth-input"
            placeholder="Search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="auth-button" style={{ marginBottom: 16 }} onClick={search}>Tìm kiếm</button>
          <ul style={{ width: '100%', textAlign: 'left', paddingLeft: 0 }}>
            {results.map((item: any, idx) => (
              <li key={idx} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <div style={{ fontWeight: 'bold', fontSize: 18 }}>{item.title}</div>
                <div style={{ margin: '4px 0' }}>{item.content}</div>
                {item.note && <div style={{ fontStyle: 'italic', color: '#888' }}>Ghi chú: {item.note}</div>}
                {item.images && item.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {item.images.map((img: string, i: number) => (
                      <img key={i} src={img} alt="Ảnh bài đăng" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #ccc' }} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}