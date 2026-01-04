import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCurrency } from '../../context/CurrencyContext';
import { bookingService } from '../../services/bookingService';
import { CreateBookingData } from '../../types';

const RentBookingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { property } = route.params as any;
  const { formatPrice } = useCurrency();
  const insets = useSafeAreaInsets();

  const [selectedPayment, setSelectedPayment] = useState<string>('debit');
  const [showPolicies, setShowPolicies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);

  // Booking details
  const [bookingDetails] = useState({
    date: '11 Nov - 5 Dec',
    guests: 3,
    duration: 24, // days
    pricePerDay: property?.rented || 2500,
    serviceFee: 200,
  });

  const totalStayingPrice = bookingDetails.duration * bookingDetails.pricePerDay;
  const totalPrice = totalStayingPrice + bookingDetails.serviceFee;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const paymentMethods = [
    {
      id: 'debit',
      name: 'Debit card',
      subtitle: 'Accepting Visa, Mastercard, etc',
      icon: 'card-outline',
    },
    {
      id: 'google',
      name: 'Google Pay',
      subtitle: '',
      icon: 'logo-google',
    },
    {
      id: 'apple',
      name: 'Apple Pay',
      subtitle: '',
      icon: 'logo-apple',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      subtitle: '',
      icon: 'logo-paypal',
    },
  ];

  const handlePlaceBooking = async () => {
    setIsLoading(true);
    try {
      // Calculate dates based on current date + duration (simulating selection)
      const checkInDate = new Date();
      const checkOutDate = new Date();
      checkOutDate.setDate(checkInDate.getDate() + bookingDetails.duration);

      const bookingData: CreateBookingData = {
        propertyId: property.id,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests: bookingDetails.guests,
      };

      await bookingService.createBooking(bookingData);

      Alert.alert(
        'Success',
        'Booking placed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to Home or potentially to a Bookings tab
              navigation.navigate('Main' as never);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.message || 'Failed to place booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rent booking</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Icon name="information-circle-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Property Card */}
          <View style={styles.propertyCard}>
            <Image
              source={{ uri: property?.image || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400' }}
              style={styles.propertyImage}
            />
            <View style={styles.propertyInfo}>
              <View style={styles.ratingRow}>
                <Icon name="star" size={14} color="#FFB800" />
                <Text style={styles.ratingText}>4.8 (73)</Text>
              </View>
              <Text style={styles.propertyTitle} numberOfLines={2}>
                {property?.title || 'Entire Bromo mountain view Cabin in Suraya'}
              </Text>
              <Text style={styles.propertyLocation}>
                {property?.location || 'Malang, Probolinggo'}
              </Text>
              <Text style={styles.propertyPrice}>
                {formatPrice(bookingDetails.pricePerDay)}
                <Text style={styles.priceUnit}> /month</Text>
              </Text>
            </View>
          </View>

          {/* Your Input Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your input details</Text>
              <TouchableOpacity>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputDetailRow}>
              <Text style={styles.inputLabel}>Date</Text>
              <Text style={styles.inputValue}>{bookingDetails.date}</Text>
            </View>

            <View style={styles.inputDetailRow}>
              <Text style={styles.inputLabel}>Guests count</Text>
              <Text style={styles.inputValue}>{bookingDetails.guests} guests</Text>
            </View>
          </View>

          {/* Price Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Price details</Text>
              <TouchableOpacity>
                <Text style={styles.moreInfoText}>More info</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Staying duration ({bookingDetails.duration} days)
              </Text>
              <Text style={styles.priceValue}>{formatPrice(totalStayingPrice)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>{formatPrice(bookingDetails.serviceFee)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total price</Text>
              <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
            </View>
          </View>

          {/* Pay With */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pay with</Text>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.paymentMethod}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentLeft}>
                  <View style={styles.paymentIconContainer}>
                    <Icon name={method.icon} size={24} color="#6366F1" />
                  </View>
                  <View>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    {method.subtitle && (
                      <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
                    )}
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPayment === method.id && styles.radioButtonSelected
                ]}>
                  {selectedPayment === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {showPolicies && (
            <View style={styles.policiesContent}>
              <Text style={styles.policyText}>
                • Cancellation policy: Free cancellation within 48 hours of booking
              </Text>
              <Text style={styles.policyText}>
                • Check-in time: After 2:00 PM
              </Text>
              <Text style={styles.policyText}>
                • Check-out time: Before 11:00 AM
              </Text>
              <Text style={styles.policyText}>
                • House rules: No smoking, No pets, No parties
              </Text>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.bookingButton, isLoading && { opacity: 0.7 }]}
          onPress={handlePlaceBooking}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookingButtonText}>Place booking request</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: 100,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#64748B',
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
    marginTop: 4,
  },
  propertyLocation: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  editText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  moreInfoText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  inputDetailRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 14,
    color: '#64748B',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#6366F1',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
  },
  policiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  policiesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  policiesText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  policiesContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    paddingTop: 0,
  },
  policyText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bookingButton: {
    backgroundColor: '#6366F1',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RentBookingScreen;
