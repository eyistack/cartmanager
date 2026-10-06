import React from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, ShoppingCart, ShieldAlert, Scale, HelpCircle } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
  onOpenPrivacy?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack, onOpenPrivacy }) => {
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium">
              <Scale className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              Standard Terms
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase border border-indigo-200 dark:border-indigo-900/40">
            <FileText className="w-4 h-4" />
            Terms & Conditions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: October 2026 • Non-commercial hobby project
          </p>
          <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
            Please read these Terms of Service carefully before using CartManager. By accessing or using this web application, you agree to be bound by these terms.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Personal Utility</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Designed solely as a personal shopping list, pantry inventory, and budget calculation companion.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Price Estimations</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Estimated prices entered by users are references only. Actual store register receipts govern checkout.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Non-Commercial Project</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Provided free of charge "as-is" without warranty. Code and application architecture generated with AI.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 bg-white dark:bg-zinc-900/60 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              1. Non-Commercial Hobby Project & AI Attribution
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              CartManager is an experimental, non-commercial hobby application completely generated with AI assistance using Google AI Studio. It is provided at no cost for personal, private utility and educational exploration.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              2. Estimations, Calculations, and Store Checkout
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              The application assists shoppers by organizing items into supermarket categories, calculating planned totals, detecting missing prices, and recording trip history.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>
                <strong>Price Variations:</strong> All estimated prices, unit pricing (per kg, liter, piece), and total budget figures are user-entered estimates. Actual store prices, taxes, discounts, checkout barcode scanners, and register receipts at retail stores take precedence.
              </li>
              <li>
                <strong>No Financial Advice:</strong> Spend analytics and monthly budget tracking are informational visualizations and do not constitute financial advice or banking records.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              3. Third-Party Supermarket Trademarks & Stores
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Any references to supermarket brands or retail stores (e.g., D-Mart, Walmart, Costco, Tesco, Reliance Smart, etc.) within the application or documentation are strictly for individual list tagging, user convenience, and organizational purposes under fair use nominative reference.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              CartManager is an independent project and is neither affiliated with, endorsed by, nor sponsored by any supermarket chain, retailer, or brand.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              4. Local Data Storage & User Responsibility
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Unless signed in through optional Google Firebase sync, all grocery items, staple reminders, and history records exist solely on your device's browser cache. If you clear browser cache, use incognito/private tabs, or switch browsers, local data may be removed.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Users are encouraged to utilize the built-in "Share / Backup" JSON export feature to retain local copies of important shopping records.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              5. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              CartManager is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. In no event shall the authors or AI project contributors be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this software.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              6. Modifications to Terms
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              These terms may be revised occasionally to reflect software improvements, PWA features, or security updates. Continued use of the application constitutes acceptance of any revised terms.
            </p>
          </section>

        </div>

        {/* Footer info & Links */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
          <p>© {new Date().getFullYear()} CartManager. Non-commercial personal utility.</p>
          <div className="flex items-center gap-4">
            {onOpenPrivacy && (
              <button
                onClick={onOpenPrivacy}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Privacy Policy
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
