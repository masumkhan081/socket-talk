import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider, useAuth } from './context/AuthContext';

import { SocketProvider } from './context/SocketContext.tsx';
import Layout from './components/layout/Layout';

// Import pages directly since we're not using Suspense
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ChatPage from './pages/chat/ChatPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <JotaiProvider>
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-right" />
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="chat" element={<ChatPage />}>
                <Route path=":conversationId" element={<ChatPage />} />
              </Route>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<div>Settings</div>} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </JotaiProvider>
    </Provider>
  );
}

export default App;
