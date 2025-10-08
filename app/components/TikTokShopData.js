'use client';

import { useState } from 'react';
import { useTikTokShop } from '../hooks/useTikTokShop';

export default function TikTokShopData({ productId, productName }) {
  const { shopData, loading, error, refetch } = useTikTokShop(productId);
  const [showDetails, setShowDetails] = useState(false);

  if (!productId) return null;

  return (
    <div className="tiktok-shop-data">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="shop-data-toggle"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading-spinner">⏳</span>
            Loading real-time data...
          </>
        ) : (
          <>
            <span className="shop-icon">🛍️</span>
            {showDetails ? 'Hide' : 'Show'} TikTok Shop Data
          </>
        )}
      </button>

      {showDetails && (
        <div className="shop-data-details">
          {error ? (
            <div className="shop-data-error">
              <p>⚠️ Unable to fetch real-time data</p>
              <p className="error-message">{error}</p>
              <button onClick={refetch} className="retry-button">
                🔄 Retry
              </button>
            </div>
          ) : shopData ? (
            <div className="shop-data-content">
              <h4>📊 TikTok Shop Data</h4>
              
              {shopData.fallback && (
                <div className="data-warning">
                  <p>⚠️ Limited data available - TikTok Shop requires JavaScript for full information</p>
                </div>
              )}
              
              {shopData.productName && (
                <div className="data-item">
                  <span className="data-label">Product:</span>
                  <span className="data-value">{shopData.productName}</span>
                </div>
              )}
              
              {shopData.unitsSold && (
                <div className="data-item">
                  <span className="data-label">Units Sold:</span>
                  <span className="data-value">{shopData.unitsSold.toLocaleString()}</span>
                </div>
              )}
              
              {shopData.price && (
                <div className="data-item">
                  <span className="data-label">Current Price:</span>
                  <span className="data-value">${shopData.price}</span>
                </div>
              )}
              
              {shopData.shopName && (
                <div className="data-item">
                  <span className="data-label">Shop:</span>
                  <span className="data-value">{shopData.shopName}</span>
                </div>
              )}
              
              {shopData.availability && (
                <div className="data-item">
                  <span className="data-label">Availability:</span>
                  <span className={`data-value ${shopData.availability === 'InStock' ? 'in-stock' : 'out-of-stock'}`}>
                    {shopData.availability === 'InStock' ? '✅ In Stock' : '❌ Out of Stock'}
                  </span>
                </div>
              )}

              {shopData.description && (
                <div className="data-item">
                  <span className="data-label">Description:</span>
                  <span className="data-value">{shopData.description.substring(0, 100)}...</span>
                </div>
              )}

              {shopData.debug && (
                <details className="debug-info">
                  <summary>🔍 Debug Information</summary>
                  <pre>{JSON.stringify(shopData.debug, null, 2)}</pre>
                </details>
              )}

              <div className="shop-actions">
                <a
                  href={`https://shop.tiktok.com/view/product/${productId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shop-link"
                >
                  🛒 View on TikTok Shop
                </a>
                <button onClick={refetch} className="refresh-button">
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          ) : (
            <div className="shop-data-loading">
              <p>Loading real-time data from TikTok Shop...</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .tiktok-shop-data {
          margin-top: 0.5rem;
        }

        .shop-data-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ff0050, #ff4081);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .shop-data-toggle:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 0, 80, 0.3);
        }

        .shop-data-toggle:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .shop-data-details {
          margin-top: 0.75rem;
          padding: 1rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .shop-data-content h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .data-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .data-item:last-child {
          border-bottom: none;
        }

        .data-label {
          font-weight: 500;
          color: var(--text-secondary);
        }

        .data-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .data-value.in-stock {
          color: #10b981;
        }

        .data-value.out-of-stock {
          color: #ef4444;
        }

        .shop-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .shop-link, .refresh-button {
          flex: 1;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s ease;
        }

        .shop-link {
          background: #ff0050;
          color: white;
        }

        .shop-link:hover {
          background: #e6004a;
          transform: translateY(-1px);
        }

        .refresh-button {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .refresh-button:hover {
          background: var(--bg-hover);
        }

        .shop-data-error {
          text-align: center;
          color: var(--text-secondary);
        }

        .error-message {
          font-size: 0.875rem;
          margin: 0.5rem 0;
        }

        .retry-button {
          padding: 0.5rem 1rem;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .shop-data-loading {
          text-align: center;
          color: var(--text-secondary);
        }

        .data-warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }

        .data-warning p {
          margin: 0;
          color: #92400e;
          font-size: 0.875rem;
        }

        .debug-info {
          margin-top: 1rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
        }

        .debug-info summary {
          cursor: pointer;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .debug-info pre {
          margin: 0.5rem 0 0 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}
