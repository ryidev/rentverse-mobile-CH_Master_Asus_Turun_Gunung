// Google OAuth Service
import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import { ENV } from '../config/env';
import { authService } from './authService';
import { AuthResponse } from '../types';

export const googleOAuthService = {
  /**
   * Configure Google Sign-In
   * Call this once when the app starts
   */
  configure() {
    GoogleSignin.configure({
      webClientId: ENV.GOOGLE_WEB_CLIENT_ID, // WAJIB: Gunakan Web Client ID (bukan Android Client ID)
      offlineAccess: true, // Enable offline access untuk mendapatkan refresh token
    });

    console.log('Google Sign-In Configured:');
    console.log('- Web Client ID:', ENV.GOOGLE_WEB_CLIENT_ID);
    console.log('- Offline Access: true');
    console.log('- Package Name: com.rentverse');
  },

  /**
   * Check if user is already signed in
   */
  async isSignedIn(): Promise<boolean> {
    try {
      const isSignedIn = await GoogleSignin.hasPreviousSignIn();
      return isSignedIn;
    } catch (error) {
      return false;
    }
  },

  /**
   * Sign in with Google and authenticate with backend
   */
  async signIn(): Promise<AuthResponse> {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices();

      // Get user info and ID token from Google
      const response = await GoogleSignin.signIn();
      const userInfo = response.data;

      if (!userInfo) {
        throw new Error('No user info received from Google');
      }

      console.log('✅ Got user info from Google:', userInfo.user?.email);

      // Get tokens to extract ID token
      const tokens = await GoogleSignin.getTokens();

      if (!tokens.idToken) {
        throw new Error('No ID token received from Google');
      }

      console.log('✅ Got ID token from Google');
      console.log('🔄 Sending to backend for verification...');

      // Send ID token to your backend for verification
      const authResponse = await authService.googleAuth(tokens.idToken);

      console.log('✅ Backend verification successful!');
      console.log('User:', authResponse.user?.email);
      console.log('Token:', authResponse.token ? 'Received' : 'Missing');

      return authResponse;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Sign in cancelled by user');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available or outdated');
      } else {
        console.error('Google Sign-In Error:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        throw error;
      }
    }
  },

  /**
   * Sign out from Google
   */
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Error signing out from Google:', error);
    }
  },

  /**
   * Revoke access (disconnect)
   */
  async revokeAccess(): Promise<void> {
    try {
      await GoogleSignin.revokeAccess();
    } catch (error) {
      console.error('Error revoking Google access:', error);
    }
  },

  /**
   * Get current user info from Google (if already signed in)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await GoogleSignin.signInSilently();
      return response.data || null;
    } catch (error) {
      console.error('Error getting current Google user:', error);
      return null;
    }
  },
};
