import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { GroceryItem } from '../types';

interface FallbackAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GroceryItem | null;
  onSwapWithFallback: (itemId: string, fallbackName: string) => void;
  onConfirmOutOfStock: (itemId: string) => void;
}

export const FallbackAlertModal: React.FC<FallbackAlertModalProps> = ({
  isOpen,
  onClose,
  item,
  onSwapWithFallback,
  onConfirmOutOfStock,
}) => {
  const [customAlt, setCustomAlt] = useState('');

  if (!isOpen || !item) return null;

  const fallbackText = item.fallbackAlternative || customAlt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-zinc-950 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/60 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white">
                Item Out of Stock?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Check fallback substitute before skipping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Primary Item</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
              {item.name} {item.brand ? `[${item.brand}]` : ''}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Qty: {item.quantity} × {item.weightValue ? `${item.weightValue}${item.weightUnit}` : item.weightUnit}
            </div>
          </div>

          {/* Suggested Fallback Alternative */}
          {item.fallbackAlternative ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <ArrowRightLeft className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Configured Fallback Alternative:</span>
              </div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 pl-5">
                "{item.fallbackAlternative}"
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 pl-5">
                Would you like to buy this alternative brand instead and put it in your cart?
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Did you find an alternate brand?
              </label>
              <input
                type="text"
                value={customAlt}
                onChange={(e) => setCustomAlt(e.target.value)}
                placeholder="e.g. Bought Mother Dairy instead of Amul"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          {fallbackText && (
            <button
              id="btn-swap-fallback-brand"
              type="button"
              onClick={() => {
                onSwapWithFallback(item.id, fallbackText);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Buy Alternative ({fallbackText})</span>
            </button>
          )}

          <button
            id="btn-mark-out-of-stock"
            type="button"
            onClick={() => {
              onConfirmOutOfStock(item.id);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Mark Out of Stock (Rollover to Next Trip)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
