'use client';

import { useState, useEffect, createContext, useContext } from 'react';

// Compact View Context
const CompactViewContext = createContext();

// Compact View Provider
export const CompactViewProvider = ({ children }) => {
  const [isCompact, setIsCompact] = useState(false);

  // Load compact view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('compactView');
    if (saved) {
      try {
        setIsCompact(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading compact view preference:', error);
      }
    }
  }, []);

  // Save compact view preference to localStorage
  const toggleCompact = () => {
    const newValue = !isCompact;
    setIsCompact(newValue);
    localStorage.setItem('compactView', JSON.stringify(newValue));
  };

  return (
    <CompactViewContext.Provider value={{
      isCompact,
      toggleCompact
    }}>
      {children}
    </CompactViewContext.Provider>
  );
};

// Hook to use compact view
export const useCompactView = () => {
  const context = useContext(CompactViewContext);
  if (!context) {
    throw new Error('useCompactView must be used within a CompactViewProvider');
  }
  return context;
};

// Compact View Toggle Component
export const CompactViewToggle = () => {
  const { isCompact, toggleCompact } = useCompactView();

  return (
    <button
      onClick={toggleCompact}
      className={`compact-view-toggle ${isCompact ? 'compact-view-toggle--active' : ''}`}
      title={isCompact ? 'Switch to normal view' : 'Switch to compact view'}
      aria-label={isCompact ? 'Switch to normal view' : 'Switch to compact view'}
    >
      <span className="compact-view-icon">
        {isCompact ? '📋' : '📄'}
      </span>
      <span className="compact-view-text">
        {isCompact ? 'Normal' : 'Compact'}
      </span>
    </button>
  );
};

// Compact Video Card Component
export const CompactVideoCard = ({ video, rank, numberFormat, currencyFormat }) => {
  const {
    video_username,
    handle,
    description,
    video_url,
    views,
    likes,
    comments,
    gmv,
    thumbnail,
    time_posted,
    product_data,
    is_ad,
  } = video;

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown";

    const isoLike = `${timestamp.replace(" ", "T")}Z`;
    const postedDate = new Date(isoLike);
    if (Number.isNaN(postedDate.getTime())) {
      return timestamp;
    }

    const now = new Date();
    const diffMs = now - postedDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours <= 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? "now" : `${diffMinutes}m`;
      }
      return diffHours === 1 ? "1h" : `${diffHours}h`;
    }

    if (diffDays < 7) {
      return diffDays === 1 ? "1d" : `${diffDays}d`;
    }

    return postedDate.toLocaleDateString();
  };

  const formatStat = (value, formatter, fallback = "0") => {
    if (value === null || value === undefined) {
      return fallback;
    }
    return formatter ? formatter.format(value) : value.toLocaleString();
  };

  return (
    <div className="compact-video-card">
      <div className="compact-video-card__thumbnail">
        <img
          src={thumbnail || "https://placehold.co/120x68?text=Video"}
          alt={`Preview for ${video_username || handle || "Unknown"}`}
          className="compact-thumbnail"
        />
        {rank && (
          <div className="compact-rank-badge">#{rank}</div>
        )}
        {is_ad && <div className="compact-ad-badge">Ad</div>}
      </div>

      <div className="compact-video-card__content">
        <div className="compact-video-card__header">
          <h4 className="compact-video-card__title">
            {video_username || handle || "Unknown"}
          </h4>
          <span className="compact-video-card__time">
            {formatRelativeTime(time_posted)}
          </span>
        </div>

        <p className="compact-video-card__description">
          {description ? description.substring(0, 80) + '...' : 'No description'}
        </p>

        <div className="compact-video-card__stats">
          <span className="compact-stat">👁️ {formatStat(views, numberFormat)}</span>
          <span className="compact-stat">❤️ {formatStat(likes, numberFormat)}</span>
          <span className="compact-stat">💬 {formatStat(comments, numberFormat)}</span>
          {gmv && <span className="compact-stat">💰 {formatStat(gmv, currencyFormat)}</span>}
        </div>

        {product_data && (
          <div className="compact-product-info">
            <span className="compact-product-name">
              {product_data.name ? product_data.name.substring(0, 30) + '...' : 'Product'}
            </span>
            {product_data.price_display && (
              <span className="compact-product-price">{product_data.price_display}</span>
            )}
          </div>
        )}
      </div>

      <div className="compact-video-card__actions">
        <a
          href={video_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="compact-watch-button"
          title="Watch on TikTok"
        >
          ▶️
        </a>
      </div>
    </div>
  );
};

// Compact Product Card Component
export const CompactProductCard = ({ product, rank, numberFormat, currencyFormat }) => {
  const trendingScore = product.gmv 
    ? Math.min(100, Math.round((parseFloat(product.gmv) / 10000) + 50))
    : 50;

  return (
    <div className="compact-product-card">
      <div className="compact-product-card__image">
        <img
          src={product.product_img_url || product.img_url || "https://placehold.co/80x80?text=Product"}
          alt={product.name || "Product"}
          className="compact-product-image"
        />
        {rank && (
          <div className="compact-rank-badge">#{rank}</div>
        )}
        <div className="compact-trending-badge">
          🔥 {trendingScore}
        </div>
      </div>

      <div className="compact-product-card__content">
        <h4 className="compact-product-card__title">
          {product.name ? product.name.substring(0, 40) + '...' : 'Unknown Product'}
        </h4>

        <div className="compact-product-card__price">
          {product.price_display || 'No price'}
        </div>

        <div className="compact-product-card__stats">
          {product.gmv && (
            <span className="compact-stat">💵 {currencyFormat.format(parseFloat(product.gmv))}</span>
          )}
        </div>

        {product.shop && product.shop.shop_name && (
          <div className="compact-shop-info">
            🏪 {product.shop.shop_name.substring(0, 20)}...
          </div>
        )}
      </div>

      <div className="compact-product-card__actions">
        <button
          onClick={() => window.location.href = `/?productID=${product.product_id}`}
          className="compact-view-button"
          title="View Videos"
        >
          👁️
        </button>
      </div>
    </div>
  );
};
