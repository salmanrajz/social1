export default function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-card">
      <div className="product-card__image">
        <div className="skeleton skeleton-product-thumbnail"></div>
      </div>

      <div className="product-card__content">
        <div className="skeleton skeleton-text skeleton-text--title"></div>
        <div className="skeleton skeleton-text skeleton-text--subtitle"></div>

        <div className="skeleton skeleton-price"></div>

        <div className="product-stats-grid">
          <div className="product-stat-box">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton-stat-content">
              <div className="skeleton skeleton-text skeleton-text--tiny"></div>
              <div className="skeleton skeleton-text skeleton-text--tiny"></div>
            </div>
          </div>
          <div className="product-stat-box">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton-stat-content">
              <div className="skeleton skeleton-text skeleton-text--tiny"></div>
              <div className="skeleton skeleton-text skeleton-text--tiny"></div>
            </div>
          </div>
        </div>

        <div className="product-shop-info">
          <div className="skeleton skeleton-icon"></div>
          <div className="skeleton skeleton-text skeleton-text--small"></div>
        </div>

        <div className="category-tags">
          <div className="skeleton skeleton-tag"></div>
          <div className="skeleton skeleton-tag"></div>
          <div className="skeleton skeleton-tag"></div>
        </div>
      </div>
    </div>
  );
}

