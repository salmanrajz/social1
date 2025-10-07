'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const durationMinutes = data.duration;
        const maxAge = durationMinutes * 60; // Convert to seconds
        const expiresAt = Date.now() + (durationMinutes * 60 * 1000); // Milliseconds
        
        // Set cookies with expiration
        document.cookie = `site_password=${password}; path=/; max-age=${maxAge}; SameSite=Strict`;
        document.cookie = `site_expires=${expiresAt}; path=/; max-age=${maxAge}; SameSite=Strict`;
        document.cookie = `site_duration=${data.durationLabel}; path=/; max-age=${maxAge}; SameSite=Strict`;
        
        router.push('/');
        router.refresh();
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔒 TikTok Viral Trends</h1>
          <p>Enter the password to access this site</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="auth-input"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading || !password}
          >
            {isLoading ? 'Verifying...' : 'Access Site'}
          </button>
        </form>

        <div className="auth-footer">
          <p>🔐 This site is password protected</p>
          <div className="password-hints">
            <p className="hint-title">Available access codes:</p>
            <ul className="hint-list">
              <li>⏱️ 30-minute access</li>
              <li>⏱️ 1-hour access</li>
            </ul>
            <p className="hint-note">Ask your contact for the appropriate code</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .auth-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 100%;
          overflow: hidden;
        }

        .auth-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .auth-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .auth-form {
          padding: 2rem;
        }

        .auth-input-group {
          margin-bottom: 1.5rem;
        }

        .auth-input-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .auth-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .auth-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .auth-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .auth-error {
          padding: 0.75rem 1rem;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 0.5rem;
          color: #dc2626;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .auth-button {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .auth-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auth-footer {
          padding: 1.5rem 2rem;
          background: #f9fafb;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }

        .auth-footer p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .password-hints {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .hint-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .hint-list {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
        }

        .hint-list li {
          font-size: 0.875rem;
          color: #6b7280;
          padding: 0.25rem 0;
        }

        .hint-note {
          font-size: 0.75rem;
          color: #9ca3af;
          font-style: italic;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}

