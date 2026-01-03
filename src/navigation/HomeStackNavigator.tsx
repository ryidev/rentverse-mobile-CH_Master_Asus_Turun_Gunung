import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import PropertyDetailFullScreen from '../screens/property/PropertyDetailFullScreen';
import RentBookingScreen from '../screens/booking/RentBookingScreen';
import { useTheme } from '../context/ThemeContext';

export type HomeStackParamList = {
  HomeMain: undefined;
  PropertyDetailFull: { property: any };
  RentBooking: { property: any };
};

const Stack = createStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
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
        },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PropertyDetailFull"
        component={PropertyDetailFullScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RentBooking"
        component={RentBookingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
