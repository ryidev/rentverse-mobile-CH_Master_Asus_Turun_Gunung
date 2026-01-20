import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import PropertyDetailFullScreen from '../screens/property/PropertyDetailFullScreen';
import PropertyDetailLandlord from '../screens/property/PropertyDetailLandlord';
import PropertyListScreen from '../screens/property/PropertyListScreen';
import RentBookingScreen from '../screens/booking/RentBookingScreen';
import EditPropertyScreen from '../screens/property/EditPropertyScreen';
import CreatePropertyScreen from '../screens/property/CreatePropertyScreen';
import PropertyDetailScreen from '../screens/property/PropertyDetailScreen';
import { useTheme } from '../context/ThemeContext';

export type HomeStackParamList = {
  HomeMain: undefined;
  PropertyDetailFull: { property: any };
  PropertyDetailLandlord: { property: any };
  RentBooking: { property: any };
  EditProperty: { property: any };
  CreateProperty: undefined;
  PropertyDetail: { propertyId: string };
  PropertyList: {
    title: string;
    filters?: {
      city?: string;
      state?: string;
      country?: string;
      sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
      minPrice?: number;
      maxPrice?: number;
      bedrooms?: number;
      bathrooms?: number;
      propertyTypeId?: string;
      search?: string;
    };
    isFavorites?: boolean;
  };
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
      <Stack.Screen
        name="PropertyDetailLandlord"
        component={PropertyDetailLandlord}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProperty"
        component={EditPropertyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateProperty"
        component={CreatePropertyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PropertyList"
        component={PropertyListScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
