import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExploreScreen from '../screens/explore/ExploreScreen';
import ExploreDetail from '../screens/explore/ExploreDetail';
import PropertyDetailFullScreen from '../screens/property/PropertyDetailFullScreen';
import PropertyListScreen from '../screens/property/PropertyListScreen';
import RentBookingScreen from '../screens/booking/RentBookingScreen';
import { useTheme } from '../context/ThemeContext';

export type ExploreStackParamList = {
  ExploreMain: undefined;
  ExploreDetail: { properties: any[]; title: string; filters?: any; location?: any; isNearby?: boolean };
  PropertyDetailFull: { propertyId: string };
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
      latitude?: number;
      longitude?: number;
      radius?: number;
    };
    isFavorites?: boolean;
  };
  RentBooking: { property: any };
};

const Stack = createStackNavigator<ExploreStackParamList>();

const ExploreNavigator: React.FC = () => {
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
        name="ExploreMain"
        component={ExploreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExploreDetail"
        component={ExploreDetail}
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
        name="PropertyList"
        component={PropertyListScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ExploreNavigator;
