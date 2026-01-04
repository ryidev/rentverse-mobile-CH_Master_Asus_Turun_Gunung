import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  PermissionsAndroid,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { storageService } from '../utils/storage';
import { locationService } from '../services/locationService';
import MapTilerView from './MapTilerView';
import ENV from '../config/env';

const { height } = Dimensions.get('window');

interface CreatePropertyFormProps {
  onBack?: () => void;
  onSuccess?: () => void;
  showHeader?: boolean;
  initialData?: any;
  mode?: 'create' | 'edit';
}

interface PropertyType {
  id: string;
  name: string;
}

interface Amenity {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

const CURRENCIES = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
];

const COUNTRIES = [
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
];

const CreatePropertyForm: React.FC<CreatePropertyFormProps> = ({
  onBack,
  onSuccess,
  showHeader = true,
  initialData,
  mode = 'create',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets(); // Get safe area insets

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'MY',
    zipCode: initialData?.zipCode || '',
    latitude: initialData?.latitude || 3.1390,
    longitude: initialData?.longitude || 101.6869,
    placeId: initialData?.placeId || '',
    price: initialData?.price?.toString() || '',
    currencyCode: initialData?.currencyCode || 'MYR',
    propertyTypeId: initialData?.propertyTypeId || '',
    bedrooms: initialData?.bedrooms?.toString() || '',
    bathrooms: initialData?.bathrooms?.toString() || '',
    areaSqm: initialData?.areaSqm?.toString() || '',
    furnished: initialData?.furnished || false,
  });

  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenityIds || initialData?.amenities?.map((a: any) => a.id) || []);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>(initialData?.images || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPropertyTypeModal, setShowPropertyTypeModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchPropertyTypes();
    fetchAmenities();
    if (mode === 'create') {
      requestLocationPermission();
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } else {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn('Location permission error:', err);
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to set property coordinates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required to get your current location.');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Location obtained:', { latitude, longitude });
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
          }));
          Alert.alert('Success', `Location set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        (error) => {
          console.error('Geolocation error:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT,
          });

          let errorMessage = 'Failed to get location: ';
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = 'Location permission denied. Please enable location in settings.';
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = 'Location unavailable. Please make sure GPS is enabled and you are not indoors.';
              break;
            case 3: // TIMEOUT
              errorMessage = 'Location request timed out. GPS signal may be weak. You can enter coordinates manually or use the map.';
              break;
            default:
              errorMessage += error.message;
          }

          Alert.alert(
            'Location Error',
            errorMessage + '\n\nYou can:\n• Enter coordinates manually\n• Drag the map marker\n• Try again in an open area',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        },
        {
          enableHighAccuracy: false, // Use network location if GPS unavailable
          timeout: 30000, // 30 seconds
          maximumAge: 10000,
        },
      );
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to request location permission.');
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const response = await apiService.get('/property-types') as any;
      console.log('Property types response:', response);
      setPropertyTypes(response.data || []);
      // Set first property type as default
      if (response.data && response.data.length > 0) {
        setFormData(prev => ({ ...prev, propertyTypeId: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching property types:', error);
      Alert.alert('Error', 'Failed to load property types. Please check your connection.');
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await apiService.get('/amenities') as any;
      setAmenities(response.data || []);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMapLocationSelect = async (latitude: number, longitude: number) => {
    setFormData(prev => ({
      ...prev,
      latitude,
      longitude,
    }));

    // Get location details from coordinates
    try {
      const locationData = await locationService.getLocationFromCoords(latitude, longitude);
      setFormData(prev => ({
        ...prev,
        latitude,
        longitude,
        address: locationData.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: locationData.city || prev.city,
        state: locationData.state || prev.state,
        country: locationData.countryCode || prev.country,
      }));
    } catch (error) {
      console.error('Failed to get location details:', error);
      setFormData(prev => ({
        ...prev,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      }));
    }
  };

  const handleLatitudeChange = (value: string) => {
    // Allow partial input like "-", "3.", "3.1"
    if (value === '' || value === '-' || value === '.') {
      setFormData(prev => ({ ...prev, latitude: 0 }));
      return;
    }

    const lat = parseFloat(value);
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      setFormData(prev => ({ ...prev, latitude: lat }));
    }
  };

  const handleLongitudeChange = (value: string) => {
    // Allow partial input like "-", "3.", "3.1"
    if (value === '' || value === '-' || value === '.') {
      setFormData(prev => ({ ...prev, longitude: 0 }));
      return;
    }

    const lng = parseFloat(value);
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      setFormData(prev => ({ ...prev, longitude: lng }));
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenityId)) {
        return prev.filter(id => id !== amenityId);
      }
      return [...prev, amenityId];
    });
  };

  const uploadImageToCloudinary = async (uri: string): Promise<string> => {
    try {
      // Dynamic import for react-native-blob-util
      const ReactNativeBlobUtil = require('react-native-blob-util').default;

      console.log('File URI:', uri);
      console.log('Uploading directly to Cloudinary...');

      // Cloudinary configuration
      const CLOUDINARY_CLOUD_NAME = 'debmlrrkg';
      const CLOUDINARY_UPLOAD_PRESET = 'rentverse_unsigned'; // You'll need to create this
      const CLOUDINARY_FOLDER = 'rentverse';

      const filename = `property-${Date.now()}.jpg`;
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      console.log('Cloudinary URL:', cloudinaryUrl);
      console.log('Upload preset:', CLOUDINARY_UPLOAD_PRESET);

      // Upload directly to Cloudinary
      const response = await ReactNativeBlobUtil.fetch(
        'POST',
        cloudinaryUrl,
        {
          'Content-Type': 'multipart/form-data',
        },
        [
          {
            name: 'file',
            filename: filename,
            type: 'image/jpeg',
            data: ReactNativeBlobUtil.wrap(uri),
          },
          {
            name: 'upload_preset',
            data: CLOUDINARY_UPLOAD_PRESET,
          },
          {
            name: 'folder',
            data: CLOUDINARY_FOLDER,
          },
        ]
      );

      console.log('Cloudinary response status:', response.info().status);
      const responseData = response.json();
      console.log('Cloudinary response:', responseData);

      if (response.info().status === 200 && responseData.secure_url) {
        console.log('Upload successful! URL:', responseData.secure_url);
        return responseData.secure_url;
      } else {
        throw new Error('Cloudinary upload failed: ' + JSON.stringify(responseData));
      }
    } catch (error: any) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response,
        status: error.status,
      });

      let errorMsg = 'Failed to upload image to Cloudinary';

      if (error.message) {
        errorMsg = error.message;
      }

      throw new Error(errorMsg);
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5, // Reduce quality to 50%
        selectionLimit: 1,
        maxWidth: 1024, // Reduce max width to 1024px
        maxHeight: 1024, // Reduce max height to 1024px
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', `Failed to pick image: ${result.errorMessage}`);
        return;
      }

      if (result.assets && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setImages(prev => [...prev, uri]);

        setIsUploadingImages(true);
        try {
          const url = await uploadImageToCloudinary(uri);
          setUploadedImageUrls(prev => [...prev, url]);
          Alert.alert('Success', 'Image uploaded successfully!');
        } catch (error: any) {
          Alert.alert('Upload Failed', error.message || 'Failed to upload image. Please try again.');
          setImages(prev => prev.filter(img => img !== uri));
        } finally {
          setIsUploadingImages(false);
        }
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!formData.title) {
      Alert.alert('Validation Error', 'Please enter property title');
      return false;
    }
    if (!formData.address) {
      Alert.alert('Validation Error', 'Please select location on map');
      return false;
    }
    if (!formData.city) {
      Alert.alert('Validation Error', 'Please enter city');
      return false;
    }
    if (!formData.state) {
      Alert.alert('Validation Error', 'Please enter state');
      return false;
    }
    if (!formData.zipCode) {
      Alert.alert('Validation Error', 'Please enter zip code');
      return false;
    }
    if (!formData.price) {
      Alert.alert('Validation Error', 'Please enter price');
      return false;
    }
    if (!formData.propertyTypeId) {
      Alert.alert('Validation Error', 'Please select property type');
      return false;
    }
    if (!formData.bedrooms) {
      Alert.alert('Validation Error', 'Please enter number of bedrooms');
      return false;
    }
    if (!formData.bathrooms) {
      Alert.alert('Validation Error', 'Please enter number of bathrooms');
      return false;
    }
    if (!formData.areaSqm) {
      Alert.alert('Validation Error', 'Please enter area');
      return false;
    }
    if (!formData.description) {
      Alert.alert('Validation Error', 'Please enter description');
      return false;
    }
    if (uploadedImageUrls.length === 0) {
      Alert.alert('Validation Error', 'Please upload at least one image');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        placeId: formData.placeId || undefined,
        price: parseFloat(formData.price),
        currencyCode: formData.currencyCode,
        propertyTypeId: formData.propertyTypeId,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        areaSqm: parseFloat(formData.areaSqm),
        furnished: formData.furnished,
        isAvailable: true,
        status: 'PENDING_REVIEW',
        images: uploadedImageUrls,
        amenityIds: selectedAmenities,
      };

      if (mode === 'edit' && initialData?.id) {
        await apiService.put(`/properties/${initialData.id}`, propertyData);
        Alert.alert('Success', 'Property updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        ]);
      } else {
        await apiService.post('/properties', propertyData);
        Alert.alert('Success', 'Property created successfully', [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('Error saving property:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save property'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#FFF' }}>
      {showHeader && (
        <View style={[styles.header, { paddingTop: insets.top + 10, paddingBottom: 10, backgroundColor: isDark ? '#000' : '#FFF' }]}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={[styles.backButton]}
            >
              <Icon name="arrow-back" size={24} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={[styles.headerTitle, isDark && styles.textDark]}>
              {mode === 'edit' ? 'Edit Your Property' : 'List Your Property'}
            </Text>
            <Text style={[styles.headerSubtitle, isDark && styles.textSecondaryDark]}>
              {mode === 'edit' ? 'Update your property details.' : 'Fill in the details to list your property for rent or sale.'}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.content}>
          {/* Property Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>Property Title *</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="e.g. Luxury Penthouse in KLCC"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
            />
          </View>

          {/* Property Type */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>Property Type *</Text>
            <TouchableOpacity
              style={[styles.input, styles.inputWithIcon, isDark && styles.inputDark]}
              onPress={() => setShowPropertyTypeModal(true)}
            >
              <Icon name="home-outline" size={20} color={isDark ? '#666' : '#999'} style={styles.inputIcon} />
              <Text style={[styles.inputText, isDark && styles.textDark, !formData.propertyTypeId && styles.placeholderText]}>
                {propertyTypes.find(pt => pt.id === formData.propertyTypeId)?.name || 'Select property type'}
              </Text>
              <Icon name="chevron-down" size={20} color={isDark ? '#666' : '#999'} />
            </TouchableOpacity>
          </View>

          {/* Address with Embedded Map */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>Location *</Text>
            <Text style={[styles.helperText, isDark && styles.textSecondaryDark]}>
              Drag the marker or enter coordinates below
            </Text>

            {/* Embedded Map */}
            <View style={styles.mapContainer}>
              <MapTilerView
                latitude={formData.latitude || 3.1390}
                longitude={formData.longitude || 101.6869}
                onLocationSelect={handleMapLocationSelect}
                showLocationPicker
                height={250}
              />
            </View>

            {/* Latitude and Longitude Inputs */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, isDark && styles.textDark]}>Latitude *</Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="e.g. 3.1390"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={formData.latitude ? formData.latitude.toString() : ''}
                  onChangeText={handleLatitudeChange}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, isDark && styles.textDark]}>Longitude *</Text>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="e.g. 101.6869"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={formData.longitude ? formData.longitude.toString() : ''}
                  onChangeText={handleLongitudeChange}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Address Text Input */}
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter address manually (optional)"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
            />
          </View>

          {/* City, State, Zip */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isDark && styles.textDark]}>City *</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="e.g. Kuala Lumpur"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isDark && styles.textDark]}>State *</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="e.g. Kuala Lumpur"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.state}
                onChangeText={(value) => handleInputChange('state', value)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isDark && styles.textDark]}>Country *</Text>
              <TouchableOpacity
                style={[styles.input, styles.inputWithIcon, isDark && styles.inputDark]}
                onPress={() => setShowCountryModal(true)}
              >
                <Text style={[styles.countryFlag]}>
                  {COUNTRIES.find(c => c.code === formData.country)?.flag || '🇲🇾'}
                </Text>
                <Text style={[styles.inputText, isDark && styles.textDark]}>
                  {COUNTRIES.find(c => c.code === formData.country)?.name || 'Malaysia'}
                </Text>
                <Icon name="chevron-down" size={20} color={isDark ? '#666' : '#999'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isDark && styles.textDark]}>Zip Code *</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="e.g. 50450"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.zipCode}
                onChangeText={(value) => handleInputChange('zipCode', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Currency and Price - moved after country/zip */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isDark && styles.textDark]}>Currency *</Text>
              <TouchableOpacity
                style={[styles.input, styles.inputWithIcon, isDark && styles.inputDark]}
                onPress={() => setShowCurrencyModal(true)}
              >
                <Text style={[styles.inputText, isDark && styles.textDark]}>
                  {CURRENCIES.find(c => c.code === formData.currencyCode)?.code || 'MYR'}
                </Text>
                <Icon name="chevron-down" size={20} color={isDark ? '#666' : '#999'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, isDark && styles.textDark]}>
                Price ({CURRENCIES.find(c => c.code === formData.currencyCode)?.symbol}) *
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="e.g. 8500"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Bedrooms, Bathrooms, Area */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.thirdWidth]}>
              <Text style={[styles.label, isDark && styles.textDark]}>Bedrooms *</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="e.g. 3"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.bedrooms}
                onChangeText={(value) => handleInputChange('bedrooms', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.thirdWidth]}>
              <Text style={[styles.label, isDark && styles.textDark]}>Bathrooms *</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="e.g. 3"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.bathrooms}
                onChangeText={(value) => handleInputChange('bathrooms', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.thirdWidth]}>
              <Text style={[styles.label, isDark && styles.textDark]}>Area (sqm) *</Text>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="e.g. 180"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.areaSqm}
                onChangeText={(value) => handleInputChange('areaSqm', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Furnished Toggle */}
          <View style={styles.switchRow}>
            <Text style={[styles.label, isDark && styles.textDark]}>Furnished</Text>
            <TouchableOpacity
              style={[styles.switch, formData.furnished && styles.switchActive]}
              onPress={() => handleInputChange('furnished', !formData.furnished)}
            >
              <View style={[styles.switchThumb, formData.furnished && styles.switchThumbActive]} />
            </TouchableOpacity>
          </View>

          {/* Amenities */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>Amenity Category</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryFilterContainer}
              contentContainerStyle={styles.categoryFilterContent}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === 'All' && styles.categoryChipSelected,
                  isDark && selectedCategory !== 'All' && styles.categoryChipDark
                ]}
                onPress={() => setSelectedCategory('All')}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === 'All' && styles.categoryChipTextSelected,
                  isDark && selectedCategory !== 'All' && styles.textDark
                ]}>All</Text>
              </TouchableOpacity>

              {Array.from(new Set(amenities.map(a => a.category || 'Other').filter(Boolean))).sort().map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipSelected,
                    isDark && selectedCategory !== category && styles.categoryChipDark
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextSelected,
                    isDark && selectedCategory !== category && styles.textDark
                  ]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, isDark && styles.textDark, { marginTop: 16 }]}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {amenities
                .filter(a => selectedCategory === 'All' || (a.category || 'Other') === selectedCategory)
                .map((amenity) => (
                  <TouchableOpacity
                    key={amenity.id}
                    style={[
                      styles.amenityChip,
                      isDark && styles.amenityChipDark,
                      selectedAmenities.includes(amenity.id) && styles.amenityChipSelected,
                    ]}
                    onPress={() => toggleAmenity(amenity.id)}
                  >
                    {/* Icon removed to match design or can be kept if user wants icons. Design ref image didn't show icons, just text pills. 
                      User asked for "desain kategorinya seperti pada gambar". 
                      The image shows just text in pills for amenities. I'll keep it simple or matches the chip style. 
                      The previous code had icons. I'll keep icons for now as it adds value, but style the chip to look like the design.
                  */}
                    <Text style={[
                      styles.amenityText,
                      isDark && styles.textDark,
                      selectedAmenities.includes(amenity.id) && styles.amenityTextSelected,
                    ]}>
                      {amenity.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Property Images */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>Property Images *</Text>
            <TouchableOpacity
              style={[styles.uploadButton, isDark && styles.uploadButtonDark]}
              onPress={handleImagePicker}
              disabled={isUploadingImages}
            >
              {isUploadingImages ? (
                <ActivityIndicator size="small" color="#0F6980" />
              ) : (
                <>
                  <Icon name="camera-outline" size={24} color={isDark ? '#666' : '#999'} />
                  <Text style={[styles.uploadText, isDark && styles.textSecondaryDark]}>Upload Photos</Text>
                </>
              )}
            </TouchableOpacity>

            {images.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Icon name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.textDark]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              placeholder="Describe your property..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (isLoading || isUploadingImages) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || isUploadingImages}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{mode === 'edit' ? 'Save Changes' : 'Submit Listing'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Property Type Modal */}
      <Modal
        visible={showPropertyTypeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPropertyTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.textDark]}>Select Property Type</Text>
              <TouchableOpacity onPress={() => setShowPropertyTypeModal(false)}>
                <Icon name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalItem,
                    isDark && styles.modalItemDark,
                    formData.propertyTypeId === type.id && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('propertyTypeId', type.id);
                    setShowPropertyTypeModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    isDark && styles.textDark,
                    formData.propertyTypeId === type.id && styles.modalItemTextSelected,
                  ]}>
                    {type.name}
                  </Text>
                  {formData.propertyTypeId === type.id && (
                    <Icon name="checkmark-circle" size={20} color="#0F6980" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal >

      {/* Currency Modal */}
      < Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.textDark]}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Icon name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.modalItem,
                    isDark && styles.modalItemDark,
                    formData.currencyCode === currency.code && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('currencyCode', currency.code);
                    setShowCurrencyModal(false);
                  }}
                >
                  <View style={styles.currencyRow}>
                    <Text style={[styles.currencySymbol, isDark && styles.textDark]}>{currency.symbol}</Text>
                    <Text style={[styles.modalItemText, isDark && styles.textDark]}>
                      {currency.name} ({currency.code})
                    </Text>
                  </View>
                  {formData.currencyCode === currency.code && (
                    <Icon name="checkmark-circle" size={20} color="#0F6980" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Country Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.textDark]}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Icon name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.modalItem,
                    isDark && styles.modalItemDark,
                    formData.country === country.code && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('country', country.code);
                    setShowCountryModal(false);
                  }}
                >
                  <View style={styles.currencyRow}>
                    <Text style={[styles.countryFlag]}>{country.flag}</Text>
                    <Text style={[styles.modalItemText, isDark && styles.textDark]}>
                      {country.name}
                    </Text>
                  </View>
                  {formData.country === country.code && (
                    <Icon name="checkmark-circle" size={20} color="#0F6980" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
    color: '#fff',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 8,
  },
  inputText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switch: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#0F6980',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  amenityChipDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
  },
  amenityChipSelected: {
    backgroundColor: '#0F6980',
    borderColor: '#0F6980',
  },
  amenityText: {
    fontSize: 14,
    color: '#000',
  },
  amenityTextSelected: {
    color: '#fff',
  },
  amenityCategorySection: {
    marginBottom: 16,
  },
  amenityCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  categoryFilterContainer: {
    marginBottom: 8,
  },
  categoryFilterContent: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  categoryChipDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
  },
  categoryChipSelected: {
    backgroundColor: '#0F6980',
    borderColor: '#0F6980',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  uploadButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadButtonDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  imagePreviewContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#0F6980',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#999',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainerDark: {
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHeaderDark: {
    borderBottomColor: '#3A3A3C',
  },
  modalMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalContentDark: {
    backgroundColor: '#1C1C1E',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalItemDark: {
    borderBottomColor: '#3A3A3C',
  },
  modalItemSelected: {
    backgroundColor: '#F0F9FA',
  },
  modalItemText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#0F6980',
    fontWeight: '600',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    width: 40,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 8,
  },
});

export default CreatePropertyForm;
