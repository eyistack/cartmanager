import React from 'react';
import { 
  ShoppingCart, 
  ShoppingBag, 
  History, 
  Sparkles, 
  BarChart3, 
  Moon, 
  Sun, 
  Share2, 
  CheckCircle2, 
  Play
} from 'lucide-react';
import { ActiveTab } from '../types';
import { User } from 'firebase/auth';
import { UserAuthButton } from './UserAuthButton';
import { OfflineBadge } from './OfflineIndicator';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currency: string;
  setCurrency: (c: string) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  itemsCount: number;
  inCartCount: number;
  onOpenShare: () => void;
  onStartShopping: () => void;
  user: User | null;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  theme,
  setTheme,
  itemsCount,
  inCartCount,
  onOpenShare,
  onStartShopping,
  user,
  isSyncing,
  lastSyncedAt,
}) => {
  const currencies = ['₹', '$', '€', '£', 'AED', 'CAD', 'AUD'];

  return (
    <>
      {/* Sticky Top Header with Brand Logo, Currency, Share, Theme, and Sign In */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-2 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-4">
            {/* Logo & App Name */}
            <div 
              onClick={() => setActiveTab('list')}
              className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group select-none flex-shrink-0"
            >
              {/* Pitch AMOLED Black App Icon with crisp White Shopping Cart Outline */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black border border-zinc-800 text-white flex items-center justify-center shadow-md shadow-black/60 ring-1 ring-white/15 group-hover:border-zinc-600 transition-all flex-shrink-0">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
              </div>
              
              {/* Single Solid Color Brand Typography */}
              <span className="font-heading font-extrabold text-sm xs:text-base sm:text-lg lg:text-xl text-zinc-900 dark:text-white tracking-tight">
                CartManager
              </span>

              {/* Dynamic Offline / Online Indicator beside logo */}
              <OfflineBadge />
            </div>

            {/* Center Navigation Tabs (Desktop screens only: 1280px+) */}
            <nav className="hidden xl:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                id="nav-tab-list"
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs ring-1 ring-zinc-200 dark:ring-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>List</span>
                {itemsCount > 0 && (
                  <span className="text-xs px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">
                    {itemsCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-shop"
                onClick={onStartShopping}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'shop'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Shop</span>
                {itemsCount > 0 && (
                  <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/25 text-white font-bold">
                    {inCartCount}/{itemsCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-staples"
                onClick={() => setActiveTab('staples')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'staples'
                    ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-300 shadow-xs ring-1 ring-zinc-200 dark:ring-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Staples</span>
              </button>

              <button
                id="nav-tab-history"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs ring-1 ring-zinc-200 dark:ring-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Trips</span>
              </button>

              <button
                id="nav-tab-analytics"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs ring-1 ring-zinc-200 dark:ring-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Stats</span>
              </button>
            </nav>

            {/* Right Action Tools */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Currency Selector */}
              <select
                id="select-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-8 sm:h-9 px-1.5 sm:px-2 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                title="Change Currency Symbol"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* WhatsApp Share Button */}
              <button
                id="btn-nav-share"
                onClick={onOpenShare}
                className="h-8 sm:h-9 w-8 sm:w-auto sm:px-3 flex items-center justify-center sm:gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
                title="Share on WhatsApp or Export"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Dark / Light Mode Toggle */}
              <button
                id="btn-toggle-theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle light and dark mode"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-600" />
                )}
              </button>

              {/* Google Sign-In & Live Cloud Sync Button */}
              <UserAuthButton
                user={user}
                isSyncing={isSyncing}
                lastSyncedAt={lastSyncedAt}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onStartShopping: () => void;
  itemsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onStartShopping,
  itemsCount,
}) => {
  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800/90 px-3 sm:px-8 py-2 pb-safe flex items-center justify-around shadow-2xl transition-colors">
      <button
        id="mobile-nav-list"
        onClick={() => setActiveTab('list')}
        className={`flex flex-col items-center py-1 px-3 sm:px-6 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
          activeTab === 'list'
            ? 'text-blue-600 dark:text-white font-bold'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          {itemsCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {itemsCount}
            </span>
          )}
        </div>
        <span className="mt-0.5">List</span>
      </button>

      <button
        id="mobile-nav-shop"
        onClick={onStartShopping}
        className={`flex flex-col items-center py-1 px-3.5 sm:px-7 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
          activeTab === 'shop'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60'
        }`}
      >
        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
        <span className="mt-0.5">Shop</span>
      </button>

      <button
        id="mobile-nav-staples"
        onClick={() => setActiveTab('staples')}
        className={`flex flex-col items-center py-1 px-3 sm:px-6 rounded-xl text-[11px] sm:text-xs font-medium transition-colors cursor-pointer ${
          activeTab === 'staples'
            ? 'text-amber-600 dark:text-amber-400 font-bold'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
        }`}
      >
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 dark:text-amber-400" />
        <span className="mt-0.5">Staples</span>
      </button>

      <button
        id="mobile-nav-history"
        onClick={() => setActiveTab('history')}
        className={`flex flex-col items-center py-1 px-3 sm:px-6 rounded-xl text-[11px] sm:text-xs font-medium transition-colors cursor-pointer ${
          activeTab === 'history'
            ? 'text-blue-600 dark:text-white font-bold'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
        }`}
      >
        <History className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="mt-0.5">Trips</span>
      </button>

      <button
        id="mobile-nav-analytics"
        onClick={() => setActiveTab('analytics')}
        className={`flex flex-col items-center py-1 px-3 sm:px-6 rounded-xl text-[11px] sm:text-xs font-medium transition-colors cursor-pointer ${
          activeTab === 'analytics'
            ? 'text-blue-600 dark:text-white font-bold'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
        }`}
      >
        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="mt-0.5">Stats</span>
      </button>
    </nav>
  );
};
