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
      // Không set Content-Type thủ công, để axios tự động set với boundary
    },
  });
  return res.data;
};

export const getApprovedPosts = async () => {
  const res = await axios.get(`${API_URL}/posts/approved`);
  return res.data;
};

export const deletePost = async (id: string, token: string) => {
  const res = await axios.delete(`${API_URL}/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const searchPosts = async (filters: { minPrice?: number; maxPrice?: number; location?: string; page?: number; limit?: number }) => {
  const params = new URLSearchParams();
  if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
  if (filters.location) params.append('location', filters.location);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  const res = await axios.get(`${API_URL}/posts/search?${params.toString()}`);
  return res.data;
}; 