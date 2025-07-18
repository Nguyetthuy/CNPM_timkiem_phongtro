import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Admin from './pages/Admin';
import PostCreate from './pages/PostCreate';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Cập nhật khi mount
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={isLoggedIn ? <Search /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isLoggedIn && localStorage.getItem('role') === 'admin' ? <Admin /> : <Navigate to="/login" />} />
        <Route path="/create-post" element={isLoggedIn ? <PostCreate /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
