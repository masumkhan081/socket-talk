// abc
// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCurrentUser } from '../store/slices/authSlice';
import type { RootState } from '../store/store';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state: RootState) => state.auth as AuthState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, loading]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
  };
};