'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useAnalytics() {
  const { data: session } = useSession();

  const trackEvent = useCallback(async (event, data = {}) => {
    if (!session?.user?.id) return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          event,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [session?.user?.id]);

  const trackPageView = useCallback((page, data = {}) => {
    trackEvent('page_view', { page, ...data });
  }, [trackEvent]);

  const trackVideoClick = useCallback((videoId, videoData = {}) => {
    trackEvent('video_click', { videoId, ...videoData });
  }, [trackEvent]);

  const trackProductClick = useCallback((productId, productData = {}) => {
    trackEvent('product_click', { productId, ...productData });
  }, [trackEvent]);

  const trackSearch = useCallback((query, results = 0) => {
    trackEvent('search', { query, results });
  }, [trackEvent]);

  const trackFavorite = useCallback((itemId, itemType, action) => {
    trackEvent('favorite', { itemId, itemType, action });
  }, [trackEvent]);

  const trackShare = useCallback((platform, itemId, itemType) => {
    trackEvent('share', { platform, itemId, itemType });
  }, [trackEvent]);

  const trackFilter = useCallback((filterType, filterValue) => {
    trackEvent('filter', { filterType, filterValue });
  }, [trackEvent]);

  const trackPagination = useCallback((page, limit) => {
    trackEvent('pagination', { page, limit });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackVideoClick,
    trackProductClick,
    trackSearch,
    trackFavorite,
    trackShare,
    trackFilter,
    trackPagination,
  };
}
