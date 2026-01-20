import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

interface Property {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  currencyCode?: string;
  image?: string;
}

interface MapTilerViewProps {
  latitude?: number;
  longitude?: number;
  properties?: Property[];
  onLocationSelect?: (latitude: number, longitude: number) => void;
  onPropertyMarkerClick?: (propertyId: string) => void;
  height?: number;
  showLocationPicker?: boolean;
  showUserLocation?: boolean;
}

const MapTilerView: React.FC<MapTilerViewProps> = ({
  latitude = 3.1390,
  longitude = 101.6869,
  properties = [],
  onLocationSelect,
  onPropertyMarkerClick,
  height = 250,
  showLocationPicker = false,
  showUserLocation = true,
}) => {
  const { theme } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const isDark = theme === 'dark';

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body { height: 100%; width: 100%; }
    #map { height: 100%; width: 100%; }
    .property-popup {
      min-width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .property-popup img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .property-popup h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
      color: #1a1a1a;
    }
    .property-popup .price {
      font-size: 16px;
      font-weight: 700;
      color: #0F6980;
      margin-bottom: 8px;
    }
    .property-popup .view-btn {
      display: block;
      width: 100%;
      padding: 8px;
      background: #0F6980;
      color: white;
      text-align: center;
      border-radius: 6px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      const lat = ${latitude};
      const lng = ${longitude};
      const isDark = ${isDark};
      const showPicker = ${showLocationPicker};
      const showUserLoc = ${showUserLocation};
      const properties = ${JSON.stringify(properties)};

      const map = L.map('map', {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      const tileUrl = 'https://api.maptiler.com/maps/' +
        (isDark ? 'streets-v2-dark' : 'streets-v2') +
        '/{z}/{x}/{y}.png?key=pgR2s5GhaTpw9T2OsPGv';

      L.tileLayer(tileUrl, {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        maxZoom: 19
      }).addTo(map);

      // Custom icon for properties
      const propertyIcon = L.divIcon({
        className: 'custom-property-marker',
        html: '<div style="background: #0F6980; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Custom icon for user location (Google Maps style)
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: '<div style="position: relative; width: 24px; height: 24px;">' +
              '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: rgba(66, 133, 244, 0.2); border-radius: 50%;"></div>' +
              '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px; background: #4285F4; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>' +
              '</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      let userMarker;
      let pickerMarker;

      // Add property markers
      const markers = [];
      if (properties && properties.length > 0) {
        properties.forEach(property => {
          const marker = L.marker([property.latitude, property.longitude], {
            icon: propertyIcon
          }).addTo(map);

          const currency = property.currencyCode || 'MYR';
          const popupContent = \`
            <div class="property-popup">
              \${property.image ? \`<img src="\${property.image}" alt="\${property.title}" />\` : ''}
              <h3>\${property.title}</h3>
              <div class="price">\${currency} \${property.price.toLocaleString()}/mo</div>
              <a class="view-btn" onclick="handlePropertyClick('\${property.id}')">View Details</a>
            </div>
          \`;

          marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
          });

          markers.push(marker);
        });
      }

      // Show user location marker
      if (showUserLoc && !showPicker) {
        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
        userMarker.bindPopup('<strong>My Location</strong>');

        // If there are properties, fit bounds to include both user location and properties
        if (markers.length > 0) {
          const allMarkers = [...markers, userMarker];
          const group = L.featureGroup(allMarkers);
          map.fitBounds(group.getBounds().pad(0.1));
        } else {
          // If no properties, center on user location
          map.setView([lat, lng], 14);
        }
      } else if (markers.length > 0) {
        // If no user location but has properties, fit to properties only
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      }

      // Location picker functionality
      if (showPicker) {
        pickerMarker = L.marker([lat, lng], { draggable: true }).addTo(map);

        pickerMarker.on('dragend', function() {
          const pos = pickerMarker.getLatLng();
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'location',
            latitude: pos.lat,
            longitude: pos.lng
          }));
        });

        map.on('click', function(e) {
          pickerMarker.setLatLng(e.latlng);
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'location',
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          }));
        });
      }

      // Handle property marker click
      window.handlePropertyClick = function(propertyId) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'propertyClick',
          propertyId: propertyId
        }));
      };

      window.updateLocation = function(newLat, newLng) {
        if (pickerMarker) {
          pickerMarker.setLatLng([newLat, newLng]);
        }
        if (userMarker) {
          userMarker.setLatLng([newLat, newLng]);
        }
        map.setView([newLat, newLng], 14);
      };

      window.recenterMap = function(lat, lng) {
        if (map) {
          map.setView([lat, lng], 14);
          if (userMarker) {
            userMarker.setLatLng([lat, lng]);
            userMarker.openPopup();
          }
        }
      };

      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
    })();
  </script>
</body>
</html>`;

  useEffect(() => {
    if (webViewRef.current && latitude && longitude) {
      webViewRef.current.injectJavaScript(`
        if (typeof updateLocation !== 'undefined') {
          updateLocation(${latitude}, ${longitude});
        }
        true;
      `);
    }
  }, [latitude, longitude]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location' && onLocationSelect) {
        onLocationSelect(data.latitude, data.longitude);
      } else if (data.type === 'propertyClick' && onPropertyMarkerClick) {
        onPropertyMarkerClick(data.propertyId);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleRecenter = () => {
    if (webViewRef.current && showUserLocation) {
      webViewRef.current.injectJavaScript(`
        if (typeof recenterMap !== 'undefined') {
          recenterMap(${latitude}, ${longitude});
        }
        true;
      `);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F6980" />
          </View>
        )}
      />
      {showUserLocation && !showLocationPicker && (
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Icon name="locate" size={24} color="#4285F4" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default MapTilerView;
