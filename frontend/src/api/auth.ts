// src/api/auth.ts
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export const loginApi = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email,
    password,
  });
  return response.data; // chứa { message, token }
};

export const registerApi = async (name: string, email: string, password: string) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, {
    name,
    email,
    password,
  });
  return response.data; // chứa { message }
};
