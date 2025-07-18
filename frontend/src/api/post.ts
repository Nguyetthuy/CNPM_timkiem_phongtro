import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Đổi lại nếu gateway hoặc post-service chạy cổng khác

export const getPendingPosts = async (token: string) => {
  const res = await axios.get(`${API_URL}/posts/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const approvePost = async (id: string, token: string) => {
  const res = await axios.patch(`${API_URL}/posts/approve/${id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createPost = async (formData: FormData, token: string) => {
  const res = await axios.post(`${API_URL}/posts`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getApprovedPosts = async () => {
  const res = await axios.get(`${API_URL}/posts/approved`);
  return res.data;
}; 