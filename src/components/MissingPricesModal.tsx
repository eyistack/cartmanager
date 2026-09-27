import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, DollarSign, X, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { GroceryItem } from '../types';

interface MissingPricesModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingItems: GroceryItem[];
  onSavePrices: (priceMap: Record<string, number>) => void;
  currency: string;
}

export const MissingPricesModal: React.FC<MissingPricesModalProps> = ({
  isOpen,
  onClose,
  missingItems,
  onSavePrices,
  currency,
}) => {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize with existing estimated or actual price if any
      const initial: Record<string, string> = {};
      missingItems.forEach((item) => {
        const val = item.actualPrice ?? item.estimatedPrice;
        initial[item.id] = val && val > 0 ? String(val) : '';
      });
      setPrices(initial);
      setError(null);
    }
  }, [isOpen, missingItems]);

  if (!isOpen) return null;

  const handlePriceChange = (id: string, value: string) => {
    setPrices((prev) => ({ ...prev, [id]: value }));
    if (error) setError(null);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all missing items have a positive number
    const missingKeys = missingItems.filter((item) => {
      const val = parseFloat(prices[item.id]);
      return isNaN(val) || val <= 0;
    });

    if (missingKeys.length > 0) {
      setError(`Please enter a valid price (> 0) for all ${missingItems.length} item(s) to finish the shopping trip.`);
      return;
    }

    const priceMap: Record<string, number> = {};
    missingItems.forEach((item) => {
      priceMap[item.id] = parseFloat(prices[item.id]);
    });

    onSavePrices(priceMap);
    onClose();
  };

  const filledCount = missingItems.filter((i) => {
    const val = parseFloat(prices[i.id]);
    return !isNaN(val) && val > 0;
  }).length;

  const currentTotal = missingItems.reduce((sum, item) => {
    const val = parseFloat(prices[item.id]);
    return sum + (!isNaN(val) && val > 0 ? val * item.quantity : 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white dark:bg-zinc-950 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-amber-200 dark:border-amber-900/60 my-8 animate-in fade-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm border border-amber-200 dark:border-amber-900">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-zinc-900 dark:text-white">
                Item Prices Required
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                Cannot end shop mode without price for items in cart
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

        {/* Informative notice */}
        <div className="my-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-semibold">
            {missingItems.length} item{missingItems.length > 1 ? 's' : ''} in your cart {missingItems.length > 1 ? 'are' : 'is'} missing a shelf price.
          </p>
          <p className="text-amber-700 dark:text-amber-300">
            Please enter what each item cost at the store so your trip total and expense analytics are 100% accurate.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleApply} className="space-y-4">
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {missingItems.map((item, index) => {
              const enteredVal = parseFloat(prices[item.id]);
              const isFilled = !isNaN(enteredVal) && enteredVal > 0;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isFilled
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                      : 'bg-zinc-50 dark:bg-black border-amber-300 dark:border-amber-900/80 ring-2 ring-amber-500/20 dark:ring-amber-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Item Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-sm text-zinc-900 dark:text-white">
                          {item.name}
                        </span>
                        {item.brand && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                            {item.brand}
                          </span>
                        )}
                        {item.isImpulseBuy && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                            ⚡ Extra
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Qty: <strong className="text-zinc-800 dark:text-zinc-200">{item.quantity}</strong> × {item.weightValue ? `${item.weightValue}${item.weightUnit}` : item.weightUnit} • {item.category}
                      </div>
                    </div>

                    {/* Price Input Field */}
                    <div className="flex items-center gap-2 sm:self-center">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-zinc-400 dark:text-zinc-500 font-bold text-xs">
                          {currency}
                        </span>
                        <input
                          id={`input-missing-price-${item.id}`}
                          type="number"
                          step="any"
                          min="0.01"
                          autoFocus={index === 0}
                          value={prices[item.id] || ''}
                          onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          placeholder="Price"
                          className="w-28 h-9 pl-7 pr-2.5 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                          required
                        />
                      </div>
                      {item.quantity > 1 && isFilled && (
                        <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          = {currency}{(enteredVal * item.quantity).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress & Subtotal */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">
              Completed {filledCount} of {missingItems.length} prices
            </span>
            <span className="font-heading font-bold text-zinc-900 dark:text-white">
              Total Added: {currency}{currentTotal.toLocaleString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
            >
              Back to Aisles
            </button>
            <button
              id="btn-save-missing-prices"
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-heading font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Prices & Finish Trip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
