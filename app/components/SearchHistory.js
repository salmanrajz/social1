'use client';

import { useState, useEffect } from 'react';

export default function SearchHistory({ onSearch, currentQuery = '' }) {
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (query) => {
    if (!query || query.trim().length < 2) return;
    
    const trimmedQuery = query.trim().toLowerCase();
    const newHistory = [
      trimmedQuery,
      ...searchHistory.filter(item => item !== trimmedQuery)
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Handle search from history
  const handleHistorySearch = (query) => {
    onSearch(query);
    setShowHistory(false);
  };

  // Remove specific item from history
  const removeFromHistory = (query, e) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(item => item !== query);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="search-history-container">
      {searchHistory.length > 0 && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="search-history-toggle"
          title="Search History"
        >
          <span className="search-history-icon">🕒</span>
          <span className="search-history-count">{searchHistory.length}</span>
        </button>
      )}

      {showHistory && (
        <>
          <div 
            className="search-history-backdrop" 
            onClick={() => setShowHistory(false)}
          />
          <div className="search-history-dropdown">
            <div className="search-history-header">
              <h3>Recent Searches</h3>
              <button
                onClick={clearHistory}
                className="search-history-clear"
                title="Clear History"
              >
                🗑️
              </button>
            </div>

            <div className="search-history-list">
              {searchHistory.map((query, index) => (
                <div
                  key={index}
                  className={`search-history-item ${query === currentQuery.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleHistorySearch(query)}
                >
                  <span className="search-history-query">{query}</span>
                  <button
                    onClick={(e) => removeFromHistory(query, e)}
                    className="search-history-remove"
                    title="Remove from history"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="search-history-footer">
              <p>Click to search • ✕ to remove</p>
            </div>
          </div>
        </>
      )}

      {/* Export search history function for parent components */}
      {typeof window !== 'undefined' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.saveSearchToHistory = function(query) {
                const saved = localStorage.getItem('searchHistory') || '[]';
                const history = JSON.parse(saved);
                const trimmedQuery = query.trim().toLowerCase();
                if (trimmedQuery && trimmedQuery.length >= 2) {
                  const newHistory = [
                    trimmedQuery,
                    ...history.filter(item => item !== trimmedQuery)
                  ].slice(0, 10);
                  localStorage.setItem('searchHistory', JSON.stringify(newHistory));
                }
              };
            `
          }}
        />
      )}
    </div>
  );
}
