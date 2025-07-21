import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Admin from './pages/Admin';
import PostCreate from './pages/PostCreate';
import Profile from './pages/Profile';
import Header from './components/Header';
import './App.css';

// Component để kiểm tra authentication
const PrivateRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role admin nếu cần
  if (adminOnly) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        return <Navigate to="/profile" replace />;
      }
    } catch (error) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          
          {/* Protected routes */}
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/create-post" element={
            <PrivateRoute>
              <PostCreate />
            </PrivateRoute>
          } />
          
          {/* Admin only routes */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <Admin />
            </PrivateRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="*" element={<Navigate to="/search" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
