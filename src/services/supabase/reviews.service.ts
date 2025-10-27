/**
 * Reviews Service
 *
 * Manages facility reviews and ratings.
 *
 * Features:
 * - Create and manage reviews
 * - Rating calculations
 * - Review moderation
 * - Helpful votes
 * - Review statistics
 *
 * @module services/supabase/reviews
 */

import { BaseService } from './base.service';
import { supabase } from './client';
import { handleSupabaseError, NotFoundError, ValidationError, ForbiddenError } from './errors';
import type {
  Review,
  ReviewInsert,
  ReviewUpdate,
  ReviewWithDetails,
  UserProfile,
  Facility,
  PaginatedResponse,
} from './types';

// ============================================================================
// Extended Types
// ============================================================================

export interface CreateReviewParams {
  readonly facilityId: string;
  readonly userId: string;
  readonly bookingId: string;
  readonly rating: number;
  readonly comment?: string;
  readonly photos?: string[];
}

export interface UpdateReviewParams {
  readonly rating?: number;
  readonly comment?: string;
  readonly photos?: string[];
}

export interface ReviewFilters {
  readonly facilityId?: string;
  readonly userId?: string;
  readonly minRating?: number;
  readonly maxRating?: number;
  readonly hasPhotos?: boolean;
  readonly sortBy?: 'recent' | 'rating' | 'helpful';
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FacilityRatingStats {
  readonly averageRating: number;
  readonly totalReviews: number;
  readonly ratingDistribution: {
    readonly 5: number;
    readonly 4: number;
    readonly 3: number;
    readonly 2: number;
    readonly 1: number;
  };
  readonly recentReviews: ReviewWithDetails[];
}

export interface ReviewHelpfulVote {
  readonly reviewId: string;
  readonly userId: string;
  readonly isHelpful: boolean;
}

// ============================================================================
// Reviews Service
// ============================================================================

export class ReviewsService extends BaseService<Review, ReviewInsert, ReviewUpdate> {
  protected readonly config = {
    tableName: 'reviews',
    idColumn: 'id',
    softDelete: false,
  };

  /**
   * Create a new review
   *
   * @param params - Review parameters
   * @returns Created review
   */
  async createReview(params: CreateReviewParams): Promise<Review> {
    try {
      // Check if user has already reviewed this facility
      const existingReview = await this.getUserReviewForFacility(
        params.userId,
        params.facilityId
      );

      if (existingReview) {
        throw new ValidationError('Review already exists', {
          review: ['You have already reviewed this facility'],
        });
      }

      // Verify booking exists and belongs to user
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id, user_id, facility_id, status')
        .eq('id', params.bookingId)
        .single();

      if (bookingError || !booking) {
        throw new NotFoundError('Booking', params.bookingId);
      }

      if (booking.user_id !== params.userId) {
        throw new ForbiddenError('You can only review your own bookings');
      }

      if (booking.facility_id !== params.facilityId) {
        throw new ValidationError('Booking does not match facility', {
          booking: ['This booking is not for the specified facility'],
        });
      }

      // Create review
      const reviewData: ReviewInsert = {
        facility_id: params.facilityId,
        user_id: params.userId,
        booking_id: params.bookingId,
        rating: params.rating,
        comment: params.comment,
        photos: params.photos,
      };

      return await this.create(reviewData);
    } catch (error) {
      throw handleSupabaseError(error, 'createReview');
    }
  }

  /**
   * Update review
   *
   * @param reviewId - Review ID
   * @param userId - User ID (for authorization)
   * @param params - Update parameters
   * @returns Updated review
   */
  async updateReview(
    reviewId: string,
    userId: string,
    params: UpdateReviewParams
  ): Promise<Review> {
    try {
      const review = await this.getById(reviewId);

      if (review.user_id !== userId) {
        throw new ForbiddenError('You can only update your own reviews');
      }

      const updateData: ReviewUpdate = {
        rating: params.rating,
        comment: params.comment,
        photos: params.photos,
      };

      return await this.update(reviewId, updateData);
    } catch (error) {
      throw handleSupabaseError(error, 'updateReview');
    }
  }

  /**
   * Delete review
   *
   * @param reviewId - Review ID
   * @param userId - User ID (for authorization)
   */
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      const review = await this.getById(reviewId);

      if (review.user_id !== userId) {
        throw new ForbiddenError('You can only delete your own reviews');
      }

      await this.delete(reviewId);
    } catch (error) {
      throw handleSupabaseError(error, 'deleteReview');
    }
  }

  /**
   * Get review with user and facility details
   *
   * @param reviewId - Review ID
   * @returns Review with details
   */
  async getReviewWithDetails(reviewId: string): Promise<ReviewWithDetails> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_profiles (*),
          facility:facilities (*)
        `)
        .eq('id', reviewId)
        .single();

      if (error) {
        throw handleSupabaseError(error, 'getReviewWithDetails');
      }

      if (!data) {
        throw new NotFoundError('Review', reviewId);
      }

      return data as ReviewWithDetails;
    } catch (error) {
      throw handleSupabaseError(error, 'getReviewWithDetails');
    }
  }

  /**
   * Get reviews for a facility
   *
   * @param filters - Filter parameters
   * @returns Paginated reviews
   */
  async getReviews(filters: ReviewFilters): Promise<PaginatedResponse<ReviewWithDetails>> {
    try {
      const page = filters.page ?? 1;
      const pageSize = filters.pageSize ?? 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('reviews')
        .select(`
          *,
          user:user_profiles (*),
          facility:facilities (*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.facilityId) {
        query = query.eq('facility_id', filters.facilityId);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters.maxRating) {
        query = query.lte('rating', filters.maxRating);
      }

      if (filters.hasPhotos) {
        query = query.not('photos', 'is', null);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw handleSupabaseError(error, 'getReviews');
      }

      const totalCount = count ?? 0;
      const hasMore = to < totalCount - 1;

      return {
        data: (data ?? []) as ReviewWithDetails[],
        count: totalCount,
        page,
        pageSize,
        hasMore,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'getReviews');
    }
  }

  /**
   * Get facility rating statistics
   *
   * @param facilityId - Facility ID
   * @returns Rating statistics
   */
  async getFacilityRatingStats(facilityId: string): Promise<FacilityRatingStats> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_profiles (*),
          facility:facilities (*)
        `)
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false });

      if (error) {
        throw handleSupabaseError(error, 'getFacilityRatingStats');
      }

      const totalReviews = reviews?.length ?? 0;

      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recentReviews: [],
        };
      }

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / totalReviews;

      // Calculate distribution
      const distribution = reviews.reduce(
        (acc, review) => {
          acc[review.rating as 1 | 2 | 3 | 4 | 5]++;
          return acc;
        },
        { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
      );

      // Get recent reviews (top 5)
      const recentReviews = (reviews.slice(0, 5) as ReviewWithDetails[]);

      return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews,
        ratingDistribution: distribution,
        recentReviews,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'getFacilityRatingStats');
    }
  }

  /**
   * Get user's review for a facility
   *
   * @param userId - User ID
   * @param facilityId - Facility ID
   * @returns User's review or null
   */
  async getUserReviewForFacility(
    userId: string,
    facilityId: string
  ): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        // No review found is not an error
        return null;
      }

      return data as Review;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user can review facility
   *
   * @param userId - User ID
   * @param facilityId - Facility ID
   * @returns True if user can review
   */
  async canUserReview(userId: string, facilityId: string): Promise<boolean> {
    try {
      // Check if user already reviewed
      const existingReview = await this.getUserReviewForFacility(userId, facilityId);
      if (existingReview) {
        return false;
      }

      // Check if user has completed booking
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .eq('status', 'completed')
        .limit(1);

      if (error) {
        return false;
      }

      return (bookings?.length ?? 0) > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark review as helpful
   *
   * @param reviewId - Review ID
   * @param userId - User ID
   */
  async markReviewAsHelpful(reviewId: string, userId: string): Promise<void> {
    try {
      const review = await this.getById(reviewId);

      // Increment helpful count
      await this.update(reviewId, {
        helpful_count: (review.helpful_count ?? 0) + 1,
      } as ReviewUpdate);

      // TODO: Store vote in review_helpful_votes table to prevent duplicate votes
    } catch (error) {
      throw handleSupabaseError(error, 'markReviewAsHelpful');
    }
  }

  // ==========================================================================
  // Validation Hooks
  // ==========================================================================

  protected async validateInsert(data: ReviewInsert): Promise<void> {
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new ValidationError('Invalid rating', {
        rating: ['Rating must be between 1 and 5'],
      });
    }

    if (data.comment && data.comment.length > 1000) {
      throw new ValidationError('Comment too long', {
        comment: ['Comment must be less than 1000 characters'],
      });
    }
  }

  protected async validateUpdate(id: string, data: ReviewUpdate): Promise<void> {
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new ValidationError('Invalid rating', {
        rating: ['Rating must be between 1 and 5'],
      });
    }

    if (data.comment && data.comment.length > 1000) {
      throw new ValidationError('Comment too long', {
        comment: ['Comment must be less than 1000 characters'],
      });
    }
  }
}

/**
 * Singleton instance of ReviewsService
 */
export const reviewsService = new ReviewsService();
