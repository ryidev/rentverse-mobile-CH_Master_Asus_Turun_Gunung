import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';
import { Colors } from '../../constants';
import CreatePropertyForm from '../../components/CreatePropertyForm';
import { apiService } from '../../services/api';

// Since we are likely in HomeStack, adjust types if needed or keep using HomeStackParamList
// If HomeStackParamList is not available usually, define local or import correct one.
// Assuming HomeStackParamList from navigation/HomeStackNavigator is what we use:
import { HomeStackParamList as LocalHomeStackParamList } from '../../navigation/HomeStackNavigator';

type EditPropertyScreenNavigationProp = StackNavigationProp<
  LocalHomeStackParamList,
  'EditProperty'
>;
type EditPropertyScreenRouteProp = RouteProp<LocalHomeStackParamList, 'EditProperty'>;

interface Props {
  navigation: any; // Type workaround to avoid complex type matching issues
  route: any;
}

const EditPropertyScreen: React.FC<Props> = ({ navigation, route }) => {
  const { property } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [fullPropertyData, setFullPropertyData] = useState<any>(property);

  useEffect(() => {
    // If we only have partial data, we might want to fetch full details.
    // However, property passed from detail screen usually has enough info.
    // If needed: fetchPropertyDetails();
  }, [property.id]);

  const handleSuccess = () => {
    navigation.popToTop(); // Go back to Home
    // Or navigation.navigate('HomeMain');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CreatePropertyForm
        onBack={() => navigation.goBack()}
        onSuccess={handleSuccess}
        showHeader={true}
        initialData={fullPropertyData}
        mode="edit"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default EditPropertyScreen;
