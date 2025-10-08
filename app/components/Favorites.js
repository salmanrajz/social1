'use client';

import { useState, useEffect, createContext, useContext } from 'react';

// Favorites Context
const FavoritesContext = createContext();

// Favorites Provider
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites) => {
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  // Add to favorites
  const addToFavorites = (item) => {
    const newFavorites = [...favorites, { ...item, addedAt: Date.now() }];
    saveFavorites(newFavorites);
    return true;
  };

  // Remove from favorites
  const removeFromFavorites = (id) => {
    const newFavorites = favorites.filter(item => item.id !== id);
    saveFavorites(newFavorites);
    return true;
  };

  // Toggle favorite status
  const toggleFavorite = (item) => {
    const isFavorite = favorites.some(fav => fav.id === item.id);
    if (isFavorite) {
      removeFromFavorites(item.id);
      return false;
    } else {
      addToFavorites(item);
      return true;
    }
  };

  // Check if item is favorite
  const isFavorite = (id) => {
    return favorites.some(fav => fav.id === id);
  };

  // Clear all favorites
  const clearFavorites = () => {
    saveFavorites([]);
  };

  // Get favorites by type
  const getFavoritesByType = (type) => {
    return favorites.filter(fav => fav.type === type);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      getFavoritesByType
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook to use favorites
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

// Favorite Button Component
export const FavoriteButton = ({ item, type = 'video', size = 'medium' }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wasAdded = toggleFavorite({ ...item, id: itemId, type });
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    return wasAdded;
  };

  // Use different ID fields based on type
  const itemId = type === 'video' 
    ? (item.video_url || item.handle || item.video_username || 'unknown')
    : (item.product_id || item.name || 'unknown');
  
  const favorite = isFavorite(itemId);

  return (
    <button
      onClick={handleToggle}
      className={`favorite-button favorite-button--${size} ${favorite ? 'favorite-button--active' : ''} ${isAnimating ? 'favorite-button--animating' : ''}`}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <span className="favorite-icon">
        {favorite ? '❤️' : '🤍'}
      </span>
      {size === 'large' && (
        <span className="favorite-text">
          {favorite ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </button>
  );
};

// Favorites List Component
export const FavoritesList = ({ type, onClose }) => {
  const { favorites, removeFromFavorites, getFavoritesByType } = useFavorites();
  const [selectedType, setSelectedType] = useState(type || 'all');

  const filteredFavorites = selectedType === 'all' 
    ? favorites 
    : getFavoritesByType(selectedType);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="favorites-list">
      <div className="favorites-list__header">
        <h2>⭐ Favorites</h2>
        <button onClick={onClose} className="favorites-list__close">✕</button>
      </div>

      <div className="favorites-list__filters">
        <button
          className={`favorites-filter ${selectedType === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedType('all')}
        >
          All ({favorites.length})
        </button>
        <button
          className={`favorites-filter ${selectedType === 'video' ? 'active' : ''}`}
          onClick={() => setSelectedType('video')}
        >
          Videos ({getFavoritesByType('video').length})
        </button>
        <button
          className={`favorites-filter ${selectedType === 'product' ? 'active' : ''}`}
          onClick={() => setSelectedType('product')}
        >
          Products ({getFavoritesByType('product').length})
        </button>
      </div>

      <div className="favorites-list__content">
        {filteredFavorites.length === 0 ? (
          <div className="favorites-list__empty">
            <span className="favorites-empty-icon">⭐</span>
            <p>No favorites yet</p>
            <p>Click the ❤️ button on any content to add it here!</p>
          </div>
        ) : (
          <div className="favorites-list__items">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="favorites-list__item">
                <div className="favorites-item__content">
                  <div className="favorites-item__image">
                    {favorite.type === 'video' ? (
                      <img
                        src={favorite.thumbnail || "https://placehold.co/60x60?text=Video"}
                        alt={favorite.video_username || favorite.handle || "Video"}
                        className="favorites-item__thumbnail"
                      />
                    ) : (
                      <img
                        src={favorite.product_img_url || favorite.img_url || "https://placehold.co/60x60?text=Product"}
                        alt={favorite.name || "Product"}
                        className="favorites-item__thumbnail"
                      />
                    )}
                  </div>
                  
                  <div className="favorites-item__info">
                    <h4 className="favorites-item__title">
                      {favorite.type === 'video' 
                        ? (favorite.video_username || favorite.handle || 'Unknown Creator')
                        : (favorite.name || 'Unknown Product')
                      }
                    </h4>
                    <p className="favorites-item__description">
                      {favorite.type === 'video' 
                        ? (favorite.description || 'No description')
                        : (favorite.price_display || 'No price')
                      }
                    </p>
                    <p className="favorites-item__date">
                      Added {formatDate(favorite.addedAt)}
                    </p>
                  </div>
                </div>

                <div className="favorites-item__actions">
                  <button
                    onClick={() => {
                      if (favorite.type === 'video') {
                        window.location.href = `/?productID=${favorite.product_data?.product_id || 'video'}`;
                      } else {
                        window.location.href = `/?productID=${favorite.product_id}`;
                      }
                    }}
                    className="favorites-item__view"
                    title="View"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => removeFromFavorites(favorite.id)}
                    className="favorites-item__remove"
                    title="Remove from favorites"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
