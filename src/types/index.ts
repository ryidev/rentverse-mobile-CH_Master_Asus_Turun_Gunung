// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// Property Types
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // in sqm
  images: string[];
  amenities: Amenity[];
  ownerId: string;
  owner?: User;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  status?: 'pending_review' | 'approved' | 'rejected' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: string[];
}

// Amenity Types
export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category?: string;
}

// Rating & Review Types
export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  user?: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewData {
  propertyId: string;
  rating: number;
  comment: string;
}

// Favorite Types
export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  createdAt: string;
}

// Booking Types
export interface Booking {
  id: string;
  propertyId: string;
  property?: Property;
  userId: string;
  user?: User;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending_review' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface CreateBookingData {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AdminStack: undefined;
};


export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  AdminLogin: undefined;
};

export type MainTabParamList = {
  Explore: undefined;
  HomeScreen: undefined;
  Saved: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  PropertyDetail: { propertyId: string };
  CreateProperty: undefined;
  EditProperty: { propertyId: string };
};
