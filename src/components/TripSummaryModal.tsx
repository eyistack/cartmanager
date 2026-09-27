import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCheck, 
  Store, 
  DollarSign, 
  Calendar, 
  PieChart, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GroceryItem, ShoppingTrip } from '../types';
import { POPULAR_STORES } from '../data/categories';

interface TripSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GroceryItem[];
  onCompleteTrip: (tripData: {
    storeName: string;
    receiptTotal?: number;
    notes?: string;
    rolloverItemIds: string[];
    updatedPrices?: Record<string, number>;
  }) => void;
  currency: string;
  defaultStore: string;
}

export const TripSummaryModal: React.FC<TripSummaryModalProps> = ({
  isOpen,
  onClose,
  items,
  onCompleteTrip,
  currency,
  defaultStore,
}) => {
  const [storeName, setStoreName] = useState(defaultStore || 'DMart Hypermarket');
  const [receiptTotal, setReceiptTotal] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [rolloverIds, setRolloverIds] = useState<string[]>([]);
  const [inlinePrices, setInlinePrices] = useState<Record<string, string>>({});
  const [priceError, setPriceError] = useState<string | null>(null);

  const inCartItems = items.filter((i) => i.status === 'in_cart');
  const outOfStockItems = items.filter((i) => i.status === 'out_of_stock');
  const pendingItems = items.filter((i) => i.status === 'pending');

  const getItemEffectivePrice = (item: GroceryItem): number => {
    if (inlinePrices[item.id] !== undefined && inlinePrices[item.id] !== '') {
      const val = parseFloat(inlinePrices[item.id]);
      return isNaN(val) ? 0 : val;
    }
    const p = item.actualPrice ?? item.estimatedPrice;
    return p !== undefined && p !== null && !isNaN(Number(p)) ? Number(p) : 0;
  };

  const plannedItems = inCartItems.filter((i) => !i.isImpulseBuy);
  const extraItems = inCartItems.filter((i) => i.isImpulseBuy);
  const forgottenItems = inCartItems.filter((i) => i.isForgottenEssential);

  const plannedSpend = plannedItems.reduce(
    (sum, i) => sum + getItemEffectivePrice(i) * i.quantity,
    0
  );
  const extrasSpend = extraItems.reduce(
    (sum, i) => sum + getItemEffectivePrice(i) * i.quantity,
    0
  );
  const calculatedTotal = plannedSpend + extrasSpend;

  const missingPriceInCartItems = inCartItems.filter((i) => {
    const p = getItemEffectivePrice(i);
    return p <= 0;
  });

  useEffect(() => {
    if (isOpen) {
      // Trigger festive celebration confetti if valid
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#60A5FA', '#F59E0B', '#A855F7'],
        });
      } catch (e) {
        // Safe fallback
      }

      setReceiptTotal(calculatedTotal > 0 ? String(calculatedTotal) : '');
      const missed = [...outOfStockItems, ...pendingItems].map((i) => i.id);
      setRolloverIds(missed);
    }
  }, [isOpen, calculatedTotal]);

  if (!isOpen) return null;

  const toggleRollover = (id: string) => {
    setRolloverIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    if (missingPriceInCartItems.length > 0) {
      setPriceError(`Please enter a price for all items in cart (${missingPriceInCartItems.map(i => i.name).join(', ')}).`);
      return;
    }

    const priceUpdates: Record<string, number> = {};
    Object.entries(inlinePrices).forEach(([id, val]: [string, string]) => {
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed > 0) {
        priceUpdates[id] = parsed;
      }
    });

    onCompleteTrip({
      storeName: storeName.trim() || 'Supermarket',
      receiptTotal: receiptTotal ? parseFloat(receiptTotal) : calculatedTotal,
      notes: notes.trim() || undefined,
      rolloverItemIds: rolloverIds,
      updatedPrices: priceUpdates,
    });
    onClose();
  };

  const extraPercent = calculatedTotal > 0 ? Math.round((extrasSpend / calculatedTotal) * 100) : 0;
  const plannedPercent = 100 - extraPercent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white dark:bg-zinc-950 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800 my-8 animate-in fade-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm border border-blue-200 dark:border-blue-900">
              <CheckCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-zinc-900 dark:text-white">
                Trip Summary & Reconciliation
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Review expenses, impulse purchases, and rollover missing items
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

        {/* Content Form */}
        <form onSubmit={handleFinish} className="space-y-5 mt-4">
          {/* Spend Summary Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Total Items Collected
                </span>
                <div className="text-2xl sm:text-3xl font-heading font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                  {currency}{calculatedTotal.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {inCartItems.length} purchased items across {new Set(inCartItems.map(i => i.category)).size} categories
                </div>
              </div>

              {/* Receipt Total Final Balance Input */}
              <div className="sm:text-right">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Store Receipt Total ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-400 dark:text-zinc-500 font-bold text-sm">
                    {currency}
                  </span>
                  <input
                    id="input-receipt-total"
                    type="number"
                    step="any"
                    value={receiptTotal}
                    onChange={(e) => setReceiptTotal(e.target.value)}
                    placeholder={String(calculatedTotal)}
                    className="w-36 h-9 pl-7 pr-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Planned vs Extra Breakdown Bar */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Planned Essentials: {currency}{plannedSpend.toLocaleString()} ({plannedPercent}%)
                </span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Impulse Extras: {currency}{extrasSpend.toLocaleString()} ({extraPercent}%)
                </span>
              </div>

              <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${plannedPercent}%` }}
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${extraPercent}%` }}
                />
              </div>

              {extraItems.length > 0 && (
                <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50 mt-2">
                  ⚡ <strong>Impulse Items ({extraItems.length}):</strong>{' '}
                  {extraItems.map((e) => `${e.name} (${currency}${e.actualPrice || e.estimatedPrice})`).join(', ')}
                </p>
              )}

              {forgottenItems.length > 0 && (
                <p className="text-[11px] text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-lg border border-indigo-200 dark:border-indigo-900/50 mt-1.5">
                  📝 <strong>Forgotten Essentials ({forgottenItems.length}):</strong>{' '}
                  {forgottenItems.map((e) => `${e.name} (${currency}${getItemEffectivePrice(e) * e.quantity})`).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Store Name & Trip Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Store / Supermarket</span>
              </label>
              <div className="relative">
                <input
                  id="input-trip-store-name"
                  type="text"
                  list="popular-stores"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. DMart, Kirana, Blinkit"
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="popular-stores">
                  {POPULAR_STORES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Trip Notes <span className="text-zinc-400 dark:text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Weekly stock up, paid via UPI"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Error Banner */}
          {priceError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{priceError}</span>
            </div>
          )}

          {/* Missing In-Cart Items Price Fill Section (if any) */}
          {missingPriceInCartItems.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>
                    Missing Prices Required ({missingPriceInCartItems.length})
                  </span>
                </div>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Enter shelf price to calculate accurate receipt
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {missingPriceInCartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 dark:text-white truncate">
                        {item.name}
                        {item.brand && <span className="ml-1 text-[10px] text-blue-600 dark:text-blue-400">[{item.brand}]</span>}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {item.quantity} × {item.weightValue ? `${item.weightValue}${item.weightUnit}` : item.weightUnit}
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-zinc-400 dark:text-zinc-500 font-bold text-xs">
                        {currency}
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        placeholder="Price"
                        value={inlinePrices[item.id] || ''}
                        onChange={(e) => {
                          setInlinePrices(prev => ({ ...prev, [item.id]: e.target.value }));
                          setPriceError(null);
                        }}
                        className="w-24 h-8 pl-6 pr-2 rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing / Out of Stock Rollover Section */}
          {(outOfStockItems.length > 0 || pendingItems.length > 0) && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>
                    Unpurchased Items ({outOfStockItems.length + pendingItems.length})
                  </span>
                </div>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  Select items to rollover to Next List:
                </span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {[...outOfStockItems, ...pendingItems].map((item) => {
                  const isChecked = rolloverIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleRollover(item.id)}
                      className="p-2 rounded-xl bg-white dark:bg-black border border-rose-200 dark:border-rose-900/50 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                        />
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {item.name}
                        </span>
                        {item.brand && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {item.brand}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        {item.status === 'out_of_stock' ? 'Out of Stock' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                <span>{rolloverIds.length} items will be kept on your active list for the next run</span>
                <button
                  type="button"
                  onClick={() => setRolloverIds([...outOfStockItems, ...pendingItems].map(i => i.id))}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Select All
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
            >
              Back to Shopping
            </button>
            <button
              id="btn-save-trip-to-history"
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-heading font-extrabold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Save & Archive Trip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
