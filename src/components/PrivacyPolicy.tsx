import React from 'react';
import { ArrowLeft, ShieldCheck, Database, Cloud, Lock, EyeOff, HardDrive, Smartphone, CheckCircle, RefreshCw } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
  onOpenTerms?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, onOpenTerms }) => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CartManager
          </button>
          
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircle className="w-3.5 h-3.5" />
              Local-First & Offline Ready
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase border border-blue-200 dark:border-blue-900/40">
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: October 2026 • Non-commercial hobby project
          </p>
          <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
            CartManager is designed with a strict <strong className="text-zinc-900 dark:text-white">privacy-first, local-first</strong> architecture. This document explains transparently how your data is handled on your device and when optional cloud services are engaged.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Local By Default</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your grocery lists, budgets, and shopping trips are saved on your own device browser storage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Zero Advertising Trackers</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              No telemetry, tracking pixels, ad networks, or data brokers. We do not sell or monetize personal data.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Optional Cloud Sync</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Cloud synchronization is entirely optional. It only activates if you explicitly choose to sign in.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-white dark:bg-zinc-900/60 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              1. Local-First Data Storage
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              CartManager operates primarily as an offline-first client application. When you create grocery items, track shopping trips, log pantry staples, set monthly spending budgets, or select your preferred currency, this information is stored directly on your client device using the standard web <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-pink-600 dark:text-pink-400">localStorage</code> and IndexedDB caching mechanisms.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Unless you explicitly authenticate with Google Firebase, your data never leaves your device or browser sandbox.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              2. Optional Cloud Synchronization
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              If you choose to use the "Sign In" feature to sync your shopping list across multiple devices (such as your phone and laptop), CartManager uses Google Firebase Authentication and Google Cloud Firestore.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>
                <strong>Authentication:</strong> When signing in with Google, Firebase manages your authentication token. We receive your basic profile identity (name, email, and avatar) solely to display your active account profile.
              </li>
              <li>
                <strong>Firestore Document:</strong> Your grocery lists, completed trips, pantry staples, and budget settings are stored in a private database document restricted strictly to your authenticated user identifier (<code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-mono">users/{'{userId}'}</code>).
              </li>
              <li>
                <strong>Security Rules:</strong> Firestore database security rules enforce that only your authenticated account has permission to read or write your personal shopping lists.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              3. Offline Operation & Progressive Web App (PWA)
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              CartManager incorporates a Service Worker via the Progressive Web App standard to enable instant loading, supermarket aisle offline usage, and local caching of interface assets.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              No offline usage data is covertly queued for analytical tracking. When your device is disconnected from Wi-Fi or mobile data, the app relies exclusively on cached local assets.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              4. Analytics, Cookies, and Advertising
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              CartManager does not use advertising networks, tracking cookies, user profiling algorithms, or third-party behavioral analytics tools (such as Google Analytics or Meta Pixel). Technical cookies or local storage keys are solely used to retain your UI preferences (light/dark theme, active currency, and store filters).
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              5. Data Deletion & Retention
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              You retain total control over your information at all times:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>
                <strong>Clearing Local Data:</strong> You can clear your browser storage, site data, or use the "Clear All" features inside the application at any time to instantly delete your local shopping history.
              </li>
              <li>
                <strong>Cloud Data Removal:</strong> If you use Firebase Cloud Sync, signing out or requesting document deletion will purge the remote records.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading">
              6. Project Status & AI Generation
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              CartManager is strictly a non-commercial hobby application completely generated with AI assistance. It is provided free of charge for personal everyday organization.
            </p>
          </section>

        </div>

        {/* Footer info & Links */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
          <p>© {new Date().getFullYear()} CartManager. Non-commercial personal utility.</p>
          <div className="flex items-center gap-4">
            {onOpenTerms && (
              <button
                onClick={onOpenTerms}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Terms of Service
              </button>
            )}
            <button
              onClick={onBack}
              className="text-zinc-700 dark:text-zinc-300 hover:underline cursor-pointer"
            >
              Back to App
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
