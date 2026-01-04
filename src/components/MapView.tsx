import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import ENV from '../config/env';

const { width } = Dimensions.get('window');

interface Property {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: string | number;
  image?: string;
}

interface MapViewComponentProps {
  properties?: Property[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMarkerPress?: (property: Property) => void;
  height?: number;
  showCurrentLocation?: boolean;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  properties = [],
  initialRegion = {
    latitude: 3.1390, // Kuala Lumpur
    longitude: 101.6869,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  onMarkerPress,
  height = 250,
  showCurrentLocation = true,
}) => {
  const { colors, theme } = useTheme();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
  const [locationPermission, setLocationPermission] = useState(false);
  const mapRef = useRef<MapView>(null);

  const isDarkMode = theme === 'dark';

  // MapTiler style URLs
  const mapStyle = isDarkMode
    ? `https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=${ENV.MAPTILER_API_KEY}`
    : `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${ENV.MAPTILER_API_KEY}`;

  useEffect(() => {
    if (showCurrentLocation) {
      requestLocationPermission();
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show properties near you.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setLocationPermission(true);
          getCurrentLocation();
        }
      } else {
        // iOS - permission handled by Info.plist
        setLocationPermission(true);
        getCurrentLocation();
      }
    } catch (err) {
      console.warn('Location permission error:', err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position: any) => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
        setCurrentRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      },
      (error: any) => {
        console.warn('Error getting location:', error);
        // Fallback to default region
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  const handleMyLocationPress = () => {
    if (locationPermission) {
      getCurrentLocation();
    } else {
      requestLocationPermission();
    }
  };

  const handleMarkerPress = (property: Property) => {
    setSelectedProperty(property.id);
    if (onMarkerPress) {
      onMarkerPress(property);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={currentRegion}
        showsUserLocation={showCurrentLocation && locationPermission}
        showsMyLocationButton={false}
        showsCompass={false}
        onMapReady={() => setLoading(false)}
        mapType="none"
      >
        {/* MapTiler Tiles Overlay */}
        <UrlTile
          urlTemplate={mapStyle}
          maximumZ={19}
          flipY={false}
          zIndex={-1}
        />

        {/* Property Markers */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            coordinate={{
              latitude: property.latitude,
              longitude: property.longitude,
            }}
            onPress={() => handleMarkerPress(property)}
          >
            <View
              style={[
                styles.markerContainer,
                {
                  backgroundColor:
                    selectedProperty === property.id
                      ? '#0F6980'
                      : colors.surface,
                  borderColor:
                    selectedProperty === property.id ? '#fff' : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.markerPrice,
                  {
                    color:
                      selectedProperty === property.id
                        ? '#fff'
                        : colors.text,
                  },
                ]}
              >
                ${typeof property.price === 'number' ? property.price : property.price}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F6980" />
        </View>
      )}

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        {/* Zoom Controls */}
        <View style={[styles.zoomControls, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.zoomButton}>
            <Icon name="add" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.zoomButton}>
            <Icon name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* My Location Button */}
        {showCurrentLocation && (
          <TouchableOpacity
            style={[
              styles.locationButton,
              { backgroundColor: colors.surface },
            ]}
            onPress={handleMyLocationPress}
          >
            <Icon name="locate" size={20} color={locationPermission ? '#0F6980' : colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Counter */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsBox}>
          <Text style={styles.resultsText}>
            Showing {properties.length} results
          </Text>
          <Icon name="options-outline" size={16} color="#fff" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  markerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 10,
  },
  zoomControls: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  zoomButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  resultsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resultsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F6980',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MapViewComponent;
