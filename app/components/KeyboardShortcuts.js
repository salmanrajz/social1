'use client';

import { useEffect, useState } from 'react';

export default function KeyboardShortcuts({ onPrevPage, onNextPage, canGoPrev, canGoNext }) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'h':
          if (canGoPrev) {
            e.preventDefault();
            onPrevPage();
          }
          break;
        case 'ArrowRight':
        case 'l':
          if (canGoNext) {
            e.preventDefault();
            onNextPage();
          }
          break;
        case 'r':
          e.preventDefault();
          window.location.reload();
          break;
        case '/':
          e.preventDefault();
          window.location.href = '/search';
          break;
        case '?':
          e.preventDefault();
          setShowHelp(prev => !prev);
          break;
        case 'Escape':
          if (showHelp) {
            e.preventDefault();
            setShowHelp(false);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevPage, onNextPage, canGoPrev, canGoNext, showHelp]);

  return (
    <>
      {/* Keyboard shortcut indicator */}
      <button
        onClick={() => setShowHelp(true)}
        className="keyboard-help-button"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        ⌨️
      </button>

      {/* Help modal */}
      {showHelp && (
        <div className="keyboard-help-modal" onClick={() => setShowHelp(false)}>
          <div className="keyboard-help-content" onClick={(e) => e.stopPropagation()}>
            <div className="keyboard-help-header">
              <h2>⌨️ Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="keyboard-help-close"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="keyboard-help-body">
              <div className="keyboard-shortcut-group">
                <h3>Navigation</h3>
                <div className="keyboard-shortcut">
                  <kbd>←</kbd> or <kbd>H</kbd>
                  <span>Previous page</span>
                </div>
                <div className="keyboard-shortcut">
                  <kbd>→</kbd> or <kbd>L</kbd>
                  <span>Next page</span>
                </div>
              </div>

              <div className="keyboard-shortcut-group">
                <h3>Actions</h3>
                <div className="keyboard-shortcut">
                  <kbd>/</kbd>
                  <span>Search products</span>
                </div>
                <div className="keyboard-shortcut">
                  <kbd>R</kbd>
                  <span>Refresh page</span>
                </div>
              </div>

              <div className="keyboard-shortcut-group">
                <h3>Help</h3>
                <div className="keyboard-shortcut">
                  <kbd>?</kbd>
                  <span>Toggle this help</span>
                </div>
                <div className="keyboard-shortcut">
                  <kbd>ESC</kbd>
                  <span>Close modals</span>
                </div>
              </div>
            </div>

            <div className="keyboard-help-footer">
              <p>💡 Tip: Shortcuts work when not typing in a text field</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

