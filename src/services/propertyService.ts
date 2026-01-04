import { apiService } from './api';
import {
  Property,
  CreatePropertyData,
  Review,
  CreateReviewData,
  Favorite,
} from '../types';

export const propertyService = {
  // Property CRUD
  async getProperties(params?: {
    page?: number;
    limit?: number;
    featured?: boolean;
  }): Promise<{ properties: Property[]; total: number }> {
    return apiService.get<{ properties: Property[]; total: number }>('/properties', {
      params,
    });
  },

  async getPropertiesWithFilters(params?: {
    page?: number;
    limit?: number;
    city?: string;
    state?: string;
    country?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyTypeId?: string;
    furnished?: boolean;
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<{ properties: Property[]; total: number; page: number; limit: number }> {
    return apiService.get<{ properties: Property[]; total: number; page: number; limit: number }>('/properties', {
      params,
    });
  },

  async getNearbyProperties(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
  }): Promise<{ properties: Property[]; total: number }> {
    const response = await apiService.get<{
      success: boolean;
      data: {
        properties: Property[];
        count: number;
      }
    }>('/properties/nearby', {
      params,
    });
    return {
      properties: response.data.properties,
      total: response.data.count,
    };
  },

  async getPropertyById(id: string): Promise<Property> {
    return apiService.get<Property>(`/properties/${id}`);
  },

  async createProperty(data: CreatePropertyData): Promise<Property> {
    return apiService.post<Property>('/properties', data);
  },

  async updateProperty(id: string, data: Partial<CreatePropertyData>): Promise<Property> {
    return apiService.put<Property>(`/properties/${id}`, data);
  },

  async deleteProperty(id: string): Promise<void> {
    return apiService.delete<void>(`/properties/${id}`);
  },

  async uploadPropertyImages(propertyId: string, formData: FormData): Promise<{ imageUrls: string[] }> {
    return apiService.uploadFormData<{ imageUrls: string[] }>(
      `/properties/${propertyId}/images`,
      formData
    );
  },

  // Reviews & Ratings
  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    return apiService.get<Review[]>(`/properties/${propertyId}/reviews`);
  },

  async createReview(data: CreateReviewData): Promise<Review> {
    return apiService.post<Review>('/reviews', data);
  },

  async updateReview(reviewId: string, data: Partial<CreateReviewData>): Promise<Review> {
    return apiService.put<Review>(`/reviews/${reviewId}`, data);
  },

  async deleteReview(reviewId: string): Promise<void> {
    return apiService.delete<void>(`/reviews/${reviewId}`);
  },

  // Favorites
  async getFavorites(): Promise<Favorite[]> {
    return apiService.get<Favorite[]>('/favorites');
  },

  async addToFavorites(propertyId: string): Promise<Favorite> {
    return apiService.post<Favorite>('/favorites', { propertyId });
  },

  async removeFromFavorites(favoriteId: string): Promise<void> {
    return apiService.delete<void>(`/favorites/${favoriteId}`);
  },

  async isFavorite(propertyId: string): Promise<boolean> {
    const response = await apiService.get<{ isFavorite: boolean }>(
      `/favorites/check/${propertyId}`
    );
    return response.isFavorite;
  },

  // Amenities
  async getAmenities(params?: {
    category?: string;
  }): Promise<{ data: Array<{ id: string; name: string; icon: string; category: string }> }> {
    return apiService.get<{ data: Array<{ id: string; name: string; icon: string; category: string }> }>('/amenities', {
      params,
    });
  },

  async getAmenityCategories(): Promise<{ data: Array<{ id: string; name: string; description?: string }> }> {
    return apiService.get<{ data: Array<{ id: string; name: string; description?: string }> }>('/amenities/categories');
  },

  // Price Prediction (AI Feature)
  async predictPrice(data: {
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    amenities: string[];
  }): Promise<{ predictedPrice: number; confidence: number }> {
    return apiService.post<{ predictedPrice: number; confidence: number }>(
      '/properties/predict-price',
      data
    );
  },
};
