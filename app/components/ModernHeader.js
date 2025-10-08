'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import { CompactViewToggle } from './CompactView';
import { AutoRefreshToggle } from './AutoRefresh';
import { FavoritesList } from './Favorites';

export default function ModernHeader() {
  const [showFavorites, setShowFavorites] = useState(false);
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const productID = searchParams.get('productID');
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  let title = "🔥 TikTok Viral Trends";
  let description = "Discover what's trending and going viral on TikTok";

  if (path === '/search') {
    title = "🛍️ Product Finder";
    description = "Search for trending TikTok products and see what's selling";
  } else if (path === '/products') {
    title = "🛍️ Top Viral Products";
    description = "Discover the hottest trending products on TikTok";
  } else if (productID) {
    description = "Videos featuring this product";
  }

  return (
    <>
      <header className="modern-header">
        <div className="header-container">
          {/* Logo and Brand */}
          <div className="header-brand">
            <div className="logo">
              <span className="logo-icon">🎵</span>
              <span className="logo-text">ViralTrends</span>
            </div>
            <div className="brand-tagline">
              {description}
            </div>
          </div>

          {/* Navigation */}
          <nav className="header-nav">
            <a href="/" className={`nav-link ${path === '/' ? 'active' : ''}`} title="Trending">
              <span className="nav-icon">🔥</span>
            </a>
            <a href="/search" className={`nav-link ${path === '/search' ? 'active' : ''}`} title="Search">
              <span className="nav-icon">🔍</span>
            </a>
            <a href="/products" className={`nav-link ${path === '/products' ? 'active' : ''}`} title="Products">
              <span className="nav-icon">🛍️</span>
            </a>
            {session && (
              <a href="/analytics" className={`nav-link ${path === '/analytics' ? 'active' : ''}`} title="Analytics">
                <span className="nav-icon">📊</span>
              </a>
            )}
          </nav>

          {/* User Actions */}
          <div className="header-actions">
            <div className="action-group">
              <CompactViewToggle />
              <AutoRefreshToggle />
              <button
                onClick={() => setShowFavorites(true)}
                className="action-button favorites-btn"
                title="View Favorites"
              >
                <span className="action-icon">⭐</span>
              </button>
            </div>

            <div className="user-section">
              {session ? (
                <div className="user-menu">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="action-button user-btn"
                    title="Dashboard"
                  >
                    <span className="action-icon">👤</span>
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="action-button signout-btn"
                    title="Sign Out"
                  >
                    <span className="action-icon">🚪</span>
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    onClick={() => signIn()}
                    className="auth-button signin-btn"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => window.location.href = '/auth/signup'}
                    className="auth-button signup-btn primary"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {showFavorites && (
        <>
          <div 
            className="favorites-backdrop" 
            onClick={() => setShowFavorites(false)}
          />
          <FavoritesList onClose={() => setShowFavorites(false)} />
        </>
      )}
    </>
  );
}