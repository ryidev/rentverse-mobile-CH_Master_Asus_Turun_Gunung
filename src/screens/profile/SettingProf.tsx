import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

interface SettingItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingProfScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, themeMode, setThemeMode, colors } = useTheme();
  const { currency, setCurrency } = useCurrency();

  // Security Settings
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification Settings
  const [chatNotifications, setChatNotifications] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [propertyUpdates, setPropertyUpdates] = useState(true);

  // Privacy Settings
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleBiometricToggle = (value: boolean) => {
    if (value) {
      // In production, you would implement actual biometric authentication here
      Alert.alert(
        'Enable Biometric Login',
        'Do you want to enable Face ID / Touch ID for quick login?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => setBiometricEnabled(true),
          },
        ]
      );
    } else {
      setBiometricEnabled(false);
    }
  };

  const handle2FAToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'You will receive a verification code via SMS or email when logging in.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => setTwoFactorEnabled(true),
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Your account will be less secure without 2FA.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            onPress: () => setTwoFactorEnabled(false),
            style: 'destructive',
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion
            console.log('Account deletion requested');
          },
        },
      ]
    );
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
  };

  const sections: SettingSection[] = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          icon: 'theme-light-dark',
          title: 'Theme',
          subtitle: `Currently: ${themeMode === 'auto' ? 'Auto (System)' : themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}`,
          type: 'navigation',
          onPress: () => {
            Alert.alert('Select Theme', 'Choose your preferred theme', [
              {
                text: 'Light Mode',
                onPress: () => handleThemeChange('light'),
              },
              {
                text: 'Dark Mode',
                onPress: () => handleThemeChange('dark'),
              },
              {
                text: 'Auto (System)',
                onPress: () => handleThemeChange('auto'),
              },
              { text: 'Cancel', style: 'cancel' },
            ]);
          },
        },
      ],
    },
    {
      title: 'Security & Access',
      items: [
        {
          id: 'biometric',
          icon: 'fingerprint',
          title: Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Biometric Login',
          subtitle: 'Quick login with biometric authentication',
          type: 'toggle',
          value: biometricEnabled,
          onValueChange: handleBiometricToggle,
        },
        {
          id: '2fa',
          icon: 'shield-check',
          title: 'Two-Factor Authentication',
          subtitle: 'Add extra security to your account',
          type: 'toggle',
          value: twoFactorEnabled,
          onValueChange: handle2FAToggle,
        },
        {
          id: 'devices',
          icon: 'devices',
          title: 'Linked Devices',
          subtitle: 'Manage devices logged into your account',
          type: 'navigation',
          onPress: () => {
            // Navigate to linked devices screen
            Alert.alert('Linked Devices', 'Feature coming soon');
          },
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'chat',
          icon: 'message-text',
          title: 'Chat Messages',
          subtitle: 'Notifications from property owners',
          type: 'toggle',
          value: chatNotifications,
          onValueChange: setChatNotifications,
        },
        {
          id: 'payment',
          icon: 'bell-ring',
          title: 'Payment Reminders',
          subtitle: 'Rent due date notifications',
          type: 'toggle',
          value: paymentReminders,
          onValueChange: setPaymentReminders,
        },
        {
          id: 'updates',
          icon: 'home-alert',
          title: 'Property Updates',
          subtitle: 'New properties matching your wishlist',
          type: 'toggle',
          value: propertyUpdates,
          onValueChange: setPropertyUpdates,
        },
      ],
    },
    {
      title: 'Transaction & Privacy',
      items: [
        {
          id: 'payment-method',
          icon: 'credit-card',
          title: 'Payment Methods',
          subtitle: 'Manage your payment cards and wallets',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Payment Methods', 'Feature coming soon');
          },
        },
        {
          id: 'currency',
          icon: 'currency-usd',
          title: 'Currency',
          subtitle: currency === 'IDR' ? 'Indonesia (IDR)' : 'Malaysia (MYR)',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Select Currency', 'Choose your preferred currency', [
              { text: 'Indonesia (IDR)', onPress: () => setCurrency('IDR') },
              { text: 'Malaysia (MYR)', onPress: () => setCurrency('MYR') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          },
        },
        {
          id: 'location',
          icon: 'map-marker',
          title: 'Location Access',
          subtitle: 'Find properties near you',
          type: 'toggle',
          value: locationEnabled,
          onValueChange: setLocationEnabled,
        },
      ],
    },
    {
      title: 'Help & Legal',
      items: [
        {
          id: 'help',
          icon: 'help-circle',
          title: 'Help Center',
          subtitle: 'FAQ and support articles',
          type: 'navigation',
          onPress: () => {
            (navigation as any).navigate('Faq');
          },
        },
        {
          id: 'privacy',
          icon: 'shield-account',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Privacy Policy', 'Feature coming soon');
          },
        },
        {
          id: 'terms',
          icon: 'file-document',
          title: 'Terms & Conditions',
          subtitle: 'Legal terms of service',
          type: 'navigation',
          onPress: () => {
            Alert.alert('Terms & Conditions', 'Feature coming soon');
          },
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'delete',
          icon: 'delete-forever',
          title: 'Delete Account',
          subtitle: 'Permanently remove your account',
          type: 'action',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingItem, { backgroundColor: colors.card, borderBottomColor: colors.divider }]}
        onPress={item.type === 'toggle' ? undefined : item.onPress}
        disabled={item.type === 'toggle'}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <Icon
            name={item.icon}
            size={24}
            color={item.id === 'delete' ? colors.error : colors.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.itemTitle,
              { color: item.id === 'delete' ? colors.error : colors.text },
            ]}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{
              false: colors.switchTrack,
              true: colors.switchTrackActive,
            }}
            thumbColor={colors.switchThumb}
            ios_backgroundColor={colors.switchTrack}
          />
        ) : (
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {sections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.items.map((item) => renderSettingItem(item))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textLight }]}>
            Version 1.0.0
          </Text>
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
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 13,
  },
});

export default SettingProfScreen;
