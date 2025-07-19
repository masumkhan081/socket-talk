// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiHandler } from '../../services/api';
import API_ENDPOINTS from '../../services/endpoints';

declare global {
  interface Window {
    clearTimeout: (timeoutId: number) => void;
    setTimeout: (handler: () => void, timeout: number) => number;
  }
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
interface LoginResponse {
  token: string;
  user: User;
}

export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiHandler.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      localStorage.setItem('token', response.token);
      return response.user;
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

interface RegisterResponse {
  token: string;
  user: User;
}

export const register = createAsyncThunk<
  User,
  { username: string; email: string; password: string },
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiHandler.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
      localStorage.setItem('token', response.token);
      return response.user;
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

interface MeResponse {
  user: User;
}

export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandler.get<MeResponse>(API_ENDPOINTS.AUTH.ME);
      return response.user;
    } catch (error) {
      localStorage.removeItem('token');
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Session expired. Please login again.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk<null, void>('auth/logout', async () => {
  localStorage.removeItem('token');
  return null;
});

interface ForgotPasswordResponse {
  message: string;
}

export const forgotPassword = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await apiHandler.post<ForgotPasswordResponse>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 
        { email }
      );
      return { message: 'Password reset email sent' };
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Failed to send reset email';
      return rejectWithValue(errorMessage);
    }
  }
);

interface VerifyOtpResponse {
  token: string;
}

export const verifyOtp = createAsyncThunk<
  { token: string },
  { email: string; otp: string },
  { rejectValue: string }
>(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await apiHandler.post<VerifyOtpResponse>(
        API_ENDPOINTS.AUTH.VERIFY_OTP, 
        { email, otp }
      );
      return { token: response.token };
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'OTP verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    { email, otp, newPassword }: { email: string; otp: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      await apiHandler.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
        otp,
        newPassword
      });
      return { message: 'Password reset successful' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Login failed';
    });

    // Handle register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Registration failed';
    });

    // Handle fetch current user
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload || 'Failed to fetch user';
    });

    // Handle logout
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;