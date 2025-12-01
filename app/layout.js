import './globals.css'
import SessionTimer from './components/SessionTimer'
import Providers from './components/Providers'
import PWAInstallPrompt from './components/PWAInstallPrompt'

export const metadata = {
  title: 'TikTok Viral Trends - Discover Top Products',
  description: 'Discover trending TikTok videos and viral products. Find what\'s selling and going viral right now.',
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#ef4444" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Viral Trends" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body>
        <Providers>
          <SessionTimer />
          <PWAInstallPrompt />
          {children}
        </Providers>
      </body>
    </html>
  )
}

