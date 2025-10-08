export default function VideoCardSkeleton() {
  return (
    <div className="video-card skeleton-card">
      <div className="video-card__header">
        <div className="skeleton skeleton-video-thumbnail"></div>
      </div>

      <div className="video-card__content">
        <div className="skeleton skeleton-badges">
          <div className="skeleton skeleton-badge"></div>
        </div>

        <div className="video-card__description">
          <div className="skeleton skeleton-text skeleton-text--title"></div>
          <div className="skeleton skeleton-text skeleton-text--subtitle"></div>
        </div>

        <div className="video-card__author">
          <div className="skeleton skeleton-avatar"></div>
          <div className="skeleton skeleton-text skeleton-text--small"></div>
        </div>

        <div className="video-card__product">
          <div className="skeleton skeleton-product-image"></div>
          <div className="skeleton-product-info">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text skeleton-text--small"></div>
          </div>
        </div>

        <div className="video-card__stats">
          <div className="skeleton skeleton-stat">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton skeleton-text skeleton-text--tiny"></div>
          </div>
          <div className="skeleton skeleton-stat">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton skeleton-text skeleton-text--tiny"></div>
          </div>
          <div className="skeleton skeleton-stat">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton skeleton-text skeleton-text--tiny"></div>
          </div>
          <div className="skeleton skeleton-stat">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton skeleton-text skeleton-text--tiny"></div>
          </div>
        </div>

        <div className="video-card__actions">
          <div className="skeleton skeleton-button"></div>
          <div className="skeleton skeleton-button"></div>
        </div>
      </div>
    </div>
  );
}

