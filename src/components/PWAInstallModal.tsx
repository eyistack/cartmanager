import React from 'react';
import { 
  Download, 
  X, 
  Sparkles,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { 
    browserType, 
    deviceType, 
    isIOS, 
    hasNativePrompt, 
    triggerNativePrompt,
    isInstalled 
  } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      const installed = await triggerNativePrompt();
      if (installed) {
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Download className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white">
              Install CartManager App
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs">
          {/* 1-Click Prompt if supported (Chrome, Edge, Brave) */}
          {hasNativePrompt ? (
            <div className="space-y-2.5">
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Install CartManager on your {deviceType === 'mobile' ? 'phone' : deviceType === 'tablet' ? 'tablet' : 'computer'} for instant full-screen access and offline grocery shopping.
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            </div>
          ) : (
            /* Concise instructions tailored to the user's browser */
            <div className="space-y-2.5">
              {browserType === 'firefox' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <span>🦊 Firefox Instructions:</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {deviceType === 'mobile' || deviceType === 'tablet'
                      ? 'Tap menu (⋮) at top/bottom right > tap "Install" or "Add to Home screen".'
                      : 'Click the install icon in the address bar or tap menu (≡) > More tools > Add to Desktop.'}
                  </p>
                </div>
              )}

              {(isIOS || browserType === 'safari') && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                  <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <span>🧭 Safari Instructions:</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    Tap the <strong>Share</strong> button (box with arrow <span className="font-mono font-bold">⎋</span>) &gt; scroll down and tap <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              )}

              {browserType !== 'firefox' && !isIOS && browserType !== 'safari' && (
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>🌐 Browser Instructions:</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Click the <strong>Install app icon (⤓)</strong> in your browser's address bar, or open the browser menu (⋮) and choose <strong>"Install CartManager"</strong>.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Works 100% offline in supermarket aisles</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-850 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            {isInstalled ? 'App already installed' : 'No app store needed'}
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
