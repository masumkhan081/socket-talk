// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchCurrentUser } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

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