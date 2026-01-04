import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import PropertyDetailFullScreen from '../screens/property/PropertyDetailFullScreen';
import { useTheme } from '../context/ThemeContext';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  PropertyDetailFull: { property: any };
};

const Stack = createStackNavigator<AdminStackParamList>();

const AdminNavigator: React.FC = () => {
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PropertyDetailFull"
        component={PropertyDetailFullScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
