'use client';

import { useState, useEffect } from 'react';

const numberFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
});

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('uk');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        region: region,
      });

      const response = await fetch(`/api/products/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.results || []);
    } catch (error) {
      console.error("Failed to search products", error);
      setError("Unable to search products right now. Please try again shortly.");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      performSearch(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, region]);

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🛍️ Product Finder</h1>
        <p>Search for trending TikTok products and see what's selling</p>
        <nav className="nav">
          <a href="/" className="nav-link">🎬 Trending Videos</a>
          <a href="/search" className="nav-link nav-link--active">🔍 Find Products</a>
          <a href="/products" className="nav-link">🛍️ Top Products</a>
        </nav>
      </header>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Start typing to search (e.g., socks, shoes, makeup...)"
              className="search-input"
            />
            {isLoading && (
              <span className="search-loading-indicator">🔍 Searching...</span>
            )}
          </div>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="region-select"
          >
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
          </select>
        </div>
      </form>

      {isLoading && (
        <div className="status status--info">
          Searching for products...
        </div>
      )}

      {error && (
        <div className="status status--error">
          {error}
        </div>
      )}

      {products.length === 0 && !isLoading && !error && hasSearched && (
        <div className="status status--empty">
          No products found for "{searchQuery}".
        </div>
      )}

      {products.length > 0 && (
        <div className="results-header">
          <h2>Search Results for "{searchQuery}"</h2>
          <p>{products.length} product{products.length !== 1 ? 's' : ''} found</p>
        </div>
      )}

      <div className="products-grid">
        {products.map((product, index) => {
          const trendingScore = product.units_sold 
            ? Math.min(100, Math.round((product.units_sold / 1000) + 50))
            : 50;
          
          return (
            <div 
              key={product.product_id || index} 
              className="product-card"
              onClick={() => window.location.href = `/?productID=${product.product_id}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-card__image">
                <img
                  src={product.img_url || "https://placehold.co/300x300?text=Product"}
                  alt={product.name ? `Product image for ${product.name}` : "Product image"}
                  className="product-image"
                />
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

                {product.shop_name && (
                  <div className="product-shop-info">
                    <span className="shop-icon">🏪</span>
                    <span className="shop-name">{product.shop_name}</span>
                  </div>
                )}
                
                {product.categories && product.categories.length > 0 && (
                  <div className="product-categories">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
