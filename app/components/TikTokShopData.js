'use client';

import { useState, useEffect } from 'react';

export default function TikTokShopData({ productId, productName }) {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShopData = async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try main scraper first
      const response = await fetch(`/api/tiktok-shop/scrape?productId=${productId}`);
      const data = await response.json();
      
      if (data.success && !data.data.error) {
        setShopData(data.data);
      } else if (data.data?.error === 'TikTok security check - manual verification required') {
        // Try alternative method when security check is detected
        console.log('🔄 Trying alternative method due to security check...');
        const altResponse = await fetch(`/api/tiktok-shop/alternative?productId=${productId}`);
        const altData = await altResponse.json();
        
        if (altData.success) {
          setShopData(altData.data);
        } else {
          // Show security check message with helpful info
          setShopData({
            unitsSold: 'Security Blocked',
            price: null,
            shopName: null,
            productName: 'Security Check Required',
            availability: 'Blocked',
            error: 'TikTok security check - manual verification required',
            suggestion: 'Visit the product page manually for real-time data'
          });
        }
      } else {
        setError(data.error || 'Failed to fetch shop data');
      }
    } catch (err) {
      setError('Network error while fetching shop data');
      console.error('TikTok Shop data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchShopData();
    }
  }, [productId]);

  if (!productId) return null;

  return (
    <div className="tiktok-shop-data">
      <div className="shop-data-header">
        <span className="shop-icon">🛍️</span>
        <span className="shop-label">TikTok Shop Data</span>
        <button 
          onClick={fetchShopData}
          disabled={loading}
          className="refresh-btn"
          title="Refresh shop data"
        >
          {loading ? '⏳' : '🔄'}
        </button>
      </div>
      
      {loading && (
        <div className="shop-loading">
          <span className="loading-spinner">⏳</span>
          <span>Fetching real-time data...</span>
        </div>
      )}
      
      {error && (
        <div className="shop-error">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
      )}
      
      {shopData && !loading && !error && (
        <div className="shop-data-content">
          {shopData.error ? (
            <div className="data-item security-warning">
              <span className="data-label">⚠️ Status:</span>
              <span className="data-value security">{shopData.error}</span>
              {shopData.suggestion && (
                <div className="suggestion">
                  💡 {shopData.suggestion}
                </div>
              )}
            </div>
          ) : (
            <>
              {shopData.unitsSold && (
                <div className="data-item">
                  <span className="data-label">Units Sold:</span>
                  <span className={`data-value sold ${shopData.unitsSold === 'Security Blocked' ? 'blocked' : ''}`}>
                    {shopData.unitsSold}
                  </span>
                </div>
              )}
              
              {shopData.price && (
                <div className="data-item">
                  <span className="data-label">Price:</span>
                  <span className="data-value price">{shopData.price}</span>
                </div>
              )}
              
              {shopData.availability && (
                <div className="data-item">
                  <span className="data-label">Status:</span>
                  <span className={`data-value status ${shopData.availability.toLowerCase()}`}>
                    {shopData.availability}
                  </span>
                </div>
              )}
              
              {shopData.shopName && (
                <div className="data-item">
                  <span className="data-label">Shop:</span>
                  <span className="data-value shop">{shopData.shopName}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      <style jsx>{`
        .tiktok-shop-data {
          margin-top: 8px;
          padding: 8px;
          background: linear-gradient(135deg, #ff0050, #00f2ea);
          border-radius: 8px;
          color: white;
          font-size: 12px;
        }
        
        .shop-data-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        
        .shop-icon {
          font-size: 14px;
        }
        
        .shop-label {
          font-weight: 600;
          flex: 1;
        }
        
        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 4px;
          padding: 2px 6px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }
        
        .refresh-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .shop-loading, .shop-error {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        .error-icon {
          color: #ffcccb;
        }
        
        .shop-data-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .data-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .data-label {
          font-weight: 500;
          opacity: 0.9;
        }
        
        .data-value {
          font-weight: 600;
        }
        
        .data-value.sold {
          color: #00ff88;
        }
        
        .data-value.price {
          color: #ffd700;
        }
        
        .data-value.status.instock {
          color: #00ff88;
        }
        
        .data-value.status.outofstock {
          color: #ff6b6b;
        }
        
        .data-value.shop {
          color: #87ceeb;
        }
        
        .data-value.security {
          color: #ffcccb;
          font-style: italic;
        }
        
        .data-value.blocked {
          color: #ff6b6b;
        }
        
        .security-warning {
          background: rgba(255, 107, 107, 0.1);
          border-radius: 4px;
          padding: 4px;
        }
        
        .suggestion {
          margin-top: 4px;
          font-size: 11px;
          opacity: 0.8;
          font-style: italic;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}