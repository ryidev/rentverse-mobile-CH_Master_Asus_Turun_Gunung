import { apiService } from './api';
import {
  Property,
  CreatePropertyData,
  Review,
  CreateReviewData,
  Favorite,
} from '../types';
import { ENV } from '../config/env';

export const propertyService = {
  // Property CRUD
  async getProperties(params?: {
    page?: number;
    limit?: number;
    featured?: boolean;
  }): Promise<{ properties: Property[]; total: number }> {
    const response = await apiService.get<{
      success: boolean;
      data: { properties: Property[]; pagination: { total: number } };
    }>('/properties', {
      params,
    });
    return {
      properties: response.data.properties,
      total: response.data.pagination.total,
    };
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
    const response = await apiService.get<{
      success: boolean;
      data: {
        properties: Property[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }
    }>('/properties', {
      params,
    });
    return {
      properties: response.data.properties,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
    };
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
      properties: response.data?.properties || [],
      total: response.data?.count || 0,
    };
  },

  async getTopRatedProperties(params?: {
    city?: string;
    country?: string;
    limit?: number;
    minRating?: number;
  }): Promise<{ properties: Property[]; total: number }> {
    const response = await apiService.get<{
      success: boolean;
      data: {
        properties: Property[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }
    }>('/properties', {
      params: {
        ...params,
        sortBy: 'rating',
        page: 1,
      },
    });
    return {
      properties: response.data?.properties || [],
      total: response.data?.pagination?.total || 0,
    };
  },

  async getPropertyStats(params?: {
    city?: string;
    state?: string;
    country?: string;
  }): Promise<{ total: number; byCity: Array<{ city: string; count: number }> }> {
    const response = await apiService.get<{
      success: boolean;
      data: {
        properties: Property[];
        pagination: {
          total: number;
        };
      }
    }>('/properties', {
      params: {
        ...params,
        limit: 1, // We only need the count
      },
    });
    return {
      total: response.data?.pagination?.total || 0,
      byCity: [], // Backend doesn't provide this, would need separate endpoint
    };
  },

  async getUserFavorites(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ properties: Property[]; total: number }> {
    const response = await apiService.get<{
      success: boolean;
      data: {
        favorites: Property[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }
    }>('/users/favorites', {
      params,
    });
    return {
      properties: response.data?.favorites || [],
      total: response.data?.pagination?.total || 0,
    };
  },

  async toggleFavorite(propertyId: string): Promise<{ isFavorited: boolean }> {
    const response = await apiService.post<{
      success: boolean;
      data: {
        isFavorited: boolean;
      };
    }>(`/properties/${propertyId}/favorite`, {});
    return response.data;
  },


  async getPropertyById(id: string): Promise<Property> {
    const response = await apiService.get<{
      success: boolean;
      data: {
        property: Property;
      };
    }>(`/properties/${id}`);

    // Unwrap the nested response structure
    const property = response.data.property;

    // Normalize field names for backward compatibility
    return {
      ...property,
      area: property.areaSqm || property.area || 0,
      rating: property.averageRating || property.rating || 0,
      reviewCount: property.totalRatings || property.reviewCount || 0,
    };
  },

  async createProperty(data: CreatePropertyData): Promise<Property> {
    // The POST endpoint is at /api/v1/properties (no /m), so we remove /m from base URL
    const baseUrl = ENV.API_BASE_URL.replace(/\/m$/, '');
    return apiService.post<Property>(`${baseUrl}/properties`, data);
  },

  async updateProperty(id: string, data: Partial<CreatePropertyData>): Promise<Property> {
    // The PUT endpoint is at /api/v1/properties (no /m), so we remove /m from base URL
    const baseUrl = ENV.API_BASE_URL.replace(/\/m$/, '');
    return apiService.put<Property>(`${baseUrl}/properties/${id}`, data);
  },

  async deleteProperty(id: string): Promise<void> {
    // The DELETE endpoint is at /api/v1/properties (no /m), so we remove /m from base URL
    const baseUrl = ENV.API_BASE_URL.replace(/\/m$/, '');
    return apiService.delete<void>(`${baseUrl}/properties/${id}`);
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
  async getPropertiesMobile(params?: {
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
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW' | 'REVIEW_PENDING';
  }): Promise<{ properties: Property[]; total: number; page: number; limit: number }> {
    // Add default limit to get all properties
    const queryParams = {
      ...params,
      limit: params?.limit || 1000, // Default to 1000 to show all properties
    };

    // Check if the backend returns standard wrapped response format
    const response = await apiService.get<{
      success: boolean;
      data: {
        properties: Property[];
        count: number;
        total?: number;
        page: number;
        limit: number;
      };
    }>('/properties', {
      params: queryParams,
    });

    // Depending on actual API shape, it might be in response.data or just response if existing interceptors handle it
    // Based on getPropertiesWithFilters, it expects response.data.properties

    // Safety check just in case response is the direct object
    const data = response.data || response;

    return {
      properties: data.properties || [],
      total: data.count || data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10
    };
  },

  async updatePropertyStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Property> {
    return apiService.put<Property>(`/properties/${id}`, { status });
  },
};
