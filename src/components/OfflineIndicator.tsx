import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showStatus, setShowStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<'offline' | 'online' | null>(null);

  useEffect(() => {
    // If initially offline, show badge briefly for 4.5 seconds so user knows it's working without annoying them
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setShowStatus(true);
      const initialTimer = setTimeout(() => {
        setShowStatus(false);
      }, 4500);
      return () => clearTimeout(initialTimer);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setToastMessage('online');
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
        setToastMessage(null);
      }, 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastMessage('offline');
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
        setToastMessage(null);
      }, 4500);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // When status is triggered (offline on load, network dropped, or back online)
  if (!showStatus) {
    // Even when toast has faded away, if offline, show a subtle tiny slash wifi icon next to the logo
    if (!isOnline) {
      return (
        <span 
          title="Offline mode active (Service Worker & Local Storage enabled)"
          className="inline-flex items-center text-amber-500/80 ml-1 cursor-help"
        >
          <WifiOff className="w-3.5 h-3.5" />
        </span>
      );
    }
    return null;
  }

  if (toastMessage === 'online') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full animate-in fade-in zoom-in-95 duration-200">
        <Wifi className="w-3 h-3 text-emerald-400" />
        <span className="hidden xs:inline">Online</span>
      </span>
    );
  }

  // Offline toast beside logo
  return (
    <span 
      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-600/50 px-2.5 py-0.5 rounded-full animate-in fade-in zoom-in-95 duration-200 shadow-xs"
      title="You are currently offline. CartManager is running smoothly from local storage."
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
      <span className="tracking-tight">Offline mode</span>
    </span>
  );
};
