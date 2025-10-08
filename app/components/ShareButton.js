'use client';

import { useState } from 'react';

export default function ShareButton({ 
  url, 
  title, 
  description, 
  hashtags = [],
  type = 'video' // 'video' or 'product'
}) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : url;
  const shareTitle = `${title} - TikTok Viral Trends`;
  const shareText = `${description}\n\nDiscover more trending content at TikTok Viral Trends!`;
  const shareHashtags = hashtags.length > 0 ? hashtags.join(',') : 'TikTokViral,TrendingProducts';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${shareHashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      url: shareLinks.twitter
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: '#1877F2',
      url: shareLinks.facebook
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: '#0077B5',
      url: shareLinks.linkedin
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      url: shareLinks.whatsapp
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: '#0088CC',
      url: shareLinks.telegram
    },
    {
      name: 'Reddit',
      icon: '🤖',
      color: '#FF4500',
      url: shareLinks.reddit
    },
    {
      name: 'Pinterest',
      icon: '📌',
      color: '#E60023',
      url: shareLinks.pinterest
    },
    {
      name: 'Email',
      icon: '📧',
      color: '#EA4335',
      url: shareLinks.email
    }
  ];

  return (
    <div className="share-button-container">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="share-button"
        aria-label="Share"
        title="Share this content"
      >
        <span className="share-icon">📤</span>
        <span className="share-text">Share</span>
      </button>

      {showShareMenu && (
        <>
          <div 
            className="share-backdrop" 
            onClick={() => setShowShareMenu(false)}
          />
          <div className="share-menu">
            <div className="share-menu-header">
              <h3>Share {type === 'video' ? 'Video' : 'Product'}</h3>
              <button
                onClick={() => setShowShareMenu(false)}
                className="share-close"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="share-options">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-option"
                  style={{ '--option-color': option.color }}
                  onClick={() => setShowShareMenu(false)}
                >
                  <span className="share-option-icon">{option.icon}</span>
                  <span className="share-option-name">{option.name}</span>
                </a>
              ))}
            </div>

            <div className="share-copy">
              <button
                onClick={copyToClipboard}
                className={`copy-button ${copied ? 'copied' : ''}`}
              >
                <span className="copy-icon">
                  {copied ? '✅' : '📋'}
                </span>
                <span className="copy-text">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
              <div className="share-url">
                <code>{shareUrl}</code>
              </div>
            </div>

            <div className="share-footer">
              <p>Share this {type} with your network!</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
