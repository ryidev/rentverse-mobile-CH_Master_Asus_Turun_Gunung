import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { googleOAuthService } from '../../services';
import { ENV } from '../../config/env';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      // Navigation handled by AuthContext after successful login
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid email or password'
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <Animated.View
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.heading, { color: colors.text }]}>Welcome Back!</Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Log In to your Placoo account to explore your dream place to live across the whole world!
          </Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View
          style={[
            styles.formSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >

          {/* Username/Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <View style={[
              styles.inputWrapper,
              {
                backgroundColor: emailFocused ? colors.surface : colors.card,
                borderColor: emailFocused ? colors.primary : colors.border
              }
            ]}>
              <Icon
                name="person-outline"
                size={20}
                color={emailFocused ? colors.primary : colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="example@gmail.com"
                placeholderTextColor={colors.textLight}
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
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[
              styles.inputWrapper,
              {
                backgroundColor: passwordFocused ? colors.surface : colors.card,
                borderColor: passwordFocused ? colors.primary : colors.border
              }
            ]}>
              <Icon
                name="lock-closed-outline"
                size={20}
                color={passwordFocused ? colors.primary : colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Insert your password here"
                placeholderTextColor={colors.textLight}
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
                  color={passwordFocused ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
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
            <Text style={[styles.forgotPassword, { color: colors.textSecondary }]}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity style={[styles.googleButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleGoogleSignIn}>
            <Icon name="logo-google" size={20} color="#DB4437" />
            <Text style={[styles.googleButtonText, { color: colors.text }]}>
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  welcomeSection: { paddingHorizontal: 24, marginBottom: 32 },
  heading: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subheading: { fontSize: 15, lineHeight: 22, marginBottom: 15 },
  formSection: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  loginButton: {
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
    elevation: 0,
  },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  forgotPasswordContainer: { alignItems: 'center', marginTop: 16 },
  forgotPassword: { fontSize: 15 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 14, marginHorizontal: 16 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    paddingVertical: 16,
    borderWidth: 1,
    gap: 12,
  },
  googleButtonText: { fontSize: 16, fontWeight: '600' },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 15,
  },
  signupLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});