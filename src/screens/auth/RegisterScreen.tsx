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
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { googleOAuthService } from '../../services';
import { ENV } from '../../config/env';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
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

  const handleRegister = async () => {
    if (!name || !email || !password || !phoneNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({ name, email, password, phone: phoneNumber });
      Alert.alert(
        'Success',
        'Account created successfully! Please login.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Failed to create account'
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
      await register({
        name: authResponse.user.name,
        email: authResponse.user.email,
        password: '', // Not needed for OAuth
        phone: authResponse.user.phone,
      }, authResponse);
      Alert.alert('Success', 'Signed up with Google successfully!');
    } catch (error: any) {
      Alert.alert(
        'Google Sign-Up Failed',
        error.message || 'Failed to sign up with Google'
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
        <Animated.View
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.heading}>Let's Explore Together!</Text>
          <Text style={styles.subheading}>
            Create your Placoo account to explore your dream place to live across the whole world!
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
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[
              styles.inputWrapper,
              nameFocused ? styles.inputWrapperFocused : styles.inputWrapperUnfocused
            ]}>
              <Icon name="person-outline" size={20} color={nameFocused ? "#6366F1" : "#94A3B8"} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username / Email</Text>
            <View style={[
              styles.inputWrapper,
              emailFocused ? styles.inputWrapperFocused : styles.inputWrapperUnfocused
            ]}>
              <Icon name="mail-outline" size={20} color={emailFocused ? "#6366F1" : "#94A3B8"} style={styles.inputIcon} />
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
              <Icon name="lock-closed-outline" size={20} color={passwordFocused ? "#6366F1" : "#94A3B8"} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Insert your password here"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
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

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone number</Text>
            <View style={[
              styles.inputWrapper,
              phoneFocused ? styles.inputWrapperFocused : styles.inputWrapperUnfocused
            ]}>
              <TouchableOpacity style={styles.countryCodeButton}>
                <Text style={styles.flagEmoji}>🇮🇩</Text>
                <Icon name="chevron-down" size={16} color="#94A3B8" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="812xxxx"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <Icon name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.googleButtonText}>Sign up with Google</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signupLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  welcomeSection: { paddingHorizontal: 24, marginBottom: 20 },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  subheading: { fontSize: 15, lineHeight: 22, color: '#64748B', marginBottom: 15 },
  formSection: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
  },
  inputWrapperFocused: { borderColor: '#6366F1', backgroundColor: '#F0F0FF' },
  inputWrapperUnfocused: { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  inputIcon: { marginRight: 12 },
  countryCodeButton: { flexDirection: 'row', alignItems: 'center', marginRight: 12, gap: 4 },
  flagEmoji: { fontSize: 20 },
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
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
  },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 14, color: '#94A3B8', marginHorizontal: 16 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
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