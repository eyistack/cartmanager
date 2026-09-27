import React, { useState, useRef, useEffect } from 'react';
import { 
  LogOut, 
  Cloud, 
  Smartphone,
  Laptop
} from 'lucide-react';
import { User } from 'firebase/auth';
import { logoutUser } from '../lib/firebase';
import { AuthModal } from './AuthModal';

interface UserAuthButtonProps {
  user: User | null;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({
  user,
  isSyncing,
  lastSyncedAt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setIsOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user) {
    return (
      <>
        <div className="relative">
          <button
            id="btn-open-auth-modal"
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="h-8 sm:h-9 px-2.5 sm:px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs shadow-blue-600/20 flex items-center justify-center cursor-pointer flex-shrink-0 whitespace-nowrap"
            title="Sign in with Email or Google"
          >
            Sign In
          </button>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  // When user is signed in
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const photoURL = user.photoURL;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="btn-user-profile"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 sm:h-9 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all"
        title={`Signed in as ${user.email} (Live Cloud Sync)`}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-1 ring-emerald-500"
          />
        ) : (
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-xs font-bold text-zinc-900 dark:text-white leading-tight max-w-[100px] truncate">
            {displayName}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 leading-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {isSyncing ? 'Syncing...' : 'Synced'}
          </span>
        </div>

        <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      </button>

      {/* Profile & Sync Management Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white text-base font-bold flex items-center justify-center">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="py-2.5 space-y-2 border-b border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-blue-500" />
                Cloud Sync Status:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Real-time Active
              </span>
            </div>

            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-[11px] text-blue-800 dark:text-blue-200 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                <Laptop className="w-3 h-3" />
                Cross-device ready
              </p>
              <p className="text-zinc-600 dark:text-blue-300/80 leading-relaxed">
                Items added on your phone or laptop sync automatically in real time.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/60 text-zinc-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
