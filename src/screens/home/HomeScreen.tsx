import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { propertyService } from '../../services/propertyService';
import { apiService } from '../../services/api';
import { locationService, LocationInfo } from '../../services/locationService';
import { mapPropertiesToCards } from '../../utils/propertyMapper';
import PropertyCard from './components/PropertyCard';
import UserPropertiesList from './components/UserPropertiesList';
import CreatePropertyForm from '../../components/CreatePropertyForm';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'rent' | 'buy'>('rent');
  const [listingMode, setListingMode] = useState<'list' | 'create'>('list');
  const insets = useSafeAreaInsets();

  // Country selector state
  const [selectedCountry, setSelectedCountry] = useState<'ID' | 'MY'>('ID');
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Location state
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  // Real data state
  const [nearbyProperties, setNearbyProperties] = useState<any[]>([]);
  const [topRatedProperties, setTopRatedProperties] = useState<any[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [propertyCount, setPropertyCount] = useState<number>(0);

  // Loading states
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [loadingTopRated, setLoadingTopRated] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // User properties state
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideHeaderAnim = useRef(new Animated.Value(-50)).current;
  const scaleSearchAnim = useRef(new Animated.Value(0.9)).current;
  const slideSection1Anim = useRef(new Animated.Value(50)).current;
  const slideSection2Anim = useRef(new Animated.Value(50)).current;
  const slideSection3Anim = useRef(new Animated.Value(50)).current;

  // Country data
  const countries = [
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  ];

  const getCountryName = () => {
    return countries.find(c => c.code === selectedCountry)?.name || 'Indonesia';
  };

  // Get device location
  const getDeviceLocation = async () => {
    try {
      setLoadingLocation(true);
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      } else {
        // Use default location if permission denied or error
        setCurrentLocation(locationService.getDefaultLocation());
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      setCurrentLocation(locationService.getDefaultLocation());
    } finally {
      setLoadingLocation(false);
    }
  };

  // Fetch nearby properties based on current location or search
  const fetchNearbyProperties = async () => {
    try {
      setLoadingNearby(true);
      const location = currentLocation || locationService.getDefaultLocation();

      const { properties } = await propertyService.getNearbyProperties({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 50, // 50km radius
        limit: 10,
      });
      setNearbyProperties(mapPropertiesToCards(properties));
    } catch (error) {
      console.error('Failed to fetch nearby properties:', error);
      Alert.alert('Error', 'Failed to load nearby properties');
    } finally {
      setLoadingNearby(false);
    }
  };

  // Fetch top-rated properties based on location or search
  const fetchTopRatedProperties = async () => {
    try {
      setLoadingTopRated(true);
      const city = searchActive && searchQuery ? searchQuery : (currentLocation?.city || 'Yogyakarta');

      const { properties } = await propertyService.getTopRatedProperties({
        city,
        limit: 10,
        minRating: 4.0,
      });
      setTopRatedProperties(mapPropertiesToCards(properties));
    } catch (error) {
      console.error('Failed to fetch top-rated properties:', error);
      Alert.alert('Error', 'Failed to load top-rated properties');
    } finally {
      setLoadingTopRated(false);
    }
  };

  // Fetch user favorites
  const fetchFavoriteProperties = async () => {
    try {
      setLoadingFavorites(true);
      const { properties } = await propertyService.getUserFavorites({
        limit: 10,
      });
      setFavoriteProperties(mapPropertiesToCards(properties));
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      // Don't show alert for favorites as user might not be logged in
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Fetch property statistics based on location or search
  const fetchPropertyStats = async () => {
    try {
      const city = searchActive && searchQuery ? searchQuery : (currentLocation?.city || 'Yogyakarta');

      const stats = await propertyService.getPropertyStats({
        city,
        country: selectedCountry,
      });
      setPropertyCount(stats.total);
    } catch (error) {
      console.error('Failed to fetch property stats:', error);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setSearchActive(true);
      await fetchAllRentData();
    }
  };

  // Clear search
  const clearSearch = async () => {
    setSearchQuery('');
    setSearchActive(false);
    await fetchAllRentData();
  };

  // Fetch user properties
  const fetchUserProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await apiService.get<{ success: boolean; data: { properties: any[] } }>('/properties/my-properties');
      if (response.success) {
        setUserProperties(mapPropertiesToCards(response.data.properties));
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Fetch all data for rent tab
  const fetchAllRentData = async () => {
    await Promise.all([
      fetchNearbyProperties(),
      fetchTopRatedProperties(),
      fetchFavoriteProperties(),
      fetchPropertyStats(),
    ]);
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedTab === 'rent') {
      await fetchAllRentData();
    } else {
      await fetchUserProperties();
    }
    setRefreshing(false);
  };

  // Get location on mount
  useEffect(() => {
    getDeviceLocation();
  }, []);

  // Fetch data when location, country, or search changes
  useEffect(() => {
    if (selectedTab === 'rent' && currentLocation) {
      fetchAllRentData();
    } else if (selectedTab === 'buy') {
      fetchUserProperties();
    }
  }, [selectedTab, listingMode, currentLocation, searchActive, selectedCountry]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideHeaderAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleSearchAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideSection1Anim, {
        toValue: 0,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideSection2Anim, {
        toValue: 0,
        duration: 500,
        delay: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideSection3Anim, {
        toValue: 0,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleFavorite = async (id: string, e: any) => {
    e.stopPropagation();
    try {
      const result = await propertyService.toggleFavorite(id);

      // Update local state based on result
      if (result.isFavorited) {
        // Property was added to favorites - refresh favorites list
        await fetchFavoriteProperties();
      } else {
        // Property was removed from favorites - update local state
        setFavoriteProperties(prev => prev.filter(p => p.id !== id));
      }

      // Update the property in nearby and top-rated lists
      const updatePropertyFavorite = (properties: any[]) =>
        properties.map(p => {
          if (p.id === id) {
            return { ...p, isFavorited: result.isFavorited };
          }
          return p;
        });

      setNearbyProperties(prev => updatePropertyFavorite(prev));
      setTopRatedProperties(prev => updatePropertyFavorite(prev));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('Error', 'Failed to update favorite. Please try again.');
    }
  };

  const sectionStyle = (animValue: Animated.Value) => ({
    marginTop: 24,
    paddingLeft: 16,
    opacity: fadeAnim,
    transform: [{ translateY: animValue }]
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header Section */}
        <View style={[styles.headerSection, { paddingTop: insets.top + 16 }]}>
          <Animated.View
            style={[
              styles.topBar,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideHeaderAnim }]
              }
            ]}
          >
            <View style={styles.locationContainer}>
              <Text style={[styles.findText, { color: colors.textSecondary }]}>
                {selectedTab === 'rent' ? 'Find your place in' : 'List property in'}
              </Text>
              <TouchableOpacity
                style={styles.locationRow}
                onPress={() => setShowCountryModal(true)}
                activeOpacity={0.7}
              >
                <Icon name="location" size={20} color="#0F6980" />
                <Text style={[styles.locationText, { color: colors.text }]}>
                  {loadingLocation ? 'Getting location...' :
                    searchActive && searchQuery ? searchQuery :
                      currentLocation?.city || 'Yogyakarta'}, {getCountryName()}
                </Text>
                <Icon name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://assets.pikiran-rakyat.com/crop/0x0:0x0/720x0/webp/photo/2025/09/26/1043297320.jpg' }}
                style={styles.avatar}
              />
            </View>
          </Animated.View>

          {/* Search Bar - Always Visible */}
          <Animated.View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.surface,
                opacity: fadeAnim,
                transform: [{ scale: scaleSearchAnim }]
              }
            ]}
          >
            <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={
                selectedTab === 'rent'
                  ? "Search address, city, location"
                  : "Search your properties"
              }
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Icon name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
              <Icon name="search" size={20} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Start Toggle Section */}
          <Animated.View
            style={{
              marginTop: 24,
              opacity: fadeAnim,
              transform: [{ translateY: scaleSearchAnim }]
            }}
          >
            <Text style={[styles.questionText, { color: colors.text }]}>What do you need?</Text>
            <View style={[styles.toggleContainer, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedTab === 'rent' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedTab('rent')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    selectedTab === 'rent' ? { color: '#FFFFFF' } : { color: colors.textSecondary }
                  ]}
                >
                  I need to rent
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedTab === 'buy' && { backgroundColor: colors.primary }
                ]}
                onPress={() => {
                  setSelectedTab('buy');
                  setListingMode('list');
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.toggleText,
                    selectedTab === 'buy' ? { color: '#FFFFFF' } : { color: colors.textSecondary }
                  ]}
                >
                  I want to list
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          {/* End Toggle Section */}

        </View >

        {/* Content Section */}
        {
          selectedTab === 'rent' ? (
            <>
              {/* Near your location */}
              <Animated.View style={sectionStyle(slideSection1Anim)}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Near {searchActive && searchQuery ? searchQuery : (currentLocation?.city || 'Yogyakarta')}</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                      {propertyCount} properties in {searchActive && searchQuery ? searchQuery : (currentLocation?.city || 'Yogyakarta')}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                </View>
                {loadingNearby ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : nearbyProperties.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {nearbyProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onPress={() => (navigation as any).navigate('PropertyDetailFull', { property })}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={property.isFavorited || false}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Icon name="home-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No properties nearby</Text>
                  </View>
                )}
              </Animated.View>

              {/* Top rated in [City] */}
              <Animated.View style={sectionStyle(slideSection2Anim)}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Top rated in {searchActive && searchQuery ? searchQuery : (currentLocation?.city || 'Yogyakarta')}</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Highest rated properties</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                </View>
                {loadingTopRated ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : topRatedProperties.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {topRatedProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onPress={() => (navigation as any).navigate('PropertyDetailFull', { property })}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={property.isFavorited || false}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Icon name="star-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No top-rated properties yet</Text>
                  </View>
                )}
              </Animated.View>

              {/* Your favorites */}
              <Animated.View style={sectionStyle(slideSection3Anim)}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Your favorites</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                </View>
                {loadingFavorites ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : favoriteProperties.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {favoriteProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onPress={() => (navigation as any).navigate('PropertyDetailFull', { property })}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={true}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyFavContainer}>
                    <Icon name="heart-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyFavText, { color: colors.textSecondary }]}>No favorites yet</Text>
                    <Text style={[styles.emptyFavSubtext, { color: colors.textSecondary }]}>Tap the heart icon to save properties</Text>
                  </View>
                )}
              </Animated.View>
            </>
          ) : (
            listingMode === 'list' ? (
              loadingProperties ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary }}>Loading your properties...</Text>
                </View>
              ) : (
                <UserPropertiesList
                  properties={userProperties}
                  onAddPress={() => setListingMode('create')}
                  onPropertyPress={(property) => (navigation as any).navigate('PropertyDetailLandlord', { property })}
                  containerStyle={{ opacity: fadeAnim, transform: [{ translateY: slideSection1Anim }] }}
                />
              )
            ) : (
              <CreatePropertyForm
                onBack={() => setListingMode('list')}
                onSuccess={() => {
                  setListingMode('list');
                  fetchUserProperties();
                }}
                showHeader={true}
              />
            )
          )
        }
      </ScrollView>

      {/* Country Selector Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryOption,
                    selectedCountry === country.code && styles.selectedCountryOption
                  ]}
                  onPress={() => {
                    setSelectedCountry(country.code as 'ID' | 'MY');
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={[
                    styles.countryName,
                    { color: colors.text },
                    selectedCountry === country.code && styles.selectedCountryText
                  ]}>
                    {country.name}
                  </Text>
                  {selectedCountry === country.code && (
                    <Icon name="checkmark-circle" size={24} color="#0F6980" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerSection: {
    padding: 16,
    // paddingTop removed
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 20,
  },
  locationContainer: {
    flex: 1,
  },
  findText: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterButton: {
    padding: 4,
  },
  sectionHeader: { // Used in HomeScreen for rent sections
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '500',
  },
  horizontalScroll: {
    paddingBottom: 8,
  },
  emptyFavContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyFavText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyFavSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  selectedCountryOption: {
    width: '90%',
    backgroundColor: '#E0F2F7',
    borderWidth: 2,
    borderColor: '#0F6980',
  },
  countryFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  selectedCountryText: {
    color: '#0F6980',
    fontWeight: '700',
  },
});

export default HomeScreen;
