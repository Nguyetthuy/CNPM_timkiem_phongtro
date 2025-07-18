// ===============================
// frontend/src/pages/Search.tsx
// ===============================
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuthPages.css';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async () => {
    const res = await axios.get(`/posts/search?q=${query}`);
    setResults(res.data);
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
            {results.map((item: any, idx) => <li key={idx} style={{ marginBottom: 8 }}>{item.title}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}