import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from '../types';
import ExploreNavigator from './ExploreNavigator';
import HomeStackNavigator from './HomeStackNavigator';
import ProfileNavigator from './ProfileNavigator';
import SavedScreen from '../screens/home/SavedScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '500',
          marginTop: -2,
          marginBottom: 8,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 75,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: string;

          if (route.name === 'HomeScreen') {
            iconName = 'home';
          } else if (route.name === 'Explore') {
            iconName = 'sign-direction';
          } else if (route.name === 'Saved') {
            iconName = 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = 'account-outline';
          } else {
            iconName = 'circle';
          }

          return (
            <Icon
              name={iconName}
              size={26}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeScreen"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreNavigator}
        options={{
          tabBarLabel: 'Explore',
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarLabel: 'Saved',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
