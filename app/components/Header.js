'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import { CompactViewToggle } from './CompactView';
import { AutoRefreshToggle } from './AutoRefresh';
import { FavoritesList } from './Favorites';

export default function Header() {
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
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="header-right">
            <div className="header-controls">
              <CompactViewToggle />
              <AutoRefreshToggle />
              <button
                onClick={() => setShowFavorites(true)}
                className="favorites-button"
                title="View Favorites"
              >
                ⭐ Favorites
              </button>
              {session ? (
                <div className="user-menu">
                  <a
                    href="/dashboard"
                    className="user-button"
                    title="Dashboard"
                  >
                    👤 {session.user.name}
                  </a>
                  <button
                    onClick={() => signOut()}
                    className="user-button user-button--signout"
                    title="Sign Out"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    onClick={() => signIn()}
                    className="auth-button auth-button--signin"
                    title="Sign In"
                  >
                    🔐 Sign In
                  </button>
                  <a
                    href="/auth/signup"
                    className="auth-button auth-button--signup"
                    title="Sign Up"
                  >
                    🚀 Sign Up
                  </a>
                </div>
              )}
              <ThemeToggle />
            </div>
        </div>
      </div>
          <nav className="nav">
            <a href="/" className={`nav-link ${path === '/' && !productID ? 'nav-link--active' : ''}`}>🎬 Trending Videos</a>
            <a href="/search" className={`nav-link ${path === '/search' ? 'nav-link--active' : ''}`}>🔍 Find Products</a>
            <a href="/products" className={`nav-link ${path === '/products' ? 'nav-link--active' : ''}`}>🛍️ Top Products</a>
            {session && (
              <a href="/analytics" className={`nav-link ${path === '/analytics' ? 'nav-link--active' : ''}`}>📊 Analytics</a>
            )}
          </nav>

      {showFavorites && (
        <>
          <div 
            className="favorites-backdrop" 
            onClick={() => setShowFavorites(false)}
          />
          <FavoritesList onClose={() => setShowFavorites(false)} />
        </>
      )}
    </header>
  );
}

