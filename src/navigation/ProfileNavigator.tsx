import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileTabScreen from '../screens/profile/ProfileTabScreen';
import PersonalScreen from '../screens/profile/PersonalProf';
import SettingProfScreen from '../screens/profile/SettingProf';
import BookingHistoryScreen from '../screens/profile/BookingHistoryScreen';
import FaqProfScreen from '../screens/profile/FaqProf';
import { useTheme } from '../context/ThemeContext';

export type ProfileStackParamList = {
  ProfileTab: undefined;
  Personal: undefined;
  Settings: undefined;
  BookingHistory: undefined;
  Faq: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="ProfileTab"
        component={ProfileTabScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Personal"
        component={PersonalScreen}
        options={({ navigation }) => ({
          title: 'Edit Profile',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 16 }}
            >
              <Icon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingProfScreen}
        options={({ navigation }) => ({
          title: 'Settings',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 16 }}
            >
              <Icon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="BookingHistory"
        component={BookingHistoryScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Faq"
        component={FaqProfScreen}
        options={({ navigation }) => ({
          title: 'Help Center',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 16 }}
            >
              <Icon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
