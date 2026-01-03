import React, { useState, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleIconAnim = new Animated.Value(0);
  const bounceAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleIconAnim, {
        toValue: 1,
        tension: 40,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement forgot password API call
      // await authService.forgotPassword(email);
      
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      
      Alert.alert(
        'Success',
        'Password reset link has been sent to your email. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send reset link. Please try again.'
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

        {/* Icon Section */}
        <Animated.View 
          style={[
            styles.iconSection,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleIconAnim },
                {
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Icon name="lock-closed-outline" size={60} color="#6366F1" />
          </View>
        </Animated.View>

        {/* Title Section */}
        <Animated.View 
          style={[
            styles.titleSection,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <Text style={styles.heading}>Forgot Password?</Text>
          <Text style={styles.subheading}>
            Don't worry! Enter your email address and we'll send you a link to reset your password.
          </Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View 
          style={[
            styles.formSection,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[
              styles.inputWrapper, 
              emailFocused ? styles.inputWrapperFocused : styles.inputWrapperUnfocused
            ]}>
              <Icon 
                name="mail-outline" 
                size={20} 
                color={emailFocused ? "#6366F1" : "#94A3B8"} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Reset Button */}
          <TouchableOpacity 
            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]} 
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backToLoginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Info Box */}
        <Animated.View 
          style={[
            styles.infoBox,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <Icon name="information-circle-outline" size={20} color="#6366F1" />
          <Text style={styles.infoText}>
            If you don't receive an email within 5 minutes, check your spam folder or try again.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: 40 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 20 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center' 
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: { 
    paddingHorizontal: 24, 
    marginBottom: 32,
    alignItems: 'center',
  },
  heading: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#000', 
    marginBottom: 12,
    textAlign: 'center',
  },
  subheading: { 
    fontSize: 15, 
    lineHeight: 22, 
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  formSection: { 
    paddingHorizontal: 24 
  },
  inputGroup: { 
    marginBottom: 24 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#1E293B', 
    marginBottom: 8 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
  },
  inputWrapperFocused: { 
    borderColor: '#6366F1', 
    backgroundColor: '#F0F0FF' 
  },
  inputWrapperUnfocused: { 
    borderColor: '#F1F5F9', 
    backgroundColor: '#F8FAF7' 
  },
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#000' 
  },
  resetButton: {
    backgroundColor: '#6366F1',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    elevation: 4,
  },
  resetButtonDisabled: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
  },
  resetButtonText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '600' 
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 15,
    color: '#64748B',
  },
  backToLoginLink: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F0FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 32,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen;
