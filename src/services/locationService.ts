import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  coords: LocationCoords;
  city: string;
  state: string;
  country: string;
}

class LocationService {
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show nearby properties.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      // iOS permissions are handled in Info.plist
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationInfo | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Location permission denied');
        return null;
      }

      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Try to get city name from reverse geocoding
            // For now, we'll use a simple approach - you can integrate Google Geocoding API later
            const cityName = await this.getCityFromCoords(latitude, longitude);

            resolve({
              coords: { latitude, longitude },
              city: cityName,
              state: '',
              country: 'Indonesia',
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            reject(error);
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async getCityFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RentverseApp/1.0',
          },
        }
      );

      const data = await response.json();

      if (data && data.address) {
        // Try to get city from various possible fields
        return (
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.municipality ||
          data.address.county ||
          'Unknown'
        );
      }

      return 'Unknown';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Unknown';
    }
  }

  getDefaultLocation(): LocationInfo {
    return {
      coords: {
        latitude: -7.2575,
        longitude: 112.7521,
      },
      city: 'Surabaya',
      state: 'East Java',
      country: 'Indonesia',
    };
  }
}

export const locationService = new LocationService();
