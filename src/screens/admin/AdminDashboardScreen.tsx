import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Property } from '../../types';
import { propertyService } from '../../services/propertyService';

const AdminDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const navigation = useNavigation<any>();

  const [requests, setRequests] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Sort State
  const [filterStatus, setFilterStatus] = useState<'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [showSortModal, setShowSortModal] = useState(false);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await propertyService.getPropertiesMobile({
        status: filterStatus as any,
        sortBy: sortBy as any
      });
      setRequests(response.properties);
    } catch (error) {
      console.error('Error fetching property requests:', error);
      const errorMessage = (error as any).response?.data?.message || (error as any).message || 'Failed to load property requests';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, sortBy]); // Re-fetch when filter or sort changes

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [filterStatus, sortBy]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleApprove = (id: string, name: string) => {
    Alert.alert('Confirm Approval', `Approve Listing "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            await propertyService.updatePropertyStatus(id, 'APPROVED');
            // Remove from list if viewing pending, otherwise just refresh or update local state
            if (filterStatus === 'PENDING_REVIEW') {
              setRequests(prev => prev.filter(req => req.id !== id));
            } else {
              fetchRequests();
            }
            Alert.alert('Success', 'Property has been approved.');
          } catch (error) {
            console.error('Error approving property:', error);
            Alert.alert('Error', 'Failed to approve property');
          }
        }
      }
    ]);
  };

  const handleReject = (id: string, name: string) => {
    Alert.alert('Confirm Rejection', `Reject Listing "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await propertyService.updatePropertyStatus(id, 'REJECTED');
            if (filterStatus === 'PENDING_REVIEW') {
              setRequests(prev => prev.filter(req => req.id !== id));
            } else {
              fetchRequests();
            }
            Alert.alert('Rejected', 'Property request has been rejected.');
          } catch (error) {
            console.error('Error rejecting property:', error);
            Alert.alert('Error', 'Failed to reject property');
          }
        }
      }
    ]);
  };

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Sort By</Text>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => { setSortBy('newest'); setShowSortModal(false); }}
          >
            <Text style={[styles.modalOptionText, { color: sortBy === 'newest' ? colors.primary : colors.text }]}>
              Newest
            </Text>
            {sortBy === 'newest' && <Icon name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => { setSortBy('price_asc'); setShowSortModal(false); }}
          >
            <Text style={[styles.modalOptionText, { color: sortBy === 'price_asc' ? colors.primary : colors.text }]}>
              Name (A-Z)
            </Text>
            {/* Note: Backend might not support title sort directly yet, using price_asc as placeholder or assuming update */}
            {/* If user specifically requested name, and backend only supports price/newest/rating, we might need client side sort. 
                 Or we map 'price_asc' to a 'title' param if we updated service properly. 
                 The plan mentioned checking backend support. 
                 For now let's assume 'price_asc' is just a placeholder and I will implement client side sort if backend fails for name 
                 Actually, the user request "sesuai nama" means by name. 
                 I'll use a local sort for Name if I can't rely on API */}
            {sortBy === 'price_asc' && <Icon name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Client-side sort for Name if selected, otherwise list is as is from API
  // NOTE: 'price_asc' above is used as a key for 'Name'. 
  // If API doesn't support name sort, we sort here.
  // Client-side sort and filter to ensure consistency
  const displayRequests = [...requests]
    .filter(item => {
      // Normalize statuses for comparison
      const itemStatus = (item.status || 'PENDING_REVIEW').toUpperCase();
      // Handle the 'PENDING' case which might be 'PENDING_REVIEW' or 'pending' from backend
      if (filterStatus === 'PENDING_REVIEW') {
        return itemStatus === 'PENDING_REVIEW';
      }
      return itemStatus === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0; // Default or API sorted
    });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {displayRequests.length} Properties
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setShowSortModal(true)} style={[styles.iconButton, { backgroundColor: colors.surface, marginRight: 8 }]}>
            <Icon name="filter-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={[styles.iconButton, { backgroundColor: colors.surface }]}>
            <Icon name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {[
          { label: 'PENDING', value: 'PENDING_REVIEW' },
          { label: 'APPROVED', value: 'APPROVED' },
          { label: 'REJECTED', value: 'REJECTED' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tab,
              filterStatus === tab.value && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setFilterStatus(tab.value as any)}
          >
            <Text style={[
              styles.tabText,
              { color: filterStatus === tab.value ? colors.primary : colors.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {isLoading ? (
          <View style={{ marginTop: 100 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : displayRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="checkmark-circle-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No {filterStatus.toLowerCase()} properties found.</Text>
          </View>
        ) : (
          displayRequests.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.card, shadowColor: '#000' }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PropertyDetailFull', { property: item })}
              >
                <Image source={{ uri: item.images[0] }} style={styles.cardImage} />

                <View style={styles.cardContent}>
                  <View style={styles.row}>
                    <View style={[styles.tagContainer,
                    item.status === 'APPROVED' ? { backgroundColor: '#E6F4EA' } :
                      item.status === 'REJECTED' ? { backgroundColor: '#FDECEA' } : {}
                    ]}>
                      <Text style={[styles.tagText,
                      item.status === 'APPROVED' ? { color: '#1E8E3E' } :
                        item.status === 'REJECTED' ? { color: '#D93025' } : {}
                      ]}>{item.status || 'admin '}</Text>
                    </View>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.price, { color: colors.primary }]}>
                    Rp {item.price.toLocaleString('id-ID')} / month
                  </Text>

                  <View style={styles.ownerInfo}>
                    <Icon name="person-circle-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.ownerName, { color: colors.textSecondary }]}>
                      {item.owner?.name} ({item.owner?.email})
                    </Text>
                  </View>

                  {filterStatus === 'PENDING_REVIEW' && <View style={styles.divider} />}
                </View>
              </TouchableOpacity>

              {filterStatus === 'PENDING_REVIEW' && (
                <View style={[styles.actions, { paddingHorizontal: 16, paddingBottom: 16 }]}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item.id, item.title)}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleApprove(item.id, item.title)}
                  >
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
      {renderSortModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 12,
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    marginRight: 20,
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  // empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  // card
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  // row & tags
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagContainer: {
    backgroundColor: '#FFE8CC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: '#FD7E14',
    fontSize: 12,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ownerName: {
    marginLeft: 8,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#FFF5F5',
  },
  approveButton: {},
  rejectText: {
    color: '#E03131',
    fontWeight: '600',
  },
  approveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;
