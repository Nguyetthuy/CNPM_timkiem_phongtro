import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Lấy dashboard data (profile + stats + posts)
export const getUserDashboard = async (token: string) => {
  const res = await axios.get(`${API_URL}/user/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Lấy thông tin profile
export const getUserProfile = async (token: string) => {
  const res = await axios.get(`${API_URL}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Lấy bài đăng đã duyệt của user
export const getUserApprovedPosts = async (token: string) => {
  const res = await axios.get(`${API_URL}/user/posts/approved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Lấy bài đăng chờ duyệt của user
export const getUserPendingPosts = async (token: string) => {
  const res = await axios.get(`${API_URL}/user/posts/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Lấy tất cả bài đăng của user
export const getAllUserPosts = async (token: string) => {
  const res = await axios.get(`${API_URL}/user/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Lấy thống kê bài đăng của user
export const getUserStats = async (token: string) => {
  const res = await axios.get(`${API_URL}/user/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 