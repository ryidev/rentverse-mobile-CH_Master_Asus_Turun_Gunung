import { apiService } from './api';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '../types';
import { storageService } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    if (response.refreshToken) {
      await storageService.setRefreshToken(response.refreshToken);
    }
    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    if (response.refreshToken) {
      await storageService.setRefreshToken(response.refreshToken);
    }
    return response;
  },

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/me');
  },

  async logout(): Promise<void> {
    await storageService.clearAll();
    return apiService.post<void>('/auth/logout');
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = await storageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await apiService.post<AuthResponse>('/auth/refresh-token', {
      refreshToken,
    });
    if (response.refreshToken) {
      await storageService.setRefreshToken(response.refreshToken);
    }
    return response;
  },

  async googleAuth(idToken: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/google', {
      idToken,
    });
    if (response.refreshToken) {
      await storageService.setRefreshToken(response.refreshToken);
    }
    return response;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiService.put<User>('/auth/profile', data);
  },

  async uploadAvatar(formData: FormData): Promise<{ avatarUrl: string }> {
    return apiService.uploadFormData<{ avatarUrl: string }>('/auth/avatar', formData);
  },
};
