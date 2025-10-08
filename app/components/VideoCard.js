'use client';

import ShareButton from './ShareButton';
import { FavoriteButton } from './Favorites';
import { useAnalytics } from '../hooks/useAnalytics';

export default function VideoCard({ video, rank, numberFormat, currencyFormat }) {
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
  
  const { trackVideoClick } = useAnalytics();

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Timestamp unavailable";

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
        return diffMinutes <= 1 ? "just now" : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    }

    if (diffDays < 7) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    }

    return postedDate.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isNew = (timestamp) => {
    if (!timestamp) return false;

    const isoLike = `${timestamp.replace(" ", "T")}Z`;
    const postedDate = new Date(isoLike);
    if (Number.isNaN(postedDate.getTime())) {
      return false;
    }

    const now = new Date();
    const diffMs = now - postedDate;
    const diffHours = diffMs / (1000 * 60 * 60);

    // Consider "new" if posted within last 24 hours
    return diffHours < 24;
  };

  const formatStat = (value, formatter, fallback = "0") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return fallback;
    }

    return formatter ? formatter.format(numeric) : numberFormat.format(numeric);
  };

  // Calculate viral score
  const calculateViralScore = () => {
    const viewScore = (views || 0) / 1000;
    const engagementScore = ((likes || 0) + (comments || 0)) / 100;
    const score = Math.min(100, Math.round((viewScore + engagementScore) / 20));
    return score;
  };

  const viralScore = calculateViralScore();

  const handleVideoClick = () => {
    trackVideoClick(video_url || handle, {
      video_username,
      handle,
      is_ad,
      rank,
      views,
      likes,
      comments,
    });
  };

  return (
    <div className="video-card" onClick={handleVideoClick}>
      <div className="video-card__header">
        <img
          src={thumbnail || "https://placehold.co/640x360?text=Video+Preview"}
          alt={`Preview image for ${video_username || handle || "Unknown creator"}`}
          className="video-card__thumbnail"
        />
        {rank && (
          <div className="rank-badge">
            <span className="rank-number">#{rank}</span>
          </div>
        )}
        <div className="viral-score-badge">
          <span className="viral-score-number">{viralScore}</span>
          <span className="viral-score-label">Viral Score</span>
        </div>
        {is_ad && <div className="ad-badge">Sponsored</div>}
        {isNew(time_posted) && <div className="new-badge">🆕 NEW</div>}
        <div className="video-card__overlay">
          <a
            href={video_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card__link"
            aria-label={`Open TikTok video by ${video_username || handle || "Unknown creator"}`}
          >
            🎬 Watch on TikTok
          </a>
        </div>
      </div>

      <div className="video-card__content">
        <h3 className="video-card__title">
          {video_username || handle || "Unknown creator"}
        </h3>
        <p className="video-card__creator">@{handle || "unknown"}</p>
        <p className="video-card__description">
          {description || "No description provided."}
        </p>
        <p className="video-card__timestamp">
          {formatRelativeTime(time_posted)}
        </p>

        <div className="video-card__stats">
          <div className="stat" data-stat="views">
            <span className="stat__icon">👁️</span>
            <div className="stat__content">
              <span className="stat__value">
                {formatStat(views)}
              </span>
              <span className="stat__label">Views</span>
            </div>
          </div>
          <div className="stat" data-stat="likes">
            <span className="stat__icon">❤️</span>
            <div className="stat__content">
              <span className="stat__value">
                {formatStat(likes)}
              </span>
              <span className="stat__label">Likes</span>
            </div>
          </div>
          <div className="stat" data-stat="comments">
            <span className="stat__icon">💬</span>
            <div className="stat__content">
              <span className="stat__value">
                {formatStat(comments)}
              </span>
              <span className="stat__label">Comments</span>
            </div>
          </div>
          <div className="stat" data-stat="gmv">
            <span className="stat__icon">💰</span>
            <div className="stat__content">
              <span className="stat__value">
                {formatStat(gmv, currencyFormat, "—")}
              </span>
              <span className="stat__label">Revenue</span>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="engagement-bar">
          <div className="engagement-bar__label">
            <span>🔥 Engagement</span>
            <span>{likes && views ? ((likes / views) * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="engagement-bar__track">
            <div 
              className="engagement-bar__fill"
              style={{ width: `${Math.min(100, likes && views ? (likes / views) * 100 * 10 : 0)}%` }}
            ></div>
          </div>
        </div>

        {product_data && (
          <div className="product" data-product>
            <img
              src={product_data.img_url || "https://placehold.co/120x120?text=Product"}
              alt={product_data.name ? `Product image for ${product_data.name}` : "Product image"}
              className="product__image"
            />
            <div className="product__info">
              <h4 className="product__title">
                {product_data.name || "Product information unavailable"}
              </h4>
              <p className="product__price">
                {product_data.price_display || ""}
              </p>
              <p className="product__meta">
                {[
                  product_data.shop_name,
                  typeof product_data.units_sold === "number" 
                    ? `${numberFormat.format(product_data.units_sold)} sold`
                    : null
                ].filter(Boolean).join(" • ")}
              </p>
              {product_data.product_id && (
                <a 
                  href={`https://shop.tiktok.com/view/product/${product_data.product_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="product__shop-link"
                >
                  🛒 View in TikTok Shop
                </a>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="video-card__actions">
          <FavoriteButton 
            item={video} 
            type="video" 
            size="small" 
          />
          <ShareButton
            url={`/?productID=${product_data?.product_id || 'video'}`}
            title={`${video_username || handle || 'Unknown creator'} - Viral TikTok Video`}
            description={`Check out this viral TikTok video by ${video_username || handle || 'Unknown creator'}! ${description ? description.substring(0, 100) + '...' : 'Amazing content!'}`}
            hashtags={['TikTokViral', 'TrendingVideo', 'ViralContent']}
            type="video"
          />
        </div>
      </div>
    </div>
  );
}

