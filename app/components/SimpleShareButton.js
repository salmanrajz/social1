'use client';

import { useState, useEffect, useRef } from 'react';

export default function SimpleShareButton({ 
  url, 
  title, 
  description, 
  type = 'video' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : url;

  const shareOptions = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook', 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Copy Link',
      action: 'copy'
    }
  ];

  const handleShare = async (option) => {
    if (option.action === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        alert('Failed to copy link');
      }
    } else {
      window.open(option.url, '_blank', 'width=600,height=400');
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => {
          console.log('Simple share button clicked');
          setIsOpen(!isOpen);
        }}
        style={{
          padding: '8px 16px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#5a6fd8';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#667eea';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        📤 Share
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            backgroundColor: 'white',
            border: '2px solid #667eea',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 9999,
            minWidth: '160px',
            marginBottom: '8px',
            overflow: 'hidden'
          }}
        >
          {shareOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleShare(option)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                borderBottom: index < shareOptions.length - 1 ? '1px solid #eee' : 'none'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
