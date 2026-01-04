// Environment Configuration
// NOTE: Hardcoded values - react-native-config is not working properly

export const ENV = {
  // API Configuration
  API_BASE_URL: 'https://napiform-baffling-rosalina.ngrok-free.dev/api/v1/m',
  API_TIMEOUT: 15000,

  // App Configuration
  APP_NAME: 'RentVerse',
  APP_VERSION: '1.0.0',

  // OAuth - Hardcoded Client IDs
  GOOGLE_WEB_CLIENT_ID: '451684083302-3akpsnucahav0mjf5prp37tn60t8p8kn.apps.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID: '451684083302-kv4fhcn1lacvne53g7eis599a5mgiud1.apps.googleusercontent.com',

  // Map Configuration
  MAPTILER_API_KEY: 'pgR2s5GhaTpw9T2OsPGv',

  // Feature Flags
  ENABLE_AI_PREDICTION: false,
  ENABLE_OAUTH: true,
  ENABLE_PUSH_NOTIFICATIONS: false,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,

  // Upload Limits
  MAX_IMAGE_SIZE: 5242880, // 5MB
  MAX_IMAGES_PER_PROPERTY: 5,
};

export default ENV;
