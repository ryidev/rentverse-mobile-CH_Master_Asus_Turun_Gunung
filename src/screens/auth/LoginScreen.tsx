import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { googleOAuthService } from '../../services';
import { ENV } from '../../config/env';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      // Navigation handled by AuthContext
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!ENV.ENABLE_OAUTH || !ENV.GOOGLE_WEB_CLIENT_ID) {
      Alert.alert('Not Available', 'Google Sign-In is not configured');
      return;
    }

    setIsLoading(true);
    try {
      const authResponse = await googleOAuthService.signIn();
      await login({ email: authResponse.user.email, password: '' }, authResponse);
      Alert.alert('Success', 'Signed in with Google successfully!');
    } catch (error: any) {
      Alert.alert(
        'Google Sign-In Failed',
        error.message || 'Failed to sign in with Google'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.heading}>Welcome Back!</Text>
          <Text style={styles.subheading}>
            Log In to your Placoo account to explore your dream place to live across the whole world!
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>

          {/* Username/Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={[
              styles.inputWrapper,
              emailFocused ? styles.inputWrapperFocused : styles.inputWrapperUnfocused
            ]}>
              <Icon
                name="person-outline"
                size={20}
                color={emailFocused ? "#6366F1" : "#94A3B8"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[
              styles.inputWrapper,
              passwordFocused ? styles.inputWrapperFocused : styles.inputWrapperUnfocused
            ]}>
              <Icon
                name="lock-closed-outline"
                size={20}
                color={passwordFocused ? "#6366F1" : "#94A3B8"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Insert your password here"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Icon
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={passwordFocused ? "#6366F1" : "#94A3B8"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <Icon name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  welcomeSection: { paddingHorizontal: 24, marginBottom: 32 },
  heading: { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  subheading: { fontSize: 15, lineHeight: 22, color: '#64748B', marginBottom: 15 },
  formSection: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
  },
  inputWrapperFocused: { borderColor: '#6366F1', backgroundColor: '#F0F0FF' },
  inputWrapperUnfocused: { borderColor: '#F1F5F9', backgroundColor: '#F8FAF7' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#0F6980',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0F6980',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 12,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
  },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  forgotPasswordContainer: { alignItems: 'center', marginTop: 16 },
  forgotPassword: { fontSize: 15, color: '#64748B' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 14, color: '#94A3B8', marginHorizontal: 16 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 15,
    color: '#64748B',
  },
  signupLink: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '600',
  },
});