'use client';

import { useState, useEffect } from 'react';

export function useTikTokShop(productId) {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShopData = async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      // Try the main API first
      let response = await fetch(`/api/tiktok-shop?productId=${encodeURIComponent(productId)}`);
      let data = await response.json();

      // If main API doesn't have useful data, try alternative
      if (data.success && (!data.data.unitsSold && !data.data.price && !data.data.shopName)) {
        console.log('Main API returned empty data, trying alternative...');
        response = await fetch(`/api/tiktok-shop-alternative?productId=${encodeURIComponent(productId)}`);
        data = await response.json();
      }

      if (data.success) {
        setShopData(data.data);
      } else {
        setError(data.error || 'Failed to fetch shop data');
      }
    } catch (err) {
      setError('Network error while fetching shop data');
      console.error('TikTok shop fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchShopData();
    }
  }, [productId]);

  return {
    shopData,
    loading,
    error,
    refetch: fetchShopData
  };
}
