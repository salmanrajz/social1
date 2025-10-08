'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnalytics();
    }
  }, [session?.user?.id, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?days=${timeRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-empty">
          <h3>📊 Analytics Dashboard</h3>
          <p>Sign in to view your personal analytics and insights</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-loading">
          <div className="loading-spinner">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-error">
          <h3>📊 Analytics Dashboard</h3>
          <p>Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const dailyData = Object.entries(analytics.dailyActivity || {}).map(([date, count]) => ({
    date: format(new Date(date), 'MMM dd'),
    fullDate: date,
    events: count,
  })).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  const activityData = [
    { name: 'Page Views', value: analytics.stats?.pageViews || 0, color: '#ef4444' },
    { name: 'Video Clicks', value: analytics.stats?.videoClicks || 0, color: '#3b82f6' },
    { name: 'Product Clicks', value: analytics.stats?.productClicks || 0, color: '#10b981' },
    { name: 'Searches', value: analytics.stats?.searches || 0, color: '#f59e0b' },
    { name: 'Favorites', value: analytics.stats?.favorites || 0, color: '#8b5cf6' },
    { name: 'Shares', value: analytics.stats?.shares || 0, color: '#ec4899' },
  ];

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 Your Analytics Dashboard</h2>
        <div className="analytics-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="analytics-time-select"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="analytics-stats">
        <div className="analytics-stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{analytics.stats?.totalEvents || 0}</h3>
            <p>Total Events</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <h3>{analytics.stats?.pageViews || 0}</h3>
            <p>Page Views</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-content">
            <h3>{analytics.stats?.videoClicks || 0}</h3>
            <p>Video Clicks</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <h3>{analytics.stats?.productClicks || 0}</h3>
            <p>Product Clicks</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-content">
            <h3>{analytics.stats?.searches || 0}</h3>
            <p>Searches</p>
          </div>
        </div>
        <div className="analytics-stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{analytics.stats?.favorites || 0}</h3>
            <p>Favorites</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="analytics-charts">
        <div className="analytics-chart">
          <h3>📈 Daily Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="events" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-chart">
          <h3>🎯 Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Content */}
      <div className="analytics-content">
        <div className="analytics-section">
          <h3>🔥 Most Clicked Videos</h3>
          {analytics.popularVideos?.length > 0 ? (
            <div className="popular-items">
              {analytics.popularVideos.slice(0, 5).map((video, index) => (
                <div key={video.id} className="popular-item">
                  <div className="popular-rank">#{index + 1}</div>
                  <div className="popular-info">
                    <h4>{video.data.video_username || video.data.handle || 'Unknown Creator'}</h4>
                    <p>{video.count} clicks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="analytics-empty-text">No video clicks recorded</p>
          )}
        </div>

        <div className="analytics-section">
          <h3>🛍️ Most Clicked Products</h3>
          {analytics.popularProducts?.length > 0 ? (
            <div className="popular-items">
              {analytics.popularProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="popular-item">
                  <div className="popular-rank">#{index + 1}</div>
                  <div className="popular-info">
                    <h4>{product.data.name || 'Unknown Product'}</h4>
                    <p>{product.count} clicks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="analytics-empty-text">No product clicks recorded</p>
          )}
        </div>
      </div>

      {/* Search Queries */}
      {analytics.searchQueries?.length > 0 && (
        <div className="analytics-section">
          <h3>🔍 Recent Searches</h3>
          <div className="search-queries">
            {analytics.searchQueries.map((query, index) => (
              <span key={index} className="search-query-tag">
                {query}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
