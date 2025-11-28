'use client';

import { useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Video, ShoppingBag, Search, BarChart3, User, LogOut, LogIn, UserPlus, Star } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { CompactViewToggle } from './CompactView';
import { AutoRefreshToggle } from './AutoRefresh';
import { FavoritesList } from './Favorites';

export default function Header() {
  const [showFavorites, setShowFavorites] = useState(false);
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const productID = searchParams.get('productID');

  let description = "Discover what's trending and going viral on TikTok";

  if (pathname === '/search') {
    description = "Search for trending TikTok products and see what's selling";
  } else if (pathname === '/products') {
    description = "Discover the hottest trending products on TikTok";
  } else if (productID) {
    description = "Videos featuring this product";
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-foreground">social</span>
            <span className="text-primary">1</span>
          </a>
          
          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/' && !productID
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Video className="h-4 w-4" />
              Videos
            </a>
            <a
              href="/search"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/search'
                  ? 'text-primary bg-primary/10 border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Search className="h-4 w-4" />
              Find Products
            </a>
            <a
              href="/products"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/products'
                  ? 'text-primary bg-primary/10 border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Products
            </a>
            {session && (
              <a
                href="/analytics"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/analytics'
                    ? 'text-foreground bg-muted'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </a>
            )}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <CompactViewToggle />
          <AutoRefreshToggle />
          <button
            onClick={() => setShowFavorites(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="View Favorites"
          >
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Favorites</span>
          </button>
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-2">
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Dashboard"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session.user.name}</span>
              </a>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => signIn()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Sign In"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
              <a
                href="/auth/signup"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                title="Sign Up"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {showFavorites && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1999]" 
            onClick={() => setShowFavorites(false)}
          />
          <FavoritesList onClose={() => setShowFavorites(false)} />
        </>
      )}
    </header>
  );
}

