import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Property } from '../../types';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';
import { propertyService } from '../../services/propertyService';
import { Colors } from '../../constants';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type PropertyDetailScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'PropertyDetail'
>;
type PropertyDetailScreenRouteProp = RouteProp<HomeStackParamList, 'PropertyDetail'>;

interface Props {
  navigation: PropertyDetailScreenNavigationProp;
  route: PropertyDetailScreenRouteProp;
}

const { width } = Dimensions.get('window');

const PropertyDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { propertyId } = route.params;
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadPropertyDetails();
  }, [propertyId]);

  const loadPropertyDetails = async () => {
    try {
      const propertyData = await propertyService.getPropertyById(propertyId);
      setProperty(propertyData);
      setIsFavorite(propertyData.isFavorited || false);
    } catch (error) {
      console.error('Error loading property details:', error);
      Alert.alert('Error', 'Failed to load property details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };


  const handleFavoriteToggle = async () => {
    try {
      await propertyService.toggleFavorite(propertyId);
      setIsFavorite(!isFavorite);
      // Reload property to get updated favorite count
      const updatedProperty = await propertyService.getPropertyById(propertyId);
      setProperty(updatedProperty);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  if (isLoading || !property) {
    return <Loading message="Loading property details..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {property.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {currentImageIndex + 1} / {property.images.length}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? Colors.primary : Colors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title and Rating */}
          <View style={styles.header}>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={20} color={Colors.star} />
              <Text style={styles.rating}>{property.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({property.reviewCount} reviews)</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={20} color={Colors.primary} />
            <Text style={styles.location}>{property.location}</Text>
          </View>
          <Text style={styles.address}>{property.address}</Text>

          {/* Property Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Icon name="bed" size={24} color={Colors.primary} />
              <Text style={styles.detailLabel}>Bedrooms</Text>
              <Text style={styles.detailValue}>{property.bedrooms}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="shower" size={24} color={Colors.primary} />
              <Text style={styles.detailLabel}>Bathrooms</Text>
              <Text style={styles.detailValue}>{property.bathrooms}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="ruler-square" size={24} color={Colors.primary} />
              <Text style={styles.detailLabel}>Area</Text>
              <Text style={styles.detailValue}>{property.area} m²</Text>
            </View>
          </View>

          {/* Property Statistics */}
          {(property.viewCount !== undefined || property.favoriteCount !== undefined || property.furnished !== undefined) && (
            <View style={styles.statsContainer}>
              {property.viewCount !== undefined && (
                <View style={styles.statItem}>
                  <Icon name="eye" size={18} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{property.viewCount} views</Text>
                </View>
              )}
              {property.favoriteCount !== undefined && (
                <View style={styles.statItem}>
                  <Icon name="heart" size={18} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{property.favoriteCount} favorites</Text>
                </View>
              )}
              {property.furnished !== undefined && (
                <View style={styles.statItem}>
                  <Icon name={property.furnished ? "sofa" : "sofa-outline"} size={18} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{property.furnished ? 'Furnished' : 'Unfurnished'}</Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {property.amenities.map((amenity) => (
                <View key={amenity.id} style={styles.amenityItem}>
                  <Icon name={amenity.icon} size={20} color={Colors.primary} />
                  <Text style={styles.amenityText}>{amenity.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>Price per night</Text>
              <Text style={styles.price}>
                Rp {property.price.toLocaleString('id-ID')}
              </Text>
            </View>
            <Button
              title="Book Now"
              onPress={() => Alert.alert('Booking', 'Booking feature coming soon!')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    width,
    height: 300,
    position: 'relative',
  },
  image: {
    width,
    height: 300,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageIndicatorText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 24,
    padding: 8,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 24,
    marginBottom: 24,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 16,
    paddingBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default PropertyDetailScreen;
