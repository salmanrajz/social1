'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const TrendAlertsContext = createContext();

export function TrendAlertsProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    loadNotifications();
    // Check for new matches every 5 minutes
    const interval = setInterval(checkAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    try {
      const saved = localStorage.getItem('viraltrends_alerts');
      if (saved) {
        setAlerts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = () => {
    try {
      const saved = localStorage.getItem('viraltrends_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveAlerts = (newAlerts) => {
    try {
      localStorage.setItem('viraltrends_alerts', JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  };

  const saveNotifications = (newNotifications) => {
    try {
      localStorage.setItem('viraltrends_notifications', JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const createAlert = (alertConfig) => {
    const newAlert = {
      id: `alert_${Date.now()}`,
      ...alertConfig,
      createdAt: new Date().toISOString(),
      lastChecked: null,
      isActive: true,
      matchCount: 0
    };
    saveAlerts([...alerts, newAlert]);
    return newAlert;
  };

  const deleteAlert = (alertId) => {
    saveAlerts(alerts.filter(a => a.id !== alertId));
  };

  const toggleAlert = (alertId) => {
    const updated = alerts.map(alert => 
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    );
    saveAlerts(updated);
  };

  const checkAlerts = async () => {
    for (const alert of alerts.filter(a => a.isActive)) {
      try {
        const matches = await checkAlertCondition(alert);
        if (matches.length > 0) {
          addNotifications(alert, matches);
        }
        
        // Update last checked time
        const updated = alerts.map(a => 
          a.id === alert.id 
            ? { ...a, lastChecked: new Date().toISOString(), matchCount: matches.length }
            : a
        );
        saveAlerts(updated);
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }
  };

  const checkAlertCondition = async (alert) => {
    // Fetch data based on alert type
    const params = new URLSearchParams({
      region: alert.region || 'uk',
      days: alert.timeRange || '1',
      limit: '100',
      offset: '0'
    });

    let endpoint = alert.alertType === 'product' ? '/api/products/top' : '/api/videos';
    const response = await fetch(`${endpoint}?${params}`);
    const data = await response.json();
    
    const items = data.results || data.data || [];
    
    // Filter based on conditions
    return items.filter(item => {
      // Viral score condition
      if (alert.conditions.viralScore) {
        const viralScore = calculateViralScore(item);
        if (viralScore < alert.conditions.viralScore) return false;
      }
      
      // Views condition
      if (alert.conditions.minViews) {
        const views = item.views || item.video_views || 0;
        if (views < alert.conditions.minViews) return false;
      }
      
      // Category condition
      if (alert.conditions.category) {
        const category = item.top_category || item.categories?.[0] || '';
        if (!category.toLowerCase().includes(alert.conditions.category.toLowerCase())) {
          return false;
        }
      }
      
      // Shop/Creator condition
      if (alert.conditions.shopName) {
        const shopName = item.shop?.shop_name || item.video_username || '';
        if (!shopName.toLowerCase().includes(alert.conditions.shopName.toLowerCase())) {
          return false;
        }
      }

      // GMV condition
      if (alert.conditions.minGMV) {
        const gmv = parseFloat(item.gmv || 0);
        if (gmv < alert.conditions.minGMV) return false;
      }
      
      return true;
    });
  };

  const addNotifications = (alert, matches) => {
    const newNotifications = matches.slice(0, 5).map(match => ({
      id: `notif_${Date.now()}_${Math.random()}`,
      alertId: alert.id,
      alertName: alert.name,
      type: alert.alertType,
      item: match,
      createdAt: new Date().toISOString(),
      isRead: false
    }));
    
    saveNotifications([...newNotifications, ...notifications].slice(0, 100)); // Keep last 100
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    saveNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    saveNotifications([]);
  };

  return (
    <TrendAlertsContext.Provider value={{
      alerts,
      notifications,
      isLoading,
      createAlert,
      deleteAlert,
      toggleAlert,
      checkAlerts,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    }}>
      {children}
    </TrendAlertsContext.Provider>
  );
}

export function useTrendAlerts() {
  const context = useContext(TrendAlertsContext);
  if (!context) {
    throw new Error('useTrendAlerts must be used within TrendAlertsProvider');
  }
  return context;
}

function calculateViralScore(item) {
  const views = item.views || item.video_views || 0;
  const likes = item.likes || 0;
  const comments = item.comments || 0;
  const viewScore = views / 1000;
  const engagementScore = (likes + comments) / 100;
  return Math.min(100, Math.round((viewScore + engagementScore) / 20));
}

// Create Alert Button
export function CreateAlertButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="create-alert-btn"
      >
        🔔 Create Alert
      </button>

      {showForm && (
        <CreateAlertForm onClose={() => setShowForm(false)} />
      )}

      <style jsx>{`
        .create-alert-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.2s;
        }

        .create-alert-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </>
  );
}

// Create Alert Form
function CreateAlertForm({ onClose }) {
  const { createAlert } = useTrendAlerts();
  const [formData, setFormData] = useState({
    name: '',
    alertType: 'product',
    region: 'uk',
    timeRange: '1',
    conditions: {
      viralScore: '',
      minViews: '',
      category: '',
      shopName: '',
      minGMV: ''
    },
    notifyVia: ['inapp']
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up empty conditions
    const cleanedConditions = {};
    Object.entries(formData.conditions).forEach(([key, value]) => {
      if (value) {
        cleanedConditions[key] = isNaN(value) ? value : parseFloat(value);
      }
    });

    createAlert({
      ...formData,
      conditions: cleanedConditions
    });
    
    onClose();
  };

  const updateCondition = (key, value) => {
    setFormData({
      ...formData,
      conditions: {
        ...formData.conditions,
        [key]: value
      }
    });
  };

  return (
    <>
      <div className="form-backdrop" onClick={onClose} />
      <div className="create-alert-form">
        <h3>🔔 Create New Alert</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Alert Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Beauty Products Going Viral"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={formData.alertType}
                onChange={(e) => setFormData({ ...formData, alertType: e.target.value })}
              >
                <option value="product">Products</option>
                <option value="video">Videos</option>
              </select>
            </div>

            <div className="form-group">
              <label>Region</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              >
                <option value="uk">UK</option>
                <option value="us">US</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4>Conditions (all are optional)</h4>
            
            <div className="form-group">
              <label>Min Viral Score</label>
              <input
                type="number"
                value={formData.conditions.viralScore}
                onChange={(e) => updateCondition('viralScore', e.target.value)}
                placeholder="e.g., 80"
                min="0"
                max="100"
              />
              <small>Alert when viral score is above this (0-100)</small>
            </div>

            <div className="form-group">
              <label>Min Views</label>
              <input
                type="number"
                value={formData.conditions.minViews}
                onChange={(e) => updateCondition('minViews', e.target.value)}
                placeholder="e.g., 500000"
              />
              <small>Alert when views exceed this number</small>
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.conditions.category}
                onChange={(e) => updateCondition('category', e.target.value)}
                placeholder="e.g., Beauty"
              />
              <small>Alert for specific categories only</small>
            </div>

            <div className="form-group">
              <label>Shop/Creator Name</label>
              <input
                type="text"
                value={formData.conditions.shopName}
                onChange={(e) => updateCondition('shopName', e.target.value)}
                placeholder="e.g., Nike"
              />
              <small>Track specific shops or creators</small>
            </div>

            {formData.alertType === 'product' && (
              <div className="form-group">
                <label>Min GMV (£)</label>
                <input
                  type="number"
                  value={formData.conditions.minGMV}
                  onChange={(e) => updateCondition('minGMV', e.target.value)}
                  placeholder="e.g., 10000"
                />
                <small>Alert when revenue exceeds this amount</small>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-create">
              Create Alert
            </button>
          </div>
        </form>

        <style jsx>{`
          .form-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1001;
          }

          .create-alert-form {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-background);
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            z-index: 1002;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          }

          .create-alert-form h3 {
            margin: 0 0 20px 0;
            font-size: 18px;
            font-weight: 600;
          }

          .form-section {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
          }

          .form-section h4 {
            margin: 0 0 16px 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary);
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 500;
          }

          .form-group input,
          .form-group select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: var(--background-color);
            color: var(--text-color);
            font-size: 14px;
            font-family: inherit;
          }

          .form-group small {
            display: block;
            margin-top: 4px;
            font-size: 12px;
            color: var(--text-secondary);
          }

          .form-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
          }

          .btn-cancel,
          .btn-create {
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }

          .btn-cancel {
            background: var(--background-color);
            border: 1px solid var(--border-color);
            color: var(--text-color);
          }

          .btn-create {
            background: var(--primary-color);
            border: none;
            color: white;
          }
        `}</style>
      </div>
    </>
  );
}

// Notifications Bell
export function NotificationsBell() {
  const { notifications, unreadCount, markAllAsRead } = useTrendAlerts();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="notifications-bell">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="bell-button"
      >
        🔔
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {showNotifications && (
        <>
          <div 
            className="notifications-backdrop"
            onClick={() => setShowNotifications(false)}
          />
          <div className="notifications-panel">
            <div className="panel-header">
              <h4>Notifications</h4>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-read-btn">
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="empty-state">No notifications yet</div>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <NotificationItem key={notif.id} notification={notif} />
                ))
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .notifications-bell {
          position: relative;
        }

        .bell-button {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px;
          font-size: 20px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }

        .bell-button:hover {
          background: var(--primary-color);
        }

        .unread-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ff0050;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .notifications-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .notifications-panel {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 350px;
          max-width: 400px;
          max-height: 500px;
          overflow: hidden;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .panel-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .mark-read-btn {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 12px;
          cursor: pointer;
          padding: 0;
        }

        .notifications-list {
          flex: 1;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

function NotificationItem({ notification }) {
  const { markAsRead } = useTrendAlerts();
  const item = notification.item;

  return (
    <div 
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="notif-icon">
        {notification.type === 'product' ? '🛍️' : '🎬'}
      </div>
      <div className="notif-content">
        <div className="notif-alert-name">{notification.alertName}</div>
        <div className="notif-title">
          {item.name || item.video_username || 'New Match'}
        </div>
        <div className="notif-meta">
          {item.views && `${formatNumber(item.views)} views`}
          {item.gmv && ` • £${formatNumber(parseFloat(item.gmv))} GMV`}
        </div>
        <div className="notif-time">
          {getTimeAgo(notification.createdAt)}
        </div>
      </div>

      <style jsx>{`
        .notification-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: var(--background-color);
        }

        .notification-item.unread {
          background: rgba(255, 0, 80, 0.05);
        }

        .notif-icon {
          font-size: 24px;
        }

        .notif-content {
          flex: 1;
        }

        .notif-alert-name {
          font-size: 11px;
          color: var(--primary-color);
          font-weight: 600;
          margin-bottom: 2px;
        }

        .notif-title {
          font-weight: 500;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .notif-meta {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 2px;
        }

        .notif-time {
          font-size: 11px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Alerts Manager
export function AlertsManager() {
  const { alerts, deleteAlert, toggleAlert } = useTrendAlerts();

  return (
    <div className="alerts-manager">
      <div className="manager-header">
        <h2>🔔 My Alerts</h2>
        <CreateAlertButton />
      </div>

      {alerts.length === 0 ? (
        <div className="empty-alerts">
          <p>No alerts yet</p>
          <p className="hint">Create an alert to get notified when content matches your criteria!</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className="alert-card">
              <div className="alert-header">
                <div>
                  <h3>{alert.name}</h3>
                  <span className="alert-type">{alert.alertType === 'product' ? '🛍️ Products' : '🎬 Videos'}</span>
                </div>
                <div className="alert-actions">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`toggle-btn ${alert.isActive ? 'active' : ''}`}
                  >
                    {alert.isActive ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this alert?')) {
                        deleteAlert(alert.id);
                      }
                    }}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="alert-conditions">
                {Object.entries(alert.conditions).map(([key, value]) => (
                  <span key={key} className="condition-tag">
                    {formatCondition(key, value)}
                  </span>
                ))}
              </div>

              <div className="alert-stats">
                <span>{alert.matchCount || 0} matches</span>
                {alert.lastChecked && (
                  <span>Last checked: {getTimeAgo(alert.lastChecked)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .alerts-manager {
          padding: 20px;
        }

        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .manager-header h2 {
          margin: 0;
        }

        .empty-alerts {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .hint {
          font-size: 14px;
          margin-top: 8px;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .alert-card {
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .alert-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .alert-type {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .alert-actions {
          display: flex;
          gap: 8px;
        }

        .toggle-btn {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--border-color);
          background: var(--background-color);
          color: var(--text-secondary);
        }

        .toggle-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .delete-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          opacity: 0.6;
        }

        .delete-btn:hover {
          opacity: 1;
        }

        .alert-conditions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .condition-tag {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .alert-stats {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-secondary);
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
}

function formatCondition(key, value) {
  const labels = {
    viralScore: 'Viral Score',
    minViews: 'Min Views',
    category: 'Category',
    shopName: 'Shop',
    minGMV: 'Min GMV'
  };
  
  const label = labels[key] || key;
  
  if (key === 'minViews' || key === 'minGMV') {
    return `${label}: ${formatNumber(value)}`;
  }
  
  return `${label}: ${value}`;
}










