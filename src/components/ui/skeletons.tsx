/**
 * Loading Skeleton Components
 * 
 * Reusable skeleton loaders for better perceived performance.
 * Shows placeholder content while data is loading.
 */

import React from "react";
import { Card, CardContent, CardHeader } from "./card";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  readonly className?: string;
}

/**
 * Base Skeleton Component
 */
export const Skeleton = ({ className }: SkeletonProps): JSX.Element => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
};

/**
 * Booking Card Skeleton
 */
export const BookingCardSkeleton = (): JSX.Element => {
  return (
    <Card className="dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Dashboard Stats Skeleton
 */
export const DashboardStatsSkeleton = (): JSX.Element => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Facility Card Skeleton
 */
export const FacilityCardSkeleton = (): JSX.Element => {
  return (
    <Card className="overflow-hidden dark:bg-gray-800">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = ({ columns = 5 }: { readonly columns?: number }): JSX.Element => {
  return (
    <tr className="border-b dark:border-gray-700">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

/**
 * List Skeleton
 */
export const ListSkeleton = ({ items = 3 }: { readonly items?: number }): JSX.Element => {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Dashboard Hero Skeleton
 */
export const DashboardHeroSkeleton = (): JSX.Element => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-2 w-full max-w-md" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-12 w-40" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Profile Card Skeleton
 */
export const ProfileCardSkeleton = (): JSX.Element => {
  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Quick Actions Skeleton
 */
export const QuickActionsSkeleton = (): JSX.Element => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <Skeleton className="h-10 w-10 rounded-full mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      ))}
    </div>
  );
};
