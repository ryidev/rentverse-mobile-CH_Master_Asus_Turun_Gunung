import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Input, Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PersonalScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [profileImage, setProfileImage] = useState(user?.avatar || '');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setProfileImage(user.avatar || '');
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick image');
      } else if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0].uri || '');
        setIsEditing(true);
      }
    });
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
    };

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      valid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format';
      valid = false;
    }

    // Validate phone (optional but if provided should be valid)
    if (phone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Invalid phone number';
        valid = false;
      }
    }

    // Validate password if changing
    if (newPassword) {
      if (!currentPassword) {
        newErrors.password = 'Current password is required';
        valid = false;
      } else if (newPassword.length < 6) {
        newErrors.password = 'New password must be at least 6 characters';
        valid = false;
      } else if (newPassword !== confirmPassword) {
        newErrors.password = 'Passwords do not match';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        name,
        email,
        phone,
        avatar: profileImage,
        ...(newPassword && {
          currentPassword,
          newPassword,
        }),
      };

      // Call update profile API
      await updateProfile(updateData);
      
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setProfileImage(user?.avatar || '');
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({ name: '', email: '', phone: '', password: '' });
    setIsEditing(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={[styles.profileImage, { borderColor: colors.primary }]} />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                <Icon name="account" size={60} color={colors.textSecondary} />
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.editImageButton, { backgroundColor: colors.card, borderColor: colors.card }]}
              onPress={handleImagePicker}
              activeOpacity={0.7}
            >
              <Icon name="camera" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.profileName, { color: colors.text }]}>{name || 'Your Name'}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{email || 'your.email@example.com'}</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          
          <Input
            label="Full Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setIsEditing(true);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Enter your full name"
            leftIcon="account"
            error={errors.name}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setIsEditing(true);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="your.email@example.com"
            leftIcon="email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setIsEditing(true);
              if (errors.phone) setErrors({ ...errors, phone: '' });
            }}
            placeholder="+62 812 3456 7890"
            leftIcon="phone"
            keyboardType="phone-pad"
            error={errors.phone}
            containerStyle={styles.inputContainer}
          />
        </View>

        {/* Password Section */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Leave blank if you don't want to change your password
          </Text>

          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              setIsEditing(true);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            placeholder="Enter current password"
            leftIcon="lock"
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="New Password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setIsEditing(true);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            placeholder="Enter new password"
            leftIcon="lock-reset"
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setIsEditing(true);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            placeholder="Confirm new password"
            leftIcon="lock-check"
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={errors.password}
            containerStyle={styles.inputContainer}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing && (
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.button}
              disabled={isLoading}
            />
          )}
          <Button
            title={isEditing ? "Save Changes" : "Update Profile"}
            onPress={handleSave}
            variant="primary"
            style={isEditing ? styles.button : styles.fullButton}
            isLoading={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
  fullButton: {
    flex: 1,
  },
});

export default PersonalScreen;
