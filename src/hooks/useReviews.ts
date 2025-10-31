import { useState, useMemo, useCallback } from 'react';

/**
 * Review data structure
 */
export interface Review {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly userAvatar?: string;
  readonly rating: number;
  readonly comment: string;
  readonly createdAt: string;
  readonly verified: boolean;
  readonly helpful: number;
  readonly reported: boolean;
}

/**
 * Review filter options
 */
export type ReviewFilter = 'all' | 'highest' | 'lowest' | 'recent' | 'verified';

/**
 * Review sort options
 */
export type ReviewSortBy = 'date' | 'rating' | 'helpful';

/**
 * Custom hook for managing reviews
 *
 * @param facilityId - The facility ID to fetch reviews for
 * @returns Review management state and actions
 */
export const useReviews = (facilityId: string) => {
  const [reviews, setReviews] = useState<readonly Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [sortBy, setSortBy] = useState<ReviewSortBy>('date');

  /**
   * Sort and filter reviews based on current state
   */
  const sortedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Apply filters
    switch (filter) {
      case 'highest':
        filtered = filtered.filter(r => r.rating >= 4);
        break;
      case 'lowest':
        filtered = filtered.filter(r => r.rating <= 2);
        break;
      case 'verified':
        filtered = filtered.filter(r => r.verified);
        break;
      case 'recent':
        filtered = filtered.filter(r => {
          const reviewDate = new Date(r.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return reviewDate >= thirtyDaysAgo;
        });
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'helpful':
        return filtered.sort((a, b) => b.helpful - a.helpful);
      case 'date':
      default:
        return filtered.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [reviews, filter, sortBy]);

  /**
   * Calculate average rating
   */
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  /**
   * Get rating distribution
   */
  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  }, [reviews]);

  /**
   * Mark review as helpful
   */
  const markHelpful = useCallback((reviewId: string) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
  }, []);

  /**
   * Report a review
   */
  const reportReview = useCallback((reviewId: string) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? { ...review, reported: true }
        : review
    ));
  }, []);

  /**
   * Add a new review
   */
  const addReview = useCallback((review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'reported'>) => {
    const newReview: Review = {
      ...review,
      id: `review_${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpful: 0,
      reported: false
    };
    setReviews(prev => [newReview, ...prev]);
  }, []);

  return {
    reviews,
    sortedReviews,
    loading,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    averageRating,
    ratingDistribution,
    markHelpful,
    reportReview,
    addReview
  };
};
