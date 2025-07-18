import React, { useEffect, useState } from 'react';
import { getPendingPosts, approvePost } from '../api/post';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  status: string;
}

const Admin: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const data = await getPendingPosts(token);
      setPosts(data);
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
    <div style={{ padding: 32 }}>
      <h2>Quản trị duyệt bài</h2>
      {loading ? <p>Đang tải...</p> : null}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Tác giả</th>
            <th>Nội dung</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post._id}>
              <td>{post.title}</td>
              <td>{post.author}</td>
              <td>{post.content}</td>
              <td>
                <button onClick={() => handleApprove(post._id)} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4 }}>
                  Duyệt
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {(!loading && posts.length === 0) && <p>Không có bài nào chờ duyệt.</p>}
    </div>
  );
};

export default Admin; 