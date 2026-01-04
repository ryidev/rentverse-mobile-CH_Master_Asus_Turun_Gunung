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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCurrency } from '../../context/CurrencyContext';
import { apiService } from '../../services/api';
import { propertyService } from '../../services/propertyService';

const { width } = Dimensions.get('window');

const PropertyDetailLandlord: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { property } = route.params as any;
  const { formatPrice } = useCurrency();
  const insets = useSafeAreaInsets();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
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

  const handleEdit = () => {
    (navigation as any).navigate('EditProperty', { property });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.deleteProperty(property.id);
              Alert.alert('Success', 'Property deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              console.error('Error deleting property:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  const facilities = [
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

  const testimonials = [
    {
      id: '1',
      name: 'Sela Joze',
      rating: 5,
      date: '2 weeks ago',
      text: 'My wife and I had a great experiencing from our house landlord. The communication and access were seamless and spot on Proteine David and his wife took.',
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header Image with Overlay */}
      <View style={styles.headerImageContainer}>
        <Image
          source={{ uri: property?.image || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400' }}
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
              <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
                <Icon name="pencil-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleDelete}
              >
                <Icon
                  name="trash-outline"
                  size={24}
                  color="#FF385C"
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
                <Text style={styles.statText}>{property?.rating || 'New'}</Text>
                <Text style={styles.statSubtext}>
                  {property?.reviews ? `(${property.reviews} reviews)` : '(No reviews)'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="location-outline" size={16} color="#64748B" />
                <Text style={styles.statText}>{property?.location || property?.city || 'Unknown Location'}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="bed-outline" size={16} color="#64748B" />
                <Text style={styles.statText}>{property?.rooms || property?.bedrooms || 0} room</Text>
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
              source={{ uri: property?.user?.avatar || 'https://i.pravatar.cc/150?img=12' }}
              style={styles.ownerAvatar}
            />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{property?.user?.name || 'Property Owner'}</Text>
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
                ? property.amenities
                : facilities).slice(0, 4).map((facility: any, index: number) => (
                  <View key={index} style={styles.facilityItem}>
                    <Icon name={facility.icon || 'checkmark-circle-outline'} size={20} color="#64748B" />
                    <Text style={styles.facilityText}>{facility.name || facility}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Map */}
          <View style={styles.section}>
            <View style={styles.mapContainer}>
              <Image
                source={{ uri: `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${property?.longitude || 112.7521},${property?.latitude || 7.8753},12,0/600x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw` }}
                style={styles.mapImage}
              />
              <View style={styles.mapMarker}>
                <Icon name="location" size={24} color="#6366F1" />
              </View>
            </View >
          </View >

          {/* Nearest Public Facilities */}
          < View style={styles.section} >
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
          </View >

          {/* About Location */}
          < View style={styles.section} >
            <Text style={styles.sectionTitle}>About this property</Text>
            <Text style={styles.aboutText}>
              {property?.description || 'No description available for this property.'}
            </Text>
          </View >

          {/* Average Living Cost */}
          < View style={styles.section} >
            <View style={styles.costCard}>
              <Text style={styles.costLabel}>Average living cost</Text>
              <Text style={styles.costValue}>{formatPrice(property?.price || 0)}/month</Text>
            </View>
          </View >

          {/* Testimonials */}
          < View style={styles.section} >
            <Text style={styles.sectionTitle}>Testimonials</Text>
            {
              testimonials.map((testimonial) => (
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
              ))
            }
          </View >

          {/* Bottom Spacing */}
          < View style={{ height: 100 }} />
        </Animated.View >
      </ScrollView >

      {/* Bottom Bar */}
      < View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16, paddingTop: 16 }]} >
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>{formatPrice(property?.price || 0)}</Text>
          <Text style={styles.priceUnit}> /month</Text>
        </View>
        <TouchableOpacity
          style={styles.rentButton}
          activeOpacity={0.8}
          onPress={() => {
            console.log('Rent button pressed', property);
            (navigation as any).navigate('RentBooking', { property });
          }}
        >
          <Text style={styles.rentButtonText}>Rent</Text>
        </TouchableOpacity>
      </View >
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center', // Added alignment
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
  },
  watch360Text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    lineHeight: 28,
    marginRight: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  statSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  ownerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 12,
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
    gap: 8,
  },
  ownerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
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
    fontWeight: '600',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  facilityText: {
    fontSize: 14,
    color: '#1E293B',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
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
    marginTop: 16,
  },
  publicFacilityItem: {
    width: '48%',
    backgroundColor: '#F8FAF7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  publicFacilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  publicFacilityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  publicFacilityDistance: {
    fontSize: 12,
    color: '#64748B',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    marginBottom: 12,
  },
  readMore: {
    color: '#6366F1',
    fontWeight: '500',
  },
  costCard: {
    backgroundColor: '#F0F0FF',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  costValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  testimonialCard: {
    backgroundColor: '#F8FAF7',
    padding: 16,
    borderRadius: 12,
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
  },
  testimonialInfo: {
    flex: 1,
    marginLeft: 12,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
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
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  priceUnit: {
    fontSize: 14,
    color: '#64748B',
  },
  rentButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PropertyDetailLandlord;
