import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useCurrency } from '../../context/CurrencyContext';

// Mock Data for Bookings
const bookings = [
  {
    id: '1',
    propertyTitle: 'Modern Beach House',
    location: 'Surabaya, Beach Road',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    checkIn: '12 Dec 2024',
    checkOut: '15 Dec 2024',
    status: 'upcoming',
    price: 750,
  },
  {
    id: '2',
    propertyTitle: 'Luxury Apartment',
    location: 'Central Surabaya',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    checkIn: '20 Nov 2024',
    checkOut: '25 Nov 2024',
    status: 'completed',
    price: 850,
  },
  {
    id: '3',
    propertyTitle: 'Cozy Mountain Cabin',
    location: 'Malang, Probolinggo',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400',
    checkIn: '10 Oct 2024',
    checkOut: '12 Oct 2024',
    status: 'cancelled',
    price: 526,
  },
];

const BookingHistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { formatPrice } = useCurrency();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]); // Re-run animation on tab change if desired, strictly speaking should be when screen loads or list changes

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#0F6980'; // Primary
      case 'completed': return '#4ADE80'; // Green
      case 'cancelled': return '#EF4444'; // Red
      default: return colors.textSecondary;
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const itemFade = new Animated.Value(0);
    const itemSlide = new Animated.Value(20);

    Animated.parallel([
      Animated.timing(itemFade, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(itemSlide, {
        toValue: 0,
        friction: 8,
        tension: 50,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();

    return (
      <Animated.View style={[styles.cardContainer, { opacity: itemFade, transform: [{ translateY: itemSlide }] }]}>
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: '#000' }]}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <View style={styles.headerRow}>
              <Text style={[styles.propertyTitle, { color: colors.text }]} numberOfLines={1}>{item.propertyTitle}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>{item.location}</Text>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Check-in</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{item.checkIn}</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Check-out</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{item.checkOut}</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={[styles.priceText, { color: colors.text }]}>{formatPrice(item.price)}</Text>
              <TouchableOpacity style={styles.detailButton} onPress={() => { }}>
                <Text style={[styles.detailButtonText, { color: colors.primary }]}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        {['upcoming', 'completed', 'cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: '#0F6980', borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab ? '#0F6980' : colors.textSecondary, fontWeight: activeTab === tab ? '700' : '500' }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No {activeTab} bookings found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  locationText: {
    fontSize: 13,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default BookingHistoryScreen;
