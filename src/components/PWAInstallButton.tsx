import React, { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstalled, hasNativePrompt, triggerNativePrompt } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If app is already opened as a standalone PWA, hide the button to keep UI clean
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    // If native prompt is available (Chrome, Brave, Edge), trigger direct prompt first
    if (hasNativePrompt) {
      const outcome = await triggerNativePrompt();
      if (outcome) return;
    }
    // Otherwise open guided installation modal (for Firefox, iOS Safari, and manual setups)
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        id="btn-pwa-install"
        onClick={handleClick}
        className={`h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs hover:shadow-blue-600/30 text-xs font-heading font-extrabold transition-all cursor-pointer select-none flex-shrink-0 border border-blue-400/20 ${className}`}
        title="Install CartManager app on this device"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.4]" />
        <span className="inline">Install App</span>
      </button>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
