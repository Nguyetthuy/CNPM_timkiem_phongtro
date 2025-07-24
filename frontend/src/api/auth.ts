// src/api/auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const loginApi = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
  return res.data;
};

export const registerApi = async (name: string, email: string, password: string) => {
  const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
  return res.data;
};

export const getUserById = async (userId: string) => {
  const res = await axios.get(`${API_URL}/api/user-public/${userId}`);
  return res.data;
};

export const getProfile = async (token: string) => {
  const res = await axios.get(`${API_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateProfile = async (data: { name?: string; email?: string; phone?: string; oldPassword?: string; newPassword?: string }, token: string) => {
  const res = await axios.put(`${API_URL}/api/auth/profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
