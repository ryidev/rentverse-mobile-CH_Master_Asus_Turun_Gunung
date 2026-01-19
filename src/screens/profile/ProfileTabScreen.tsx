import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const ProfileTabScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    { id: 1, icon: 'person-outline', title: 'Personal details', screen: 'Personal' },
    { id: 5, icon: 'calendar-outline', title: 'My Bookings', screen: 'BookingHistory' }, // New Item
    { id: 2, icon: 'settings-outline', title: 'Settings', screen: 'Settings' },
    { id: 3, icon: 'card-outline', title: 'Payment details', screen: null },
    { id: 4, icon: 'help-circle-outline', title: 'FAQ', screen: 'FaqProf' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={[styles.header, { paddingTop: insets.top + 30 }]}>
        <Animated.View style={[styles.avatarContainer, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
          <Image
            source={{
              uri: user?.avatarUrl || user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&size=200&background=6366f1&color=fff'
            }}
            style={styles.avatar}
          />
        </Animated.View>
        <Animated.Text style={[styles.name, { color: colors.text, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {user?.name || 'User Name'}
        </Animated.Text>
        <Animated.Text style={[styles.email, { color: colors.textSecondary, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {user?.email || 'user@example.com'}
        </Animated.Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.id}
            style={{
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50 * (index + 1), 0] // Staggered effect
                })
              }]
            }}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (item.screen) {
                  navigation.navigate(item.screen as never);
                } else {
                  Alert.alert('Coming Soon', 'This feature is under development');
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
                <Icon name={item.icon} size={24} color={colors.text} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>
              <Icon name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Logout */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
            <Icon name="log-out-outline" size={24} color={colors.error || '#ff0000'} />
          </View>
          <Text style={[styles.menuText, { color: colors.error || '#ff0000' }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacing for tab bar */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 60,
    backgroundColor: '#dbd5e1ff',
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  email: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginHorizontal: 24,
    marginVertical: 10,
  },
  menuSection: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 16,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  bottomSpace: {
    height: 100,
  },
});

export default ProfileTabScreen;
