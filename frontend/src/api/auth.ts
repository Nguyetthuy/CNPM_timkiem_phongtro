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
  const res = await axios.get(`${API_URL}/api/auth/user/${userId}`);
  return res.data;
};
