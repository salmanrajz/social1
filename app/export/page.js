'use client';

import { useState } from 'react';
import ModernHeader from '../components/ModernHeader';

export default function ExportPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleDownload = async (days) => {
    setIsDownloading(true);
    setDownloadStatus(`Downloading top products from last ${days} days...`);

    try {
      const response = await fetch(`/api/export/products-csv?days=${days}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `top-products-last-${days}-days.csv`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadStatus(`✅ Successfully downloaded ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus(`❌ Download failed: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container">
      <ModernHeader />
      
      <main className="main-content">
        <div className="export-container">
          <h1>📊 Export Top Products Data</h1>
          <p className="export-description">
            Download comprehensive CSV files with top viral products data from TikTok.
          </p>

          <div className="export-options">
            <div className="export-card">
              <h3>🔥 Last 3 Days</h3>
              <p>Top viral products from the last 3 days</p>
              <button 
                onClick={() => handleDownload(3)}
                disabled={isDownloading}
                className="download-button primary"
              >
                {isDownloading ? '⏳ Downloading...' : '📥 Download CSV'}
              </button>
            </div>

            <div className="export-card">
              <h3>📅 Last 7 Days</h3>
              <p>Top viral products from the last week</p>
              <button 
                onClick={() => handleDownload(7)}
                disabled={isDownloading}
                className="download-button secondary"
              >
                {isDownloading ? '⏳ Downloading...' : '📥 Download CSV'}
              </button>
            </div>

            <div className="export-card">
              <h3>📆 Last 30 Days</h3>
              <p>Top viral products from the last month</p>
              <button 
                onClick={() => handleDownload(30)}
                disabled={isDownloading}
                className="download-button secondary"
              >
                {isDownloading ? '⏳ Downloading...' : '📥 Download CSV'}
              </button>
            </div>
          </div>

          {downloadStatus && (
            <div className={`download-status ${downloadStatus.includes('✅') ? 'success' : 'error'}`}>
              {downloadStatus}
            </div>
          )}

          <div className="csv-info">
            <h3>📋 CSV File Includes:</h3>
            <ul>
              <li>✅ Product ranking and basic info</li>
              <li>✅ Price and shop details</li>
              <li>✅ GMV and sales metrics</li>
              <li>✅ Viral and trending scores</li>
              <li>✅ Product images and categories</li>
              <li>✅ Timestamps and regions</li>
            </ul>
          </div>
        </div>
      </main>

      <style jsx>{`
        .export-container {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-xl);
        }

        .export-container h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
          text-align: center;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .export-description {
          text-align: center;
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin-bottom: var(--space-2xl);
        }

        .export-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-lg);
          margin-bottom: var(--space-2xl);
        }

        .export-card {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          text-align: center;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }

        .export-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
          border-color: var(--primary-color);
        }

        .export-card h3 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }

        .export-card p {
          color: var(--text-secondary);
          margin-bottom: var(--space-lg);
        }

        .download-button {
          padding: var(--space-md) var(--space-xl);
          border: none;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .download-button.primary {
          background: var(--primary-color);
          color: var(--text-white);
        }

        .download-button.primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .download-button.secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
        }

        .download-button.secondary:hover {
          background: var(--bg-hover);
          border-color: var(--primary-color);
          transform: translateY(-2px);
        }

        .download-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .download-status {
          padding: var(--space-md);
          border-radius: var(--radius-md);
          text-align: center;
          font-weight: 500;
          margin-bottom: var(--space-lg);
        }

        .download-status.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        }

        .download-status.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        }

        .csv-info {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          border: 1px solid var(--border-color);
        }

        .csv-info h3 {
          color: var(--text-primary);
          margin-bottom: var(--space-md);
          font-size: 1.25rem;
        }

        .csv-info ul {
          list-style: none;
          padding: 0;
        }

        .csv-info li {
          padding: var(--space-xs) 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .export-container {
            padding: var(--space-lg);
          }

          .export-container h1 {
            font-size: 2rem;
          }

          .export-options {
            grid-template-columns: 1fr;
            gap: var(--space-md);
          }

          .export-card {
            padding: var(--space-lg);
          }
        }
      `}</style>
    </div>
  );
}
