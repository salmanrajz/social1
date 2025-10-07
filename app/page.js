'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import VideoCard from './components/VideoCard';

const numberFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
});

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Home() {
  const searchParams = useSearchParams();
  const productID = searchParams.get('productID');
  
  const [state, setState] = useState({
    region: "uk",
    days: 1,
    limit: 12,
    page: 0, // Changed from offset to page (0-indexed)
    contentType: "all", // all, ads, non-ads
    hasMore: true,
    isLoading: false,
    error: null,
    noResults: false,
  });

  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null, noResults: false }));

    try {
      const params = new URLSearchParams({
        region: state.region,
        days: state.days.toString(),
        limit: state.limit.toString(),
        offset: state.page.toString(), // Use page number as offset
      });

      // Add productID if present
      if (productID) {
        params.set('productID', productID);
      }

      const response = await fetch(`/api/videos?${params}`);
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      const { results = [], has_more = false } = data;

      // Filter videos based on content type
      let filteredResults = results;
      if (state.contentType === 'ads') {
        filteredResults = results.filter(video => video.is_ad === true);
      } else if (state.contentType === 'non-ads') {
        filteredResults = results.filter(video => video.is_ad === false);
      }

      setVideos(filteredResults);
      setState(prev => ({
        ...prev,
        hasMore: Boolean(has_more),
        noResults: filteredResults.length === 0,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch videos", error);
      setState(prev => ({
        ...prev,
        error: "Unable to load videos right now. Please try again shortly.",
        hasMore: false,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [state.region, state.days, state.limit, state.page, productID]);

  const handleFilterChange = (name, value) => {
    setState(prev => ({
      ...prev,
      [name]: name === "days" || name === "limit" ? Number(value) : value,
      page: 0, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (direction) => {
    if (direction === 'prev' && state.page > 0) {
      setState(prev => ({
        ...prev,
        page: Math.max(0, prev.page - 1)
      }));
    } else if (direction === 'next' && state.hasMore) {
      setState(prev => ({
        ...prev,
        page: prev.page + 1
      }));
    }
  };

  const currentPage = state.page + 1; // Display as 1-indexed

  return (
    <div className="container">
      <header className="header">
        <h1>🔥 TikTok Viral Trends</h1>
        {productID ? (
          <p>Videos featuring this product</p>
        ) : (
          <p>Discover what's trending and going viral on TikTok</p>
        )}
        <nav className="nav">
          <a href="/" className="nav-link nav-link--active">🎬 Trending Videos</a>
          <a href="/search" className="nav-link">🔍 Find Products</a>
        </nav>
      </header>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="daysSelect">Most viral content from:</label>
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

        <div className="filter-group">
          <label htmlFor="productFilter">Filter by product:</label>
          {productID ? (
            <div className="product-filter-display">
              <span>Product ID: {productID}</span>
            </div>
          ) : (
            <a href="/search" className="product-search-link">
              Select a product...
            </a>
          )}
        </div>

        <div className="filter-group">
          <label htmlFor="contentTypeSelect">Content type:</label>
          <select
            id="contentTypeSelect"
            value={state.contentType}
            onChange={(e) => handleFilterChange('contentType', e.target.value)}
            disabled={state.isLoading}
          >
            <option value="all">All videos</option>
            <option value="ads">Ads only</option>
            <option value="non-ads">Non-ads only</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="regionSelect">Region:</label>
          <select
            id="regionSelect"
            value={state.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            disabled={state.isLoading}
          >
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="limitSelect">Results per page:</label>
          <select
            id="limitSelect"
            value={state.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
            disabled={state.isLoading}
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </div>

        <button
          onClick={fetchVideos}
          disabled={state.isLoading}
          className="refresh-button"
        >
          {state.isLoading ? 'Loading...' : 'Refresh'}
        </button>
        
        {productID && (
          <button
            onClick={() => window.location.href = '/'}
            className="clear-filter-button"
          >
            Clear Product Filter
          </button>
        )}
      </div>

      {state.isLoading && (
        <div className="status status--info">
          Loading top videos…
        </div>
      )}

      {state.error && (
        <div className="status status--error">
          {state.error}
        </div>
      )}

      {state.noResults && !state.isLoading && (
        <div className="status status--empty">
          No videos found for the selected filters.
        </div>
      )}

      <div className="video-grid">
        {videos.map((video, index) => (
          <VideoCard
            key={`${video.video_url || video.handle || index}`}
            video={video}
            rank={state.page * state.limit + index + 1}
            numberFormat={numberFormat}
            currencyFormat={currencyFormat}
          />
        ))}
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
          Page {currentPage}
        </span>
        
        <button
          onClick={() => handlePageChange('next')}
          disabled={!state.hasMore || state.isLoading}
          className="page-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
