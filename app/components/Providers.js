'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './Toast';
import { FavoritesProvider } from './Favorites';
import { CompactViewProvider } from './CompactView';
import { AutoRefreshProvider } from './AutoRefresh';
import { CollectionsProvider } from './Collections';
import { TrendAlertsProvider } from './TrendAlerts';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <FavoritesProvider>
            <CollectionsProvider>
              <TrendAlertsProvider>
                <CompactViewProvider>
                  <AutoRefreshProvider>
                    {children}
                  </AutoRefreshProvider>
                </CompactViewProvider>
              </TrendAlertsProvider>
            </CollectionsProvider>
          </FavoritesProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
