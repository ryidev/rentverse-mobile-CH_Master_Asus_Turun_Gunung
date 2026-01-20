// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // Computed full name
  phone?: string;
  avatar?: string;
  createdAt: string;
  role: 'USER' | 'ADMIN';
  dateOfBirth?: string;
  isActive?: boolean;
  profilePicture?: string | null;
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
  firstName: string;
  lastName: string;
  phone?: string;
}

// Property Types
export interface Property {
  id: string;
  code: string; // Unique property code
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string; // Google Maps URL
  bedrooms: number;
  bathrooms: number;
  area: number; // in sqm (for backward compatibility)
  areaSqm?: number; // Backend uses areaSqm
  furnished?: boolean;
  images: string[];
  amenities: Amenity[];
  ownerId: string;
  owner?: User;
  rating: number; // Average rating (for backward compatibility)
  averageRating?: number; // Backend returns averageRating
  reviewCount: number; // Total ratings count (for backward compatibility)
  totalRatings?: number; // Backend returns totalRatings
  viewCount?: number; // Number of views
  isFavorited?: boolean; // Whether current user favorited this property
  favoriteCount?: number; // Total number of favorites
  isFeatured: boolean;
  isAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
  status?: 'pending_review' | 'approved' | 'rejected' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVIEW_PENDING';
  currencyCode: string; // Store property's original currency (IDR, MYR, etc)
  propertyType?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  currencyCode?: string; // Must save currency when creating property!
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
