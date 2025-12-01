'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
export const revalidate = 0;

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { useFavorites } from '../components/Favorites';
import PushNotifications from '../components/PushNotifications';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { favorites } = useFavorites();
  const [userStats, setUserStats] = useState({
    totalFavorites: 0,
    videosFavorited: 0,
    productsFavorited: 0,
    joinDate: null,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (favorites) {
      const videos = favorites.filter(fav => fav.type === 'video');
      const products = favorites.filter(fav => fav.type === 'product');
      
      setUserStats({
        totalFavorites: favorites.length,
        videosFavorited: videos.length,
        productsFavorited: products.length,
        joinDate: session?.user?.createdAt || new Date().toISOString(),
      });
    }
  }, [favorites, session]);

  if (status === 'loading') {
    return (
      <div className="container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="container">
      <Header />
      
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1>👋 Welcome back, {session.user.name}!</h1>
            <p>Here's your personalized TikTok Viral Trends dashboard</p>
          </div>
          
          <div className="dashboard-actions">
            <button
              onClick={handleSignOut}
              className="dashboard-button dashboard-button--secondary"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{userStats.totalFavorites}</h3>
              <p>Total Favorites</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎬</div>
            <div className="stat-content">
              <h3>{userStats.videosFavorited}</h3>
              <p>Videos Saved</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛍️</div>
            <div className="stat-content">
              <h3>{userStats.productsFavorited}</h3>
              <p>Products Saved</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{new Date(userStats.joinDate).toLocaleDateString()}</h3>
              <p>Member Since</p>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <PushNotifications />
          
          <div className="dashboard-section">
            <h2>🎯 Quick Actions</h2>
            <div className="quick-actions">
              <a href="/" className="quick-action">
                <span className="quick-action-icon">🔥</span>
                <span>Browse Trending Videos</span>
              </a>
              <a href="/search" className="quick-action">
                <span className="quick-action-icon">🔍</span>
                <span>Search Products</span>
              </a>
              <a href="/products" className="quick-action">
                <span className="quick-action-icon">🛍️</span>
                <span>Top Products</span>
              </a>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>⭐ Your Favorites</h2>
            {favorites && favorites.length > 0 ? (
              <div className="favorites-preview">
                {favorites.slice(0, 6).map((favorite, index) => (
                  <div key={index} className="favorite-preview-item">
                    <div className="favorite-preview-image">
                      {favorite.type === 'video' ? (
                        <img
                          src={favorite.thumbnail || "https://placehold.co/60x60?text=Video"}
                          alt={favorite.video_username || favorite.handle || "Video"}
                        />
                      ) : (
                        <img
                          src={favorite.product_img_url || favorite.img_url || "https://placehold.co/60x60?text=Product"}
                          alt={favorite.name || "Product"}
                        />
                      )}
                    </div>
                    <div className="favorite-preview-info">
                      <h4>
                        {favorite.type === 'video' 
                          ? (favorite.video_username || favorite.handle || 'Unknown Creator')
                          : (favorite.name || 'Unknown Product')
                        }
                      </h4>
                      <p>{favorite.type === 'video' ? 'Video' : 'Product'}</p>
                    </div>
                  </div>
                ))}
                {favorites.length > 6 && (
                  <div className="favorites-more">
                    <p>+{favorites.length - 6} more favorites</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">⭐</span>
                <p>No favorites yet! Start exploring and save content you love.</p>
                <a href="/" className="empty-state-action">
                  Browse Trending Videos
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
