import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../context/ThemeContext';
import { useCurrency } from '../../../context/CurrencyContext';

interface PropertyCardProps {
  property: any;
  onPress: () => void;
  onToggleFavorite?: (id: string, e: any) => void;
  isFavorite?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onToggleFavorite,
  isFavorite = false
}) => {
  const { colors } = useTheme();
  const { formatPrice } = useCurrency();

  return (
    <TouchableOpacity
      style={[styles.propertyCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: property.image }} style={styles.propertyImage} />

      {onToggleFavorite && (
        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.7}
          onPress={(e) => onToggleFavorite(property.id, e)}
        >
          <Icon
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? "#FF385C" : "#FFFFFF"}
          />
        </TouchableOpacity>
      )}

      <View style={styles.propertyInfo}>
        <View style={styles.ratingRow}>
          <Icon name="star" size={16} color="#FFB800" />
          <Text style={[styles.ratingText, { color: colors.text }]}>{property.rating}</Text>
          <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({property.reviews})</Text>
        </View>
        <Text style={[styles.propertyTitle, { color: colors.text }]} numberOfLines={2}>
          {property.title}
        </Text>
        <Text style={[styles.locationSubtext, { color: colors.textSecondary }]}>{property.location}</Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="bed-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{property.rooms} room</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="resize-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{property.area} m²</Text>
          </View>
        </View>
        <Text style={[styles.priceText, { color: colors.text }]}>
          {formatPrice(property.price)}
          <Text style={[styles.priceUnit, { color: colors.textSecondary }]}> /month</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  propertyCard: {
    width: 280,
    marginRight: 16,
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
    fontSize: 16,
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
  priceText: {
    fontSize: 20,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
});

export default PropertyCard;
