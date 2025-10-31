import { BaseSupabaseService } from './base.service';

export interface IAdminMetric {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly change: number;
  readonly changeType: 'positive' | 'negative' | 'neutral';
  readonly timeframe: string;
}

export class AdminMetricsService extends BaseSupabaseService {
  async getDashboardMetrics(): Promise<IAdminMetric[]> {
    // In a real implementation, this would fetch from a view or calculate metrics
    // For now, we'll return mock data that would be replaced with actual queries
    const res = await this.client.from('admin_metrics').select('*');
    return this.handle<IAdminMetric[]>(res);
  }
  
  async getBookingTrends(): Promise<any[]> {
    // This would fetch booking trend data for charts
    const res = await this.client.from('booking_trends').select('*');
    return this.handle<any[]>(res);
  }
  
  async getTopFacilities(): Promise<any[]> {
    // This would fetch top facilities data for charts
    const res = await this.client.from('top_facilities').select('*');
    return this.handle<any[]>(res);
  }
}

export const adminMetricsService = new AdminMetricsService();