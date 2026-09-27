import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'brave' | 'other';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserType, setBrowserType] = useState<BrowserType>('other');
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detect standalone mode (already installed as PWA or native web app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // 2. Detect User Agent and Platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);

    if (isTablet) {
      setDeviceType('tablet');
    } else if (isMobile) {
      setDeviceType('mobile');
    } else {
      setDeviceType('desktop');
    }

    const isAppleMobile = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleMobile);

    // Browser detection
    if ((navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function') {
      setBrowserType('brave');
    } else if (ua.includes('edg/')) {
      setBrowserType('edge');
    } else if (ua.includes('firefox') || ua.includes('fxios')) {
      setBrowserType('firefox');
    } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios') && !ua.includes('android')) {
      setBrowserType('safari');
    } else if (ua.includes('chrome') || ua.includes('crios')) {
      setBrowserType('chrome');
    } else {
      setBrowserType('other');
    }

    // 3. Listen for Chromium/Edge/Brave standard prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerNativePrompt = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.error('PWA install prompt error:', err);
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    browserType,
    deviceType,
    triggerNativePrompt,
    hasNativePrompt: !!deferredPrompt,
  };
}
