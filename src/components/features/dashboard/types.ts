/**
 * Dashboard Domain Types
 * 
 * Type definitions for dashboard features
 */

export interface IKPIMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  format: 'number' | 'currency' | 'percentage';
}

export interface ITrendData {
  date: string;
  value: number;
}

export interface ISystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface IQuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: string;
}

export interface IActivityItem {
  id: string;
  type: 'booking' | 'payment' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface IDashboardStats {
  totalBookings: number;
  activeBookings: number;
  revenue: number;
  users: number;
  facilities: number;
}

export type DashboardView = 'overview' | 'analytics' | 'reports';
