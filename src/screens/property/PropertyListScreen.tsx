import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';
import { propertyService } from '../../services/propertyService';
import { mapPropertiesToCards } from '../../utils/propertyMapper';

const { width } = Dimensions.get('window');

type PropertyListScreenParams = {
  title: string;
  filters?: {
    city?: string;
    state?: string;
    country?: string;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyTypeId?: string;
    search?: string;
  };
  isFavorites?: boolean;
};

const PropertyListScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: PropertyListScreenParams }, 'params'>>();
  const { title, filters = {}, isFavorites = false } = route.params || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Sort options
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest' | 'rating'>(
    (filters.sortBy as 'price_asc' | 'price_desc' | 'newest' | 'rating') || 'newest'
  );
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Highest Rating', value: 'rating' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
  ];

  useEffect(() => {
    loadProperties();
  }, [sortBy]);

  const loadProperties = async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let response;

      if (isFavorites) {
        // Load favorites
        response = await propertyService.getUserFavorites({
          page: pageNum,
          limit: 20,
        });
      } else {
        // Load regular properties with filters
        response = await propertyService.getPropertiesWithFilters({
          ...filters,
          sortBy,
          page: pageNum,
          limit: 20,
        });
      }

      const mappedProperties = mapPropertiesToCards(response.properties || []);

      if (append) {
        setProperties(prev => [...prev, ...mappedProperties]);
      } else {
        setProperties(mappedProperties);
      }

      setTotalCount(response.total || 0);
      setHasMore(mappedProperties.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadProperties(1, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadProperties(page + 1, true);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'price_asc' | 'price_desc' | 'newest' | 'rating');
    setShowSortMenu(false);
    setPage(1);
    setHasMore(true);
  };

  const toggleFavorite = async (id: string, e: any) => {
    e.stopPropagation();
    try {
      await propertyService.toggleFavorite(id);

      // Update local state
      setProperties(prev =>
        prev.map(p => {
          if (p.id === id) {
            return { ...p, isFavorited: !p.isFavorited };
          }
          return p;
        })
      );

      // If in favorites view, remove the property
      if (isFavorites) {
        setProperties(prev => prev.filter(p => p.id !== id));
        setTotalCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const formatCurrency = (price: number, currencyCode?: string): string => {
    const currency = currencyCode || 'IDR';
    if (currency === 'IDR') {
      return `Rp ${price.toLocaleString('id-ID')}`;
    } else if (currency === 'MYR') {
      return `RM ${price.toLocaleString('ms-MY')}`;
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {totalCount} {totalCount === 1 ? 'property' : 'properties'}
          </Text>
        </View>
      </View>

      {/* Sort Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: colors.surface }]}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Icon name="funnel-outline" size={18} color={colors.text} />
          <Text style={[styles.sortButtonText, { color: colors.text }]}>
            {sortOptions.find(opt => opt.value === sortBy)?.label}
          </Text>
          <Icon name="chevron-down" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={[styles.sortMenu, { backgroundColor: colors.card }]}>
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && { backgroundColor: colors.surface },
              ]}
              onPress={() => handleSortChange(option.value)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  { color: sortBy === option.value ? colors.primary : colors.text },
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.value && (
                <Icon name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderProperty = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.propertyCard, { backgroundColor: colors.card }]}
      onPress={() => (navigation as any).navigate('PropertyDetailFull', { property: item })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.image || item.images?.[0] || 'https://via.placeholder.com/400' }}
        style={styles.propertyImage}
      />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={(e) => toggleFavorite(item.id, e)}
      >
        <Icon
          name={item.isFavorited ? 'heart' : 'heart-outline'}
          size={20}
          color={item.isFavorited ? '#FF385C' : '#FFF'}
        />
      </TouchableOpacity>

      <View style={styles.propertyInfo}>
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} color="#FFB800" />
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {item.rating || item.averageRating || '0.0'}
          </Text>
          <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>
            ({item.reviewCount || item.totalRatings || 0})
          </Text>
        </View>

        <Text style={[styles.propertyTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <Icon name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.city || ''}{item.city && item.state ? ', ' : ''}{item.state || ''}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="bed-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.rooms || item.bedrooms || 0} room
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="resize-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.area || item.areaSqm || 0} m²
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {formatCurrency(item.price || 0, item.currencyCode)}
          </Text>
          <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>/month</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="home-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          No properties found
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
          Try adjusting your filters or search criteria
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortMenu: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  propertyCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    padding: 16,
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
    fontSize: 13,
    marginLeft: 4,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    marginLeft: 4,
    flex: 1,
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
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: 13,
    marginLeft: 4,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PropertyListScreen;
