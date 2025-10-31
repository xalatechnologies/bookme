import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useFavoritesStore } from '@/stores/favoritesStore';

interface UseFacilityActionsProps {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly capacity: number;
  readonly slug?: string;
}

interface ShareData {
  readonly title: string;
  readonly text: string;
  readonly url: string;
}

interface UseFacilityActionsReturn {
  readonly isAnimating: boolean;
  readonly isFacilityFavorite: boolean;
  readonly handleViewDetails: () => void;
  readonly handleBookNow: () => void;
  readonly handleToggleFavorite: (e: React.MouseEvent) => void;
  readonly handleShare: (e: React.MouseEvent) => void;
}

/**
 * Custom hook for managing facility card actions
 *
 * Handles:
 * - Navigation to facility details and booking
 * - Favorite toggle with animation
 * - Share functionality with fallbacks
 * - Usage tracking and analytics
 *
 * @param props - Facility information for actions
 * @returns Action handlers and state
 */
export const useFacilityActions = (props: UseFacilityActionsProps): UseFacilityActionsReturn => {
  const { t } = useTranslation(['facility']);
  const navigate = useNavigate();
  const { id, name, type, capacity, slug } = props;

  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Use favorites store for favorite state management
  const { isFavorite, toggleFavorite, incrementUsage, updateLastVisited } = useFavoritesStore();

  const isFacilityFavorite = isFavorite(id);

  /**
   * Get facility path for navigation
   * Prefers slug over id for SEO-friendly URLs
   *
   * @returns Facility path segment
   */
  const getFacilityPath = useCallback((): string => {
    return slug || id;
  }, [slug, id]);

  /**
   * Handle view details navigation
   * Tracks usage and last visited time
   */
  const handleViewDetails = useCallback((): void => {
    incrementUsage(id);
    updateLastVisited(id);
    const facilityPath = getFacilityPath();
    navigate(`/facilities/${facilityPath}`);
  }, [id, incrementUsage, updateLastVisited, getFacilityPath, navigate]);

  /**
   * Handle book now navigation
   * Tracks usage and navigates to booking page
   */
  const handleBookNow = useCallback((): void => {
    incrementUsage(id);
    updateLastVisited(id);
    const facilityPath = getFacilityPath();
    navigate(`/facilities/${facilityPath}/book`);
  }, [id, incrementUsage, updateLastVisited, getFacilityPath, navigate]);

  /**
   * Handle favorite toggle with visual feedback
   *
   * Prevents event bubbling to avoid triggering parent click handlers
   * Provides smooth animation feedback for better UX
   *
   * @param e - Mouse event from button click
   */
  const handleToggleFavorite = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsAnimating(true);
    toggleFavorite(id);

    // Reset animation after delay for smooth UX
    setTimeout(() => setIsAnimating(false), 300);
  }, [id, toggleFavorite]);

  /**
   * Handle share functionality with multiple fallbacks
   *
   * Attempts to use native share API if available,
   * otherwise falls back to clipboard copy
   *
   * @param e - Mouse event from button click
   */
  const handleShare = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();

    try {
      const facilityPath = getFacilityPath();
      const shareData: ShareData = {
        title: name,
        text: t('facility:share.check_out', { name, type, capacity }),
        url: window.location.origin + `/facilities/${facilityPath}`
      };

      if (navigator.share) {
        navigator.share(shareData)
          .then(() => {
            toast.success(t('facility:share.facility_shared'));
          })
          .catch((error) => {
            console.error('Share failed:', error);
            // Fallback to clipboard
            navigator.clipboard.writeText(shareData.url);
            toast.success(t('facility:share.link_copied'));
          });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareData.url);
        toast.success(t('facility:share.link_copied'));
      }
    } catch (error) {
      console.error('Share functionality failed:', error);
      toast.error(t('facility:share.share_failed'));
    }
  }, [name, type, capacity, getFacilityPath, t]);

  return {
    isAnimating,
    isFacilityFavorite,
    handleViewDetails,
    handleBookNow,
    handleToggleFavorite,
    handleShare
  };
};
