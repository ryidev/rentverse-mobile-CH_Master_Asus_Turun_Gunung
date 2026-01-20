import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCurrency } from '../../context/CurrencyContext';
import { propertyService } from '../../services/propertyService';
import { Property } from '../../types';

const { width } = Dimensions.get('window');

const PropertyDetailFullScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { property?: Property; propertyId?: string };
  const { formatPrice } = useCurrency();
  const insets = useSafeAreaInsets();

  const [property, setProperty] = useState<Property | null>(params.property || null);
  const [loading, setLoading] = useState(!params.property);
  const [isFavorite, setIsFavorite] = useState(params.property?.isFavorited || false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  // Get property's currency code (fallback to IDR if not set)
  const currencyCode = property?.currencyCode || 'IDR';

  useEffect(() => {
    loadPropertyDetails();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadPropertyDetails = async () => {
    try {
      if (params.propertyId && !property) {
        setLoading(true);
        // This will now be unauthenticated to avoid 500 error
        const data = await propertyService.getPropertyById(params.propertyId);
        setProperty(data);

        // Fetch favorite status separately if logged in (handled by service)
        const isFav = await propertyService.checkFavoriteStatus(params.propertyId);
        setIsFavorite(isFav);
      } else if (property) {
        // We have property data, but need to refresh specific details
        // Get fresh data anonymously to avoid crash
        const data = await propertyService.getPropertyById(property.id);
        setProperty(prev => ({ ...prev, ...data }));

        // Check favorite status separately
        const isFav = await propertyService.checkFavoriteStatus(property.id);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Failed to load property details:', error);
      Alert.alert('Error', 'Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!property) return;

    try {
        const previousState = isFavorite;
        setIsFavorite(!previousState); // Optimistic update
        await propertyService.toggleFavorite(property.id);
    } catch (error) {
        setIsFavorite(isFavorite); // Revert on error
        console.error('Failed to toggle favorite:', error);
    }
  };

  const defaultFacilities = [
    { icon: 'snow-outline', name: 'Air conditioner' },
    { icon: 'restaurant-outline', name: 'Kitchen' },
    { icon: 'car-outline', name: 'Free parking' },
    { icon: 'wifi', name: 'Free WiFi' },
  ];

  const publicFacilities = [
    { icon: 'basket-outline', name: 'Minimarket', distance: '300m' },
    { icon: 'medkit-outline', name: 'Hospital', distance: '1km' },
    { icon: 'fast-food-outline', name: 'Public canteen', distance: '800m' },
    { icon: 'train-outline', name: 'Train station', distance: '500m' },
  ];

  // Dummy testimonials for now as backend might not return them yet
  const testimonials = [
    {
      id: '1',
      name: 'Sela Joze',
      rating: 5,
      date: '2 weeks ago',
      text: 'My wife and I had a great experiencing from our house landlord. The communication and access were seamless and spot on.',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: '2',
      name: 'Anita Cruz',
      rating: 5,
      date: '1 month ago',
      text: 'My wife & I have moved 6 times in the last 25 years. David is by far, the most professional, efficient and best...',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
  ];

  if (loading && !property) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const primaryImage = property?.images?.[0] || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header Image with Overlay */}
      <View style={styles.headerImageContainer}>
        <Image
          source={{ uri: primaryImage }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay}>
          <View style={[styles.headerButtons, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.rightButtons}>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="share-social-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleToggleFavorite}
              >
                <Icon
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? '#FF385C' : '#FFF'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 360 Button */}
          <View style={styles.watch360Container}>
            <TouchableOpacity style={styles.watch360Button}>
              <Icon name="camera" size={20} color="#6366F1" />
              <Text style={styles.watch360Text}>Watch 360°</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Property Title and Info */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.propertyTitle}>{property?.title || 'Property Title'}</Text>
              <TouchableOpacity>
                <Icon name="heart-outline" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="star" size={16} color="#FFB800" />
                <Text style={styles.statText}>{property?.rating || property?.averageRating || 'New'}</Text>
                <Text style={styles.statSubtext}>
                  {property?.reviewCount || property?.totalRatings ? `(${property?.reviewCount || property?.totalRatings} reviews)` : '(No reviews)'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="location-outline" size={16} color="#64748B" />
                <Text style={styles.statText}>{property?.city || 'Unknown'}, {property?.country || ''}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="bed-outline" size={16} color="#64748B" />
                <Text style={styles.statText}>{property?.bedrooms || 0} room</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="water-outline" size={16} color="#64748B" />
                <Text style={styles.statText}>{property?.bathrooms || 0} bath</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="resize-outline" size={16} color="#64748B" />
                <Text style={styles.statText}>{property?.area || property?.areaSqm || 0} m²</Text>
              </View>
            </View>
          </View>

          {/* Owner Info */}
          <View style={styles.ownerSection}>
            <Image
              source={{ uri: property?.owner?.avatar || 'https://i.pravatar.cc/150?img=12' }}
              style={styles.ownerAvatar}
            />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{property?.owner?.name || 'Property Owner'}</Text>
              <Text style={styles.ownerRole}>Landlord</Text>
            </View>
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.ownerActionButton}>
                <Icon name="chatbubble-outline" size={20} color="#0F6980" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.ownerActionButton}>
                <Icon name="call-outline" size={20} color="#0F6980" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Home Facilities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Home facilities</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all facilities</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.facilitiesGrid}>
              {(property?.amenities && Array.isArray(property.amenities) && property.amenities.length > 0
                ? property.amenities.map((amenity: any) => ({ name: amenity.name || amenity, icon: 'checkmark-circle-outline' }))
                : defaultFacilities).slice(0, 6).map((facility: any, index: number) => (
                  <View key={index} style={styles.facilityItem}>
                    <Icon name={facility.icon} size={20} color="#64748B" />
                    <Text style={styles.facilityText}>{facility.name}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Map */}
          <View style={styles.section}>
            <View style={styles.mapContainer}>
              <Image
                source={{ uri: `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${property?.longitude || 101.6869},${property?.latitude || 3.1390},14,0/600x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw` }}
                style={styles.mapImage}
              />
              <View style={styles.mapMarker}>
                <Icon name="location" size={24} color="#6366F1" />
              </View>
            </View>
          </View>

          {/* Nearest Public Facilities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearest public facilities</Text>
            <View style={styles.publicFacilitiesGrid}>
              {publicFacilities.map((facility, index) => (
                <View key={index} style={styles.publicFacilityItem}>
                  <View style={styles.publicFacilityIcon}>
                    <Icon name={facility.icon} size={20} color="#6366F1" />
                  </View>
                  <Text style={styles.publicFacilityName}>{facility.name}</Text>
                  <Text style={styles.publicFacilityDistance}>{facility.distance}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* About Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this property</Text>
            <Text style={styles.aboutText}>
              {property?.description || 'No description available for this property.'}
            </Text>
          </View>

          {/* Average Living Cost */}
          <View style={styles.section}>
            <View style={styles.costCard}>
              <Text style={styles.costLabel}>Estimated monthly cost</Text>
              <Text style={styles.costValue}>{formatPrice(property?.price || 0, currencyCode)}/month</Text>
            </View>
          </View>

          {/* Testimonials */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Testimonials</Text>
            {testimonials.map((testimonial) => (
              <View key={testimonial.id} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Image
                    source={{ uri: testimonial.avatar }}
                    style={styles.testimonialAvatar}
                  />
                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <View style={styles.testimonialRating}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Icon key={i} name="star" size={14} color="#FFB800" />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.testimonialDate}>{testimonial.date}</Text>
                </View>
                <Text style={styles.testimonialText} numberOfLines={3}>
                  {testimonial.text} <Text style={styles.readMore}>Read more</Text>
                </Text>
              </View>
            ))}
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16, paddingTop: 16 }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>{formatPrice(property?.price || 0, currencyCode)}</Text>
          <Text style={styles.priceUnit}> /month</Text>
        </View>
        <TouchableOpacity
          style={styles.rentButton}
          activeOpacity={0.8}
          onPress={() => {
            (navigation as any).navigate('RentBooking', { property });
          }}
        >
          <Text style={styles.rentButtonText}>Rent</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImageContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watch360Container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  watch360Button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  watch360Text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  titleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  propertyTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    lineHeight: 30,
    marginRight: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  statSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  ownerRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  ownerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  facilityText: {
    fontSize: 14,
    color: '#334155',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -12,
  },
  publicFacilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  publicFacilityItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
  },
  publicFacilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  publicFacilityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  publicFacilityDistance: {
    fontSize: 12,
    color: '#64748B',
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  readMore: {
    color: '#6366F1',
    fontWeight: '600',
  },
  costCard: {
    backgroundColor: '#EEF2FF',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  costValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  testimonialCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  testimonialInfo: {
    flex: 1,
    marginLeft: 12,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialDate: {
    fontSize: 12,
    color: '#64748B',
  },
  testimonialText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F6980',
  },
  priceUnit: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  rentButton: {
    backgroundColor: '#0F6980',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#0F6980',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PropertyDetailFullScreen;
