export * from './colors';
import { ENV } from '../config/env';

export const API_BASE_URL = ENV.API_BASE_URL;
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
};

export const AMENITIES_LIST = [
  { id: '1', name: 'WiFi', icon: 'wifi' },
  { id: '2', name: 'Kitchen', icon: 'silverware-fork-knife' },
  { id: '3', name: 'Air Conditioning', icon: 'air-conditioner' },
  { id: '4', name: 'Parking', icon: 'car' },
  { id: '5', name: 'Pool', icon: 'pool' },
  { id: '6', name: 'Gym', icon: 'dumbbell' },
  { id: '7', name: 'TV', icon: 'television' },
  { id: '8', name: 'Washer', icon: 'washing-machine' },
  { id: '9', name: 'Pets Allowed', icon: 'dog' },
  { id: '10', name: 'Security', icon: 'shield-check' },
];
