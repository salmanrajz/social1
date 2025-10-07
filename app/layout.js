import './globals.css'
import SessionTimer from './components/SessionTimer'

export const metadata = {
  title: 'TikTok Viral Trends - Discover Top Products',
  description: 'Discover trending TikTok videos and viral products. Find what\'s selling and going viral right now.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionTimer />
        {children}
      </body>
    </html>
  )
}

