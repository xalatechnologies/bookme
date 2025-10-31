import { useQuery } from '@tanstack/react-query';
import { adminMetricsService } from '@/services/supabase/adminMetrics.service';
import type { IAdminMetric } from '@/services/supabase/adminMetrics.service';

export const useAdminMetrics = () => {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminMetricsService.getDashboardMetrics(),
  });
};

export const useBookingTrends = () => {
  return useQuery({
    queryKey: ['booking-trends'],
    queryFn: () => adminMetricsService.getBookingTrends(),
  });
};

export const useTopFacilities = () => {
  return useQuery({
    queryKey: ['top-facilities'],
    queryFn: () => adminMetricsService.getTopFacilities(),
  });
};