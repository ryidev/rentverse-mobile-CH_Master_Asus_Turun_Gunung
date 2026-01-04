import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import MapViewComponent from '../../components/MapView';
import FilterModal, { FilterValues } from '../../components/FilterModal';
import { propertyService } from '../../services/propertyService';
import { Property } from '../../types';
import { PropertyCardSkeleton, CategoryCardSkeleton } from '../../components/SkeletonLoader';

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'rent' | 'buy'>('rent');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [properties, setProperties] = useState<Property[]>([]);
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [amenityCategories, setAmenityCategories] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    page: 1,
    limit: 100, // Increased limit to show more properties on map
    sortBy: 'newest',
  });

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Get user location and fetch nearby properties
    requestLocationAndFetchNearby();
    fetchAmenityCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProperties();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [filters.city, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.bathrooms, filters.amenities, filters.sortBy, searchText]);

  const requestLocationAndFetchNearby = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getUserLocationAndFetch();
        }
      } else {
        getUserLocationAndFetch();
      }
    } catch (err) {
      console.warn('Location permission error:', err);
    }
  };

  const getUserLocationAndFetch = () => {
    Geolocation.getCurrentPosition(
      (position: any) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        fetchNearbyProperties(latitude, longitude);
      },
      (error: any) => {
        console.warn('Error getting location:', error);
        // Fallback to default location (Kuala Lumpur)
        fetchNearbyProperties(3.1390, 101.6869);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  const fetchNearbyProperties = async (latitude: number, longitude: number) => {
    try {
      setLoadingNearby(true);
      const response = await propertyService.getNearbyProperties({
        latitude,
        longitude,
        radius: 10, // 10km radius
        limit: 20,
      });
      setNearbyProperties(response.properties || []);
    } catch (error) {
      console.error('Failed to fetch nearby properties:', error);
      setNearbyProperties([]);
    } finally {
      setLoadingNearby(false);
    }
  };

  const fetchAmenityCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await propertyService.getAmenityCategories();
      setAmenityCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch amenity categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Only send filters that have values (not undefined/empty)
      const params: any = {
        page: filters.page || 1,
        limit: filters.limit || 100,
        sortBy: filters.sortBy || 'newest',
      };

      // Only add filter params if they have values
      if (filters.city) params.city = filters.city;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;
      if (filters.bathrooms) params.bathrooms = filters.bathrooms;
      if (filters.amenities && filters.amenities.length > 0) params.amenities = filters.amenities.join(',');
      if (searchText) params.search = searchText;

      const response = await propertyService.getPropertiesWithFilters(params);
      setProperties(response.properties || []);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      // Set empty array on error to prevent crash
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Map properties with coordinates
  const mapProperties = properties
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      id: p.id,
      title: p.title,
      latitude: p.latitude!,
      longitude: p.longitude!,
      price: p.price,
      image: p.images?.[0],
    }));

  const getCategoryIcon = (categoryName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Comfort': 'bed-outline',
      'Safety': 'shield-checkmark-outline',
      'Entertainment': 'game-controller-outline',
      'Convenience': 'location-outline',
      'Recreation': 'fitness-outline',
      'Utilities': 'water-outline',
      'Technology': 'wifi-outline',
      'Kitchen': 'restaurant-outline',
      'Outdoor': 'leaf-outline',
      'Accessibility': 'accessibility-outline',
    };
    return iconMap[categoryName] || 'home-outline';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Search Bar */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search address, city, location"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Icon name="options-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(newFilters) => {
          setFilters(prev => ({ ...prev, ...newFilters }));
        }}
        initialFilters={filters}
      />

      {/* Map View */}
      <Animated.View
        style={[
          styles.mapSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {mapProperties && mapProperties.length > 0 ? (
          <MapViewComponent
            properties={mapProperties}
            height={250}
            onMarkerPress={(property) => {
              console.log('Property clicked:', property);
              (navigation as any).navigate('PropertyDetailFull', { propertyId: property.id });
            }}
          />
        ) : (
          <View style={[styles.emptyMapContainer, { backgroundColor: colors.surface }]}>
            <Icon name="map-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No properties to display on map</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Location Properties</Text>
            {userLocation && (
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Within 10km radius
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => (navigation as any).navigate('ExploreDetail', {
            properties: nearbyProperties,
            title: 'Nearby Properties',
            location: userLocation,
            isNearby: true
          })}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {loadingNearby ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </ScrollView>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {nearbyProperties && nearbyProperties.length > 0 ? (
              nearbyProperties.map(property => (
                <TouchableOpacity
                  key={property.id}
                  style={[styles.propertyCard, { backgroundColor: colors.card }]}
                  onPress={() => (navigation as any).navigate('PropertyDetailFull', { propertyId: property.id })}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: property.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.propertyImage} />
                  <View style={styles.propertyInfo}>
                    <Text style={[styles.propertyTitle, { color: colors.text }]} numberOfLines={2}>
                      {property.title}
                    </Text>
                    <View style={styles.rentedRow}>
                      <Icon name="location-outline" size={14} color="#0F6980" />
                      <Text style={styles.rentedText}>
                        {property.city || ''}{property.city && property.state ? ', ' : ''}{property.state || ''}
                      </Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceText, { color: colors.text }]}>${property.price}</Text>
                      <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>/month</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No nearby properties found
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>

      {/* Filtered Properties Section */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Properties</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {properties.length} properties found
            </Text>
          </View>
          <TouchableOpacity onPress={() => (navigation as any).navigate('ExploreDetail', {
            properties: properties,
            title: 'All Properties',
            filters: filters
          })}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {loading ? (
            <>
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </>
          ) : properties && properties.length > 0 ? (
            properties.slice(0, 10).map(property => (
              <TouchableOpacity
                key={property.id}
                style={[styles.propertyCard, { backgroundColor: colors.card }]}
                onPress={() => (navigation as any).navigate('PropertyDetailFull', { propertyId: property.id })}
                activeOpacity={0.9}
              >
                <Image source={{ uri: property.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.propertyImage} />
                <View style={styles.propertyInfo}>
                  <Text style={[styles.propertyTitle, { color: colors.text }]} numberOfLines={2}>
                    {property.title}
                  </Text>
                  <View style={styles.rentedRow}>
                    <Icon name="location-outline" size={14} color="#0F6980" />
                    <Text style={styles.rentedText}>
                      {property.city || ''}{property.city && property.state ? ', ' : ''}{property.state || ''}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: colors.text }]}>${property.price}</Text>
                    <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>/month</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No properties found. Try adjusting your filters.
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Amenity Categories - Exploring Living Style */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Exploring about your living style?</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Browse by amenity categories</Text>
          </View>
        </View>

        {loadingCategories ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
          </ScrollView>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {amenityCategories && amenityCategories.length > 0 ? (
              amenityCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: colors.card }]}
                  onPress={() => {
                    setFilters(prev => ({ ...prev, amenityCategory: category.name }));
                    setShowFilterModal(true);
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.categoryIconContainer}>
                    <Icon
                      name={getCategoryIcon(category.name)}
                      size={40}
                      color="#0F6980"
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryTitle, { color: colors.text }]} numberOfLines={2}>
                      {category.name}
                    </Text>
                    {category.description && (
                      <Text style={[styles.categoryDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                        {category.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No categories available</Text>
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    padding: 16,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 20,

  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 26,
    marginHorizontal: 16,
    height: 52,
    marginTop: 75,
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
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  mapSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  tabActive: {
    backgroundColor: '#0F6980',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginTop: 24,
    paddingLeft: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
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
  propertyCard: {
    width: 175,
    marginRight: 26,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyCard1: {
    width: 240,
    marginRight: 26,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    padding: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    marginLeft: 2,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  locationSubtext: {
    fontSize: 14,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
  },
  emptyFavText: {
    fontSize: 15,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  rentedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  rentedText: {
    fontSize: 12,
    color: '#0F6980',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  emptyMapContainer: {
    height: 250,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  categoryCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 140,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F698015',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ExploreScreen;
