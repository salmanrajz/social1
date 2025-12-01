'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionTimer() {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [duration, setDuration] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Skip during SSR/build
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Get cookies
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const expiresAt = getCookie('site_expires');
    const durationLabel = getCookie('site_duration');

    if (expiresAt && durationLabel) {
      setDuration(durationLabel);

      const updateTimer = () => {
        const now = Date.now();
        const expires = parseInt(expiresAt, 10);
        const remaining = expires - now;

        if (remaining <= 0) {
          // Session expired
          document.cookie = 'site_password=; path=/; max-age=0';
          document.cookie = 'site_expires=; path=/; max-age=0';
          document.cookie = 'site_duration=; path=/; max-age=0';
          router.push('/auth');
          router.refresh();
        } else {
          setTimeRemaining(remaining);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [router]);

  if (timeRemaining === null) return null;

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const isLowTime = minutes < 5;

  return (
    <div className={`session-timer ${isLowTime ? 'session-timer--warning' : ''}`}>
      <span className="timer-icon">⏱️</span>
      <div className="timer-content">
        <span className="timer-label">Session expires in</span>
        <span className="timer-value">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      
      <style jsx>{`
        .session-timer {
          position: fixed;
          top: 5rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 9999 !important;
          font-size: 0.875rem;
          animation: slideIn 0.3s ease-out;
        }

        .session-timer--warning {
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .timer-icon {
          font-size: 1.25rem;
        }

        .timer-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .timer-label {
          font-size: 0.625rem;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .timer-value {
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
        }

        @media (max-width: 768px) {
          .session-timer {
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
          }

          .timer-icon {
            font-size: 1rem;
          }

          .timer-value {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}

