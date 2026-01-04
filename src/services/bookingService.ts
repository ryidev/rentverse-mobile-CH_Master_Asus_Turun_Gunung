import { apiService } from './api';
import { Booking, CreateBookingData } from '../types';

export const bookingService = {
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
    role?: 'tenant' | 'owner';
  }): Promise<Booking[]> {
    return apiService.get<Booking[]>('/m/bookings', { params });
  },

  async getBookingById(id: string): Promise<Booking> {
    return apiService.get<Booking>(`/bookings/${id}`);
  },

  async createBooking(data: CreateBookingData): Promise<Booking> {
    return apiService.post<Booking>('/bookings', data);
  },

  async cancelBooking(id: string): Promise<Booking> {
    return apiService.patch<Booking>(`/bookings/${id}/cancel`);
  },

  async getPropertyBookings(propertyId: string): Promise<Booking[]> {
    return apiService.get<Booking[]>(`/properties/${propertyId}/bookings`);
  },
};
