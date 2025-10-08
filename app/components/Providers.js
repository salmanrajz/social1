'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './Toast';
import { FavoritesProvider } from './Favorites';
import { CompactViewProvider } from './CompactView';
import { AutoRefreshProvider } from './AutoRefresh';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <FavoritesProvider>
            <CompactViewProvider>
              <AutoRefreshProvider>
                {children}
              </AutoRefreshProvider>
            </CompactViewProvider>
          </FavoritesProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
