'use client';

import { useState, useEffect } from 'react';

export default function PerformanceComparison({ currentData, comparisonType: initialComparisonType = 'yesterday' }) {
  const [comparisonType, setComparisonType] = useState(initialComparisonType);
  const [currentPeriodData, setCurrentPeriodData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBothPeriods();
  }, [comparisonType]);

  const fetchBothPeriods = async () => {
    setIsLoading(true);
    try {
      // Fetch BOTH current and comparison data based on selected type
      let currentParams, comparisonParams;
      
      if (comparisonType === 'yesterday') {
        // Current: Today (last 24 hours)
        currentParams = new URLSearchParams({
          region: 'uk',
          days: '1',
          limit: '100',
          offset: '0'
        });
        
        // Comparison: Yesterday (2 days ago)
        comparisonParams = new URLSearchParams({
          region: 'uk',
          days: '3', // Get last 3 days
          limit: '100',
          offset: '100' // Skip first 100 to get older data
        });
      } else {
        // Current: Last 7 days
        currentParams = new URLSearchParams({
          region: 'uk',
          days: '7',
          limit: '100',
          offset: '0'
        });
        
        // Comparison: Previous 7 days (7-14 days ago)
        comparisonParams = new URLSearchParams({
          region: 'uk',
          days: '30', // Get last 30 days
          limit: '100',
          offset: '150' // Skip to get older data
        });
      }

      // Fetch both periods
      const [currentResponse, comparisonResponse] = await Promise.all([
        fetch(`/api/videos?${currentParams}`),
        fetch(`/api/videos?${comparisonParams}`)
      ]);

      const currentDataResult = await currentResponse.json();
      const comparisonDataResult = await comparisonResponse.json();
      
      setCurrentPeriodData(currentDataResult);
      setComparisonData(comparisonDataResult);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="performance-comparison loading">
        <div className="loading-spinner">📊 Loading comparison data...</div>
      </div>
    );
  }

  // Calculate metrics using the fetched data
  const currentMetrics = calculateMetrics(currentPeriodData);
  const previousMetrics = calculateMetrics(comparisonData);
  const changes = calculateChanges(currentMetrics, previousMetrics);

  return (
    <div className="performance-comparison">
      <div className="comparison-header">
        <h3>📊 Performance Comparison</h3>
        <select 
          value={comparisonType}
          onChange={(e) => setComparisonType(e.target.value)}
          className="comparison-selector"
        >
          <option value="yesterday">Today vs Last 2 Days</option>
          <option value="lastWeek">Last 7 Days vs Last 14 Days</option>
        </select>
      </div>

      <div className="metrics-grid">
        <MetricCard
          icon="🎬"
          title="Total Videos"
          current={currentMetrics.totalVideos}
          previous={previousMetrics.totalVideos}
          change={changes.videos}
        />
        
        <MetricCard
          icon="👁️"
          title="Total Views"
          current={formatNumber(currentMetrics.totalViews)}
          previous={formatNumber(previousMetrics.totalViews)}
          change={changes.views}
        />
        
        <MetricCard
          icon="❤️"
          title="Total Engagement"
          current={formatNumber(currentMetrics.totalEngagement)}
          previous={formatNumber(previousMetrics.totalEngagement)}
          change={changes.engagement}
        />
        
        <MetricCard
          icon="💰"
          title="Total GMV"
          current={formatCurrency(currentMetrics.totalGMV)}
          previous={formatCurrency(previousMetrics.totalGMV)}
          change={changes.gmv}
        />
        
        <MetricCard
          icon="🔥"
          title="Avg Viral Score"
          current={currentMetrics.avgViralScore.toFixed(1)}
          previous={previousMetrics.avgViralScore.toFixed(1)}
          change={changes.viralScore}
        />
        
        <MetricCard
          icon="📈"
          title="Avg Engagement Rate"
          current={`${currentMetrics.avgEngagementRate.toFixed(2)}%`}
          previous={`${previousMetrics.avgEngagementRate.toFixed(2)}%`}
          change={changes.engagementRate}
        />
      </div>

      <div className="top-movers">
        <h4>🚀 Top Movers</h4>
        <div className="movers-list">
          {getTopMovers(currentPeriodData, comparisonData).map((mover, index) => (
            <div key={index} className="mover-item">
              <span className="mover-rank">#{mover.rank}</span>
              <span className="mover-title">{mover.title}</span>
              <span className={`mover-change ${mover.direction}`}>
                {mover.direction === 'up' ? '📈' : '📉'} {mover.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .performance-comparison {
          background: var(--card-background);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid var(--border-color);
        }

        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .comparison-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .comparison-selector {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--background-color);
          color: var(--text-color);
          font-size: 14px;
          cursor: pointer;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }

        .top-movers h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .movers-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mover-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--background-color);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .mover-rank {
          font-weight: 700;
          color: var(--primary-color);
          min-width: 40px;
        }

        .mover-title {
          flex: 1;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mover-change {
          font-weight: 600;
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .mover-change.up {
          color: #00ff88;
          background: rgba(0, 255, 136, 0.1);
        }

        .mover-change.down {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

function MetricCard({ icon, title, current, previous, change }) {
  const isPositive = change >= 0;
  const changeIcon = isPositive ? '📈' : '📉';
  const changeColor = isPositive ? '#00ff88' : '#ff6b6b';

  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-current">{current}</div>
      <div className="metric-comparison">
        <span className="metric-previous">Was: {previous}</span>
        <span className="metric-change" style={{ color: changeColor }}>
          {changeIcon} {Math.abs(change).toFixed(1)}%
        </span>
      </div>

      <style jsx>{`
        .metric-card {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .metric-icon {
          font-size: 20px;
        }

        .metric-title {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .metric-current {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-color);
        }

        .metric-comparison {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .metric-previous {
          color: var(--text-secondary);
        }

        .metric-change {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

function calculateMetrics(data) {
  if (!data || !data.data || data.data.length === 0) {
    return {
      totalVideos: 0,
      totalViews: 0,
      totalEngagement: 0,
      totalGMV: 0,
      avgViralScore: 0,
      avgEngagementRate: 0
    };
  }

  const videos = data.data;
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + (v.comments || 0), 0);
  const totalEngagement = totalLikes + totalComments;
  const totalGMV = videos.reduce((sum, v) => sum + parseFloat(v.gmv || 0), 0);
  
  const avgViralScore = videos.reduce((sum, v) => {
    const viewScore = (v.views || 0) / 1000;
    const engagementScore = ((v.likes || 0) + (v.comments || 0)) / 100;
    const score = Math.min(100, Math.round((viewScore + engagementScore) / 20));
    return sum + score;
  }, 0) / videos.length;

  const avgEngagementRate = totalViews > 0 
    ? (totalEngagement / totalViews) * 100 
    : 0;

  return {
    totalVideos: videos.length,
    totalViews,
    totalEngagement,
    totalGMV,
    avgViralScore,
    avgEngagementRate
  };
}

function calculateChanges(current, previous) {
  const calculateChange = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  return {
    videos: calculateChange(current.totalVideos, previous.totalVideos),
    views: calculateChange(current.totalViews, previous.totalViews),
    engagement: calculateChange(current.totalEngagement, previous.totalEngagement),
    gmv: calculateChange(current.totalGMV, previous.totalGMV),
    viralScore: calculateChange(current.avgViralScore, previous.avgViralScore),
    engagementRate: calculateChange(current.avgEngagementRate, previous.avgEngagementRate)
  };
}

function getTopMovers(currentData, previousData) {
  if (!currentData?.data || !previousData?.data) return [];

  const movers = [];
  const currentVideos = currentData.data || [];
  const previousVideos = previousData.data || [];
  
  currentVideos.slice(0, 10).forEach((video, index) => {
    const prevVideo = previousVideos.find(v => v.video_url === video.video_url);
    if (prevVideo && prevVideo.views > 0) {
      const change = ((video.views - prevVideo.views) / prevVideo.views) * 100;
      movers.push({
        rank: index + 1,
        title: video.video_username || video.handle || 'Unknown',
        change: Math.abs(change).toFixed(1),
        direction: change >= 0 ? 'up' : 'down'
      });
    } else if (!prevVideo) {
      // New video that wasn't in previous period
      movers.push({
        rank: index + 1,
        title: video.video_username || video.handle || 'Unknown',
        change: '100',
        direction: 'up'
      });
    }
  });

  return movers.sort((a, b) => parseFloat(b.change) - parseFloat(a.change)).slice(0, 3);
}

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(num) {
  if (num >= 1000000) return `£${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `£${(num / 1000).toFixed(1)}K`;
  return `£${num.toFixed(0)}`;
}

