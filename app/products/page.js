'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import ModernHeader from '../components/ModernHeader';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import ShareButton from '../components/ShareButton';
import { FavoriteButton } from '../components/Favorites';
import { useCompactView } from '../components/CompactView';
import { CompactProductCard } from '../components/CompactView';
import { useAutoRefresh, AutoRefreshToggle } from '../components/AutoRefresh';

const numberFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
});

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function ProductsPage() {
  const { isCompact } = useCompactView();
  const { triggerRefresh } = useAutoRefresh();
  
  const [state, setState] = useState({
    region: "uk",
    days: 1,
    limit: 12,
    page: 0,
    hasMore: true,
    isLoading: false,
    error: null,
    shopId: null,
  });

  const [products, setProducts] = useState([]);
  const [storeQuery, setStoreQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [shopResults, setShopResults] = useState([]);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [isSearchingShops, setIsSearchingShops] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  const fetchProducts = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        region: state.region,
        days: state.days.toString(),
        limit: state.limit.toString(),
        offset: state.page.toString(),
      });

      // Add shopId if a shop is selected
      if (state.shopId) {
        params.set('shopId', state.shopId);
      }

      const response = await fetch(`/api/products/top?${params}`);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      const { results = [], has_more = false } = data;

      setProducts(results);
      setState(prev => ({
        ...prev,
        hasMore: Boolean(has_more),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch products", error);
      setState(prev => ({
        ...prev,
        error: "Unable to load products. Please try again.",
        hasMore: false,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [state.region, state.days, state.limit, state.page, state.shopId]);

  // Search shops as user types
  useEffect(() => {
    const searchShops = async () => {
      if (storeQuery.length < 2) {
        setShopResults([]);
        setShowShopDropdown(false);
        return;
      }

      setIsSearchingShops(true);
      try {
        const params = new URLSearchParams({
          query: storeQuery,
          region: state.region,
        });

        const response = await fetch(`/api/shops/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setShopResults(data.results || []);
          setShowShopDropdown(true);
        }
      } catch (error) {
        console.error("Error searching shops:", error);
      } finally {
        setIsSearchingShops(false);
      }
    };

    const debounce = setTimeout(() => {
      searchShops();
    }, 300);

    return () => clearTimeout(debounce);
  }, [storeQuery, state.region]);

  const handleFilterChange = (name, value) => {
    setState(prev => ({
      ...prev,
      [name]: name === "days" || name === "limit" ? Number(value) : value,
      page: 0,
    }));
  };

  const handlePageChange = (direction) => {
    if (direction === 'prev' && state.page > 0) {
      setState(prev => ({ ...prev, page: prev.page - 1 }));
    } else if (direction === 'next' && state.hasMore) {
      setState(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setStoreQuery(shop.shop_name);
    setShowShopDropdown(false);
    setState(prev => ({
      ...prev,
      shopId: shop.shop_id,
      page: 0, // Reset to first page
    }));
  };

  const handleClearShop = () => {
    setSelectedShop(null);
    setStoreQuery('');
    setShopResults([]);
    setState(prev => ({
      ...prev,
      shopId: null,
      page: 0,
    }));
  };

  // Filter products by category only (shop filtering is done via API)
  const filteredProducts = products.filter(product => {
    const matchesCategory = !categoryQuery || 
      (product.categories && product.categories.some(cat => 
        cat.toLowerCase().includes(categoryQuery.toLowerCase())
      ));
    
    return matchesCategory;
  });

  return (
    <div className="container">
      <ModernHeader />

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="daysSelect">Top viral products from:</label>
          <select
            id="daysSelect"
            value={state.days}
            onChange={(e) => handleFilterChange('days', e.target.value)}
            disabled={state.isLoading}
          >
            <option value="1">Today</option>
            <option value="3">Last 3 days</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>

        <div className="filter-group shop-search-group">
          <label htmlFor="storeSearch">Filter by store:</label>
          <div className="shop-search-wrapper">
            <input
              id="storeSearch"
              type="text"
              value={storeQuery}
              onChange={(e) => setStoreQuery(e.target.value)}
              onFocus={() => storeQuery.length >= 2 && setShowShopDropdown(true)}
              placeholder="Search for stores..."
              className="filter-input"
            />
            {isSearchingShops && (
              <span className="shop-search-loading">🔍</span>
            )}
            {selectedShop && (
              <button 
                onClick={handleClearShop}
                className="clear-shop-button"
                type="button"
              >
                ✕
              </button>
            )}
            {showShopDropdown && shopResults.length > 0 && (
              <div className="shop-dropdown">
                {shopResults.map((shop) => (
                  <div
                    key={shop.shop_id}
                    className="shop-dropdown-item"
                    onClick={() => handleShopSelect(shop)}
                  >
                    <div className="shop-dropdown-info">
                      <div className="shop-dropdown-name">{shop.shop_name}</div>
                      {shop.product_count && (
                        <div className="shop-dropdown-meta">
                          {shop.product_count} products
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="categorySearch">Filter by category:</label>
          <input
            id="categorySearch"
            type="text"
            value={categoryQuery}
            onChange={(e) => setCategoryQuery(e.target.value)}
            placeholder="Search categories..."
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="regionSelect">Region:</label>
          <select
            id="regionSelect"
            value={state.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            disabled={state.isLoading}
          >
            <option value="uk">United Kingdom</option>
            <option value="us">United States</option>
          </select>
        </div>

        <button
          onClick={fetchProducts}
          disabled={state.isLoading}
          className="refresh-button"
        >
          {state.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {state.error && (
        <div className="status status--error">
          {state.error}
        </div>
      )}

      {!state.isLoading && filteredProducts.length === 0 && products.length > 0 && (
        <div className="status status--info">
          No products match your search criteria. Try adjusting your filters.
        </div>
      )}

      <div className="products-grid">
        {state.isLoading ? (
          // Show skeletons while loading
          Array.from({ length: state.limit }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          filteredProducts.map((product, index) => {
          const trendingScore = product.units_sold 
            ? Math.min(100, Math.round((product.units_sold / 1000) + 50))
            : 50;
          
          return isCompact ? (
            <CompactProductCard
              key={product.product_id || index}
              product={product}
              rank={state.page * state.limit + products.indexOf(product) + 1}
              numberFormat={numberFormat}
              currencyFormat={currencyFormat}
            />
          ) : (
            <div 
              key={product.product_id || index} 
              className="product-card"
              onClick={() => window.location.href = `/?productID=${product.product_id}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-card__image">
                <img
                  src={product.product_img_url || "https://placehold.co/300x300?text=Product"}
                  alt={product.name || "Product image"}
                  className="product-image"
                  style={{ pointerEvents: 'none' }}
                />
                <div className="rank-badge">
                  <span className="rank-number">#{state.page * state.limit + products.indexOf(product) + 1}</span>
                </div>
                <div className="trending-badge">
                  <span className="trending-badge__icon">🔥</span>
                  <span className="trending-badge__score">{trendingScore}</span>
                </div>
              </div>
              
              <div className="product-card__content">
                <h3 className="product-title">
                  {product.name || "Product name unavailable"}
                </h3>
                
                <div className="product-price">
                  💰 {product.price_display || "Price unavailable"}
                </div>
                
                <div className="product-stats-grid">
                  {product.units_sold && (
                    <div className="product-stat-box">
                      <span className="product-stat-icon">📦</span>
                      <div className="product-stat-content">
                        <span className="product-stat-value">{numberFormat.format(product.units_sold)}</span>
                        <span className="product-stat-label">Sold</span>
                      </div>
                    </div>
                  )}
                  {product.gmv && (
                    <div className="product-stat-box">
                      <span className="product-stat-icon">💵</span>
                      <div className="product-stat-content">
                        <span className="product-stat-value">{currencyFormat.format(parseFloat(product.gmv))}</span>
                        <span className="product-stat-label">Revenue</span>
                      </div>
                    </div>
                  )}
                </div>

                {product.shop && product.shop.shop_name && (
                  <div className="product-shop-info">
                    <span className="shop-icon">🏪</span>
                    <span className="shop-name">{product.shop.shop_name}</span>
                  </div>
                )}

                {product.categories && product.categories.length > 0 && (
                  <div className="category-tags">
                    {product.categories.slice(0, 3).map((category, idx) => (
                      <span key={idx} className="category-tag">
                        #{category}
                      </span>
                    ))}
                  </div>
                )}

                <div className="product-cta">
                  <span className="cta-text">View Trending Videos</span>
                  <span className="cta-arrow">→</span>
                </div>

                {/* Actions */}
                <div className="product-card__actions">
                  <FavoriteButton 
                    item={product} 
                    type="product" 
                    size="small" 
                  />
                  <ShareButton
                    url={`/?productID=${product.product_id}`}
                    title={`${product.name || 'Top Viral Product'} - TikTok Viral Trends`}
                    description={`Check out this top viral product: ${product.name || 'Amazing product'}! ${product.price_display ? `Only ${product.price_display}` : ''} - Discover more trending products!`}
                    hashtags={['TikTokViral', 'TopProduct', 'ViralShopping']}
                    type="product"
                  />
                </div>
              </div>
            </div>
          );
          })
        )}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange('prev')}
          disabled={state.page <= 0 || state.isLoading}
          className="page-button"
        >
          Previous
        </button>

        <span className="page-indicator">
          Page {state.page + 1}
        </span>

        <button
          onClick={() => handlePageChange('next')}
          disabled={!state.hasMore || state.isLoading}
          className="page-button"
        >
          Next
        </button>
      </div>

      <KeyboardShortcuts
        onPrevPage={() => handlePageChange('prev')}
        onNextPage={() => handlePageChange('next')}
        canGoPrev={state.page > 0 && !state.isLoading}
        canGoNext={state.hasMore && !state.isLoading}
      />

      <AutoRefreshToggle onRefresh={fetchProducts} />
    </div>
  );
}

