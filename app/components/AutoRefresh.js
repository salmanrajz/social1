'use client';

import { useState, useEffect, createContext, useContext } from 'react';

// Auto Refresh Context
const AutoRefreshContext = createContext();

// Auto Refresh Provider
export const AutoRefreshProvider = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [interval, setInterval] = useState(30); // seconds
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Load auto-refresh preferences from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem('autoRefreshEnabled');
    const savedInterval = localStorage.getItem('autoRefreshInterval');
    
    if (savedEnabled) {
      setIsEnabled(JSON.parse(savedEnabled));
    }
    if (savedInterval) {
      setInterval(parseInt(savedInterval));
    }
  }, []);

  // Save preferences to localStorage
  const updateSettings = (enabled, newInterval) => {
    setIsEnabled(enabled);
    setInterval(newInterval);
    localStorage.setItem('autoRefreshEnabled', JSON.stringify(enabled));
    localStorage.setItem('autoRefreshInterval', newInterval.toString());
  };

  const triggerRefresh = () => {
    setLastRefresh(Date.now());
    window.location.reload();
  };

  return (
    <AutoRefreshContext.Provider value={{
      isEnabled,
      interval,
      lastRefresh,
      updateSettings,
      triggerRefresh
    }}>
      {children}
    </AutoRefreshContext.Provider>
  );
};

// Hook to use auto refresh
export const useAutoRefresh = () => {
  const context = useContext(AutoRefreshContext);
  if (!context) {
    throw new Error('useAutoRefresh must be used within an AutoRefreshProvider');
  }
  return context;
};

// Auto Refresh Toggle Component
export const AutoRefreshToggle = ({ onRefresh }) => {
  const { isEnabled, interval, lastRefresh, updateSettings, triggerRefresh } = useAutoRefresh();
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Update countdown timer
  useEffect(() => {
    if (!isEnabled) {
      setTimeUntilRefresh(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const timeSinceLastRefresh = (now - lastRefresh) / 1000;
      const remaining = Math.max(0, interval - timeSinceLastRefresh);
      setTimeUntilRefresh(Math.ceil(remaining));

      // Trigger refresh when timer reaches 0
      if (remaining <= 0) {
        if (onRefresh) {
          onRefresh();
        } else {
          triggerRefresh();
        }
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isEnabled, interval, lastRefresh, onRefresh, triggerRefresh]);

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleToggle = () => {
    updateSettings(!isEnabled, interval);
  };

  const handleIntervalChange = (newInterval) => {
    updateSettings(isEnabled, newInterval);
  };

  const handleManualRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      triggerRefresh();
    }
  };

  return (
    <div className="auto-refresh-container">
      <button
        onClick={handleToggle}
        className={`auto-refresh-toggle ${isEnabled ? 'auto-refresh-toggle--active' : ''}`}
        title={isEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
      >
        <span className="auto-refresh-icon">
          {isEnabled ? '🔄' : '⏸️'}
        </span>
        <span className="auto-refresh-text">
          {isEnabled ? 'Auto' : 'Manual'}
        </span>
        {isEnabled && (
          <span className="auto-refresh-timer">
            {formatTime(timeUntilRefresh)}
          </span>
        )}
      </button>

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="auto-refresh-settings"
        title="Auto-refresh settings"
      >
        ⚙️
      </button>

      <button
        onClick={handleManualRefresh}
        className="auto-refresh-manual"
        title="Refresh now"
      >
        🔄
      </button>

      {showSettings && (
        <>
          <div 
            className="auto-refresh-backdrop" 
            onClick={() => setShowSettings(false)}
          />
          <div className="auto-refresh-settings-panel">
            <div className="auto-refresh-settings-header">
              <h3>Auto-Refresh Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="auto-refresh-settings-close"
              >
                ✕
              </button>
            </div>

            <div className="auto-refresh-settings-content">
              <div className="auto-refresh-setting">
                <label>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => updateSettings(e.target.checked, interval)}
                  />
                  Enable auto-refresh
                </label>
              </div>

              <div className="auto-refresh-setting">
                <label>Refresh interval:</label>
                <div className="auto-refresh-intervals">
                  {[15, 30, 60, 120, 300].map((value) => (
                    <button
                      key={value}
                      className={`auto-refresh-interval ${interval === value ? 'active' : ''}`}
                      onClick={() => handleIntervalChange(value)}
                    >
                      {value < 60 ? `${value}s` : `${value / 60}m`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="auto-refresh-setting">
                <label>Custom interval (seconds):</label>
                <input
                  type="number"
                  min="10"
                  max="600"
                  value={interval}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 30)}
                  className="auto-refresh-custom-interval"
                />
              </div>

              <div className="auto-refresh-info">
                <p>💡 Auto-refresh will reload the page to show new content</p>
                <p>⏰ Last refresh: {new Date(lastRefresh).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Auto Refresh Status Component
export const AutoRefreshStatus = () => {
  const { isEnabled, interval, lastRefresh } = useAutoRefresh();
  const [timeSinceRefresh, setTimeSinceRefresh] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const timeSince = Math.floor((now - lastRefresh) / 1000);
      setTimeSinceRefresh(timeSince);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lastRefresh]);

  const formatTimeAgo = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s ago`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  if (!isEnabled) return null;

  return (
    <div className="auto-refresh-status">
      <span className="auto-refresh-status-icon">🔄</span>
      <span className="auto-refresh-status-text">
        Auto-refresh: {formatTimeAgo(timeSinceRefresh)}
      </span>
    </div>
  );
};
