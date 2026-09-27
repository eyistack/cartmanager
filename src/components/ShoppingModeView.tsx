import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  XCircle, 
  Plus, 
  Zap, 
  ClipboardList,
  ArrowLeft, 
  CheckCheck, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  DollarSign, 
  Layers, 
  RotateCcw, 
  ShoppingBag, 
  Store,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { GroceryItem, GroceryCategory, ItemStatus } from '../types';
import { CATEGORIES } from '../data/categories';
import { ImpulseBuyModal } from './ImpulseBuyModal';
import { FallbackAlertModal } from './FallbackAlertModal';
import { MissingPricesModal } from './MissingPricesModal';

interface ShoppingModeViewProps {
  items: GroceryItem[];
  onUpdateItem: (id: string, updates: Partial<GroceryItem>) => void;
  onAddItem: (item: Partial<GroceryItem>) => void;
  onExitShopping: () => void;
  onFinishShoppingTrip: () => void;
  currency: string;
}

export const ShoppingModeView: React.FC<ShoppingModeViewProps> = ({
  items,
  onUpdateItem,
  onAddItem,
  onExitShopping,
  onFinishShoppingTrip,
  currency,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in_cart' | 'out_of_stock'>('all');
  const [isImpulseModalOpen, setIsImpulseModalOpen] = useState(false);
  const [isMissingPricesModalOpen, setIsMissingPricesModalOpen] = useState(false);
  const [fallbackModalItem, setFallbackModalItem] = useState<GroceryItem | null>(null);
  const [collapsedAisles, setCollapsedAisles] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMiniExpanded, setIsMiniExpanded] = useState(false);

  // Detect when user scrolls down past the main top card
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 130) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setIsMiniExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Price adjustment state for in-store quick price editing
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Helper to check if item is missing a valid price (> 0)
  const isItemMissingPrice = (item: GroceryItem) => {
    const p = item.actualPrice ?? item.estimatedPrice;
    return p === undefined || p === null || isNaN(Number(p)) || Number(p) <= 0;
  };

  // Tally calculations
  const inCartItems = useMemo(() => items.filter((i) => i.status === 'in_cart'), [items]);
  const outOfStockItems = useMemo(() => items.filter((i) => i.status === 'out_of_stock'), [items]);
  const pendingItems = useMemo(() => items.filter((i) => i.status === 'pending'), [items]);

  // In-cart items with missing price
  const inCartMissingPriceItems = useMemo(
    () => inCartItems.filter(isItemMissingPrice),
    [inCartItems]
  );

  const plannedInCartSpend = useMemo(() => {
    return inCartItems
      .filter((i) => !i.isImpulseBuy)
      .reduce((sum, i) => sum + (i.actualPrice !== undefined ? i.actualPrice * i.quantity : (i.estimatedPrice || 0) * i.quantity), 0);
  }, [inCartItems]);

  const extrasSpend = useMemo(() => {
    return inCartItems
      .filter((i) => i.isImpulseBuy)
      .reduce((sum, i) => sum + (i.actualPrice !== undefined ? i.actualPrice * i.quantity : (i.estimatedPrice || 0) * i.quantity), 0);
  }, [inCartItems]);

  const totalRunningSpend = plannedInCartSpend + extrasSpend;
  const progressPercent = items.length > 0 ? Math.round((inCartItems.length / items.length) * 100) : 0;

  // Filter items
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((i) => i.status === activeFilter);
  }, [items, activeFilter]);

  // Group by category (Aisles)
  const groupedAisles = useMemo(() => {
    const map = new Map<GroceryCategory, GroceryItem[]>();
    CATEGORIES.forEach((c) => map.set(c.name, []));

    filteredItems.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });

    return Array.from(map.entries()).filter(([_, list]) => list.length > 0);
  }, [filteredItems]);

  const toggleAisleCollapse = (category: string) => {
    setCollapsedAisles((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleMarkInCart = (item: GroceryItem) => {
    const defaultPrice = item.actualPrice ?? item.estimatedPrice;
    onUpdateItem(item.id, {
      status: 'in_cart',
      actualPrice: defaultPrice,
      collectedAt: new Date().toISOString(),
    });

    // If item does not have a price recorded, immediately open quick inline price input
    if (defaultPrice === undefined || defaultPrice === null || defaultPrice <= 0) {
      setEditingPriceItemId(item.id);
      setTempPrice('');
    }
  };

  const handleMarkOutOfStock = (item: GroceryItem) => {
    setFallbackModalItem(item);
  };

  const handleSwapWithFallback = (itemId: string, fallbackName: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const defaultPrice = item.actualPrice ?? item.estimatedPrice;
    onUpdateItem(itemId, {
      name: `${item.name} (${fallbackName})`,
      brand: fallbackName,
      status: 'in_cart',
      actualPrice: defaultPrice,
      collectedAt: new Date().toISOString(),
      notes: `Substituted with fallback: ${fallbackName}`,
    });

    if (defaultPrice === undefined || defaultPrice === null || defaultPrice <= 0) {
      setEditingPriceItemId(itemId);
      setTempPrice('');
    }
  };

  const handleConfirmOutOfStock = (itemId: string) => {
    onUpdateItem(itemId, {
      status: 'out_of_stock',
    });
  };

  const handleSavePrice = (itemId: string) => {
    const val = parseFloat(tempPrice);
    if (!isNaN(val) && val > 0) {
      onUpdateItem(itemId, { actualPrice: val });
    }
    setEditingPriceItemId(null);
    setTempPrice('');
  };

  // Attempt finish trip with strict price validation
  const handleAttemptFinishTrip = () => {
    if (inCartMissingPriceItems.length > 0) {
      setIsMissingPricesModalOpen(true);
      return;
    }
    onFinishShoppingTrip();
  };

  const handleSaveMissingPrices = (priceMap: Record<string, number>) => {
    Object.entries(priceMap).forEach(([id, price]) => {
      onUpdateItem(id, { actualPrice: price });
    });
    // Smoothly proceed to summary modal
    setTimeout(() => {
      onFinishShoppingTrip();
    }, 50);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Top In-Store Heads-Up Display (Normal Flow at Top) */}
      <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-3xl p-3.5 sm:p-5 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors">
        {/* Top bar: Back & Finish Button */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-850">
          <button
            id="btn-exit-shopping-mode"
            onClick={onExitShopping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Run</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Live In-Store Run
            </span>
          </div>

          <div className="flex items-center gap-2">
            {inCartMissingPriceItems.length > 0 && (
              <button
                onClick={() => setIsMissingPricesModalOpen(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                title="Click to fill missing prices"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{inCartMissingPriceItems.length} Missing Price</span>
              </button>
            )}

            <button
              id="btn-finish-shopping-run"
              onClick={handleAttemptFinishTrip}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-heading font-extrabold shadow-md transition-all cursor-pointer ${
                inCartMissingPriceItems.length > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-black ring-2 ring-amber-400/50'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>
                {inCartMissingPriceItems.length > 0 ? 'Finish Trip (Prices Needed)' : 'Finish Trip'}
              </span>
            </button>
          </div>
        </div>

        {/* Missing Prices Alert Banner in HUD */}
        {inCartMissingPriceItems.length > 0 && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start sm:items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
              <div>
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  Missing price for {inCartMissingPriceItems.length} item{inCartMissingPriceItems.length > 1 ? 's' : ''}:
                </span>{' '}
                <span className="text-zinc-700 dark:text-zinc-200 font-medium">
                  {inCartMissingPriceItems.map(i => `${i.name}${i.brand ? ` [${i.brand}]` : ''}`).join(', ')}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMissingPricesModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-heading font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs whitespace-nowrap cursor-pointer self-end sm:self-auto"
            >
              <span>Fill {inCartMissingPriceItems.length} Price{inCartMissingPriceItems.length > 1 ? 's' : ''} Now</span>
            </button>
          </div>
        )}

        {/* Live Spend & Progress Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3">
          {/* Running Bill Counter */}
          <div className="col-span-2 sm:col-span-1 bg-zinc-50 dark:bg-black rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Running Cart Total</div>
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-blue-600 dark:text-blue-400">
              {currency}{totalRunningSpend.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span>Planned: {currency}{plannedInCartSpend.toLocaleString()}</span>
              {extrasSpend > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  + Extras: {currency}{extrasSpend.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Items Collected */}
          <div className="bg-zinc-50 dark:bg-black rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Items Collected</div>
            <div className="text-lg font-heading font-bold text-zinc-900 dark:text-white">
              {inCartItems.length} <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">of {items.length}</span>
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
              {progressPercent}% completed
            </div>
          </div>

          {/* Missed / Extras / Forgotten */}
          <div className="bg-zinc-50 dark:bg-black rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Missing / In-Store Added</div>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                {outOfStockItems.length} Missing
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                {inCartItems.filter(i => i.isImpulseBuy).length} Impulse
              </span>
              {inCartItems.filter(i => i.isForgottenEssential).length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  {inCartItems.filter(i => i.isForgottenEssential).length} Forgotten
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 bg-zinc-200 dark:bg-black rounded-full mt-3 overflow-hidden flex border border-zinc-300 dark:border-zinc-800">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
          {outOfStockItems.length > 0 && (
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${(outOfStockItems.length / items.length) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Slim Auto-Shrinking Sticky Header (Visible only when scrolled down) */}
      {isScrolled && (
        <div className="sticky top-16 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-md border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-150 transition-all">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Exit + Running Total + Extras Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                id="btn-slim-exit-run"
                onClick={onExitShopping}
                className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer flex-shrink-0"
                title="Exit Run"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 truncate">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 hidden sm:inline">Cart:</span>
                  <span className="text-base sm:text-lg font-heading font-extrabold text-blue-600 dark:text-blue-400">
                    {currency}{totalRunningSpend.toLocaleString()}
                  </span>
                </div>

                {extrasSpend > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold whitespace-nowrap">
                    +Extra: {currency}{extrasSpend.toLocaleString()}
                  </span>
                )}

                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  {inCartItems.length}/{items.length}
                </span>
              </div>
            </div>

            {/* Right: Missing price button + Finish Trip + Peek stats */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {inCartMissingPriceItems.length > 0 && (
                <button
                  onClick={() => setIsMissingPricesModalOpen(true)}
                  className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Fill missing prices"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span className="hidden sm:inline">{inCartMissingPriceItems.length} Need Price</span>
                  <span className="sm:hidden">{inCartMissingPriceItems.length}!</span>
                </button>
              )}

              <button
                id="btn-slim-finish-trip"
                onClick={handleAttemptFinishTrip}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1 ${
                  inCartMissingPriceItems.length > 0
                    ? 'bg-amber-400 hover:bg-amber-300 text-black ring-1 ring-amber-400/50'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Finish</span>
              </button>

              <button
                id="btn-toggle-slim-peek"
                onClick={() => setIsMiniExpanded(!isMiniExpanded)}
                className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                title={isMiniExpanded ? "Collapse stats" : "Peek full stats"}
              >
                {isMiniExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Pop-down drawer when user clicks peek button */}
          {isMiniExpanded && (
            <div className="mt-2.5 pt-2.5 border-t border-zinc-200 dark:border-zinc-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-850">
                  <div className="text-[10px] text-zinc-500 font-medium">Planned</div>
                  <div className="font-bold text-zinc-900 dark:text-white">{currency}{plannedInCartSpend.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-850">
                  <div className="text-[10px] text-zinc-500 font-medium">Extras</div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">{currency}{extrasSpend.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-850">
                  <div className="text-[10px] text-zinc-500 font-medium">Progress</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</div>
                </div>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden flex">
                <div className="bg-blue-500 h-full" style={{ width: `${progressPercent}%` }} />
                {outOfStockItems.length > 0 && (
                  <div className="bg-rose-500 h-full" style={{ width: `${(outOfStockItems.length / items.length) * 100}%` }} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold shadow-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          All Items ({items.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
            activeFilter === 'pending'
              ? 'bg-amber-500 text-black font-bold shadow-xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          ⏳ Pending ({pendingItems.length})
        </button>
        <button
          onClick={() => setActiveFilter('in_cart')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
            activeFilter === 'in_cart'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          ✅ In Cart ({inCartItems.length})
          {inCartMissingPriceItems.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-extrabold">
              !
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveFilter('out_of_stock')}
          className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
            activeFilter === 'out_of_stock'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          ❌ Out of Stock ({outOfStockItems.length})
        </button>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 sm:p-10 text-center border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <CheckCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white">
            {activeFilter === 'pending'
              ? 'All items collected! You are ready to checkout.'
              : 'No items in this filter view.'}
          </h3>
          {activeFilter === 'pending' && (
            <button
              onClick={handleAttemptFinishTrip}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Review & Finish Trip Summary
            </button>
          )}
        </div>
      ) : (
        /* Aisle Grouped Shopping Checklist */
        <div className="space-y-4">
          {groupedAisles.map(([categoryName, catItems]) => {
            const isCollapsed = !!collapsedAisles[categoryName];
            const catMeta = CATEGORIES.find((c) => c.name === categoryName);
            const catInCart = catItems.filter((i) => i.status === 'in_cart').length;
            const catMissingPrice = catItems.filter((i) => i.status === 'in_cart' && isItemMissingPrice(i)).length;

            return (
              <div
                key={categoryName}
                className={`bg-white dark:bg-zinc-950 rounded-2xl border shadow-xs overflow-hidden transition-all ${
                  catMissingPrice > 0
                    ? 'border-amber-400 dark:border-amber-700/80 ring-1 ring-amber-400/20'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {/* Aisle Banner Header */}
                <div
                  onClick={() => toggleAisleCollapse(categoryName)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors border-b border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-heading font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                      {categoryName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                      {catInCart}/{catItems.length}
                    </span>
                    {catMissingPrice > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                        ⚠️ {catMissingPrice} need price
                      </span>
                    )}
                  </div>

                  <div className="text-zinc-500">
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </div>

                {/* Items in Aisle */}
                {!isCollapsed && (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {catItems.map((item) => {
                      const isCart = item.status === 'in_cart';
                      const isMissed = item.status === 'out_of_stock';
                      const isPending = item.status === 'pending';
                      const isMissingPrice = isCart && isItemMissingPrice(item);
                      const currentPrice = item.actualPrice ?? item.estimatedPrice;
                      const hasValidPrice = currentPrice !== undefined && currentPrice !== null && !isNaN(Number(currentPrice)) && Number(currentPrice) > 0;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 sm:p-4 transition-all ${
                            isMissingPrice
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-l-4 border-amber-500'
                              : isCart
                              ? 'bg-zinc-50/80 dark:bg-zinc-950/60 opacity-80'
                              : isMissed
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-l-2 border-rose-500'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`text-base font-bold tracking-tight text-zinc-900 dark:text-white ${
                                    isCart ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                                  }`}
                                >
                                  {item.name}
                                </span>

                                {item.brand && (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                                    {item.brand}
                                  </span>
                                )}

                                {item.isImpulseBuy && (
                                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                                    <Zap className="w-3 h-3 fill-current" />
                                    <span>Extra / Impulse</span>
                                  </span>
                                )}

                                {item.isForgottenEssential && (
                                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1">
                                    <ClipboardList className="w-3 h-3" />
                                    <span>Forgotten Essential</span>
                                  </span>
                                )}

                                {isMissingPrice && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black text-xs font-heading font-extrabold animate-pulse">
                                    ⚠️ Price Required
                                  </span>
                                )}
                              </div>

                              {/* Measurement & Notes */}
                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md text-[11px]">
                                  {item.weightValue ? `${item.weightValue} ${item.weightUnit}` : item.weightUnit}
                                  {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                                </span>

                                {/* Live Price Editor / Badge */}
                                {editingPriceItemId === item.id ? (
                                  <div className="flex items-center gap-1 bg-white dark:bg-black p-1 rounded-xl border border-blue-500 shadow-xs">
                                    <span className="text-zinc-400 dark:text-zinc-500 font-bold ml-1">{currency}</span>
                                    <input
                                      type="number"
                                      step="any"
                                      min="0.01"
                                      value={tempPrice}
                                      onChange={(e) => setTempPrice(e.target.value)}
                                      placeholder="0.00"
                                      className="w-20 h-7 px-1.5 text-xs font-bold rounded bg-zinc-50 dark:bg-zinc-900 border border-blue-500 text-zinc-900 dark:text-white focus:outline-none"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSavePrice(item.id);
                                        if (e.key === 'Escape') setEditingPriceItemId(null);
                                      }}
                                    />
                                    <button
                                      onClick={() => handleSavePrice(item.id)}
                                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold cursor-pointer"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : hasValidPrice ? (
                                  <button
                                    onClick={() => {
                                      setEditingPriceItemId(item.id);
                                      setTempPrice(String(currentPrice));
                                    }}
                                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/60 cursor-pointer"
                                    title="Click to adjust actual shelf price"
                                  >
                                    <span>{currency}{(Number(currentPrice) * item.quantity).toLocaleString()}</span>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                                      (Tap to edit)
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingPriceItemId(item.id);
                                      setTempPrice('');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-heading font-extrabold shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Enter Shelf Price</span>
                                  </button>
                                )}
                              </div>

                              {/* Backup Brand note */}
                              {item.fallbackAlternative && !isCart && (
                                <div className="mt-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded border border-amber-200 dark:border-amber-900/50">
                                  <strong className="font-semibold">Backup Brand:</strong> {item.fallbackAlternative}
                                </div>
                              )}
                            </div>

                            {/* 3-Way Store Action Buttons (Large Touch Area) */}
                            <div className="flex items-center gap-2 pt-2 sm:pt-0">
                              {/* 1. In Cart Button */}
                              <button
                                id={`shop-btn-in-cart-${item.id}`}
                                onClick={() => handleMarkInCart(item)}
                                className={`flex-1 sm:flex-initial h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl text-xs font-heading font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  isCart
                                    ? isMissingPrice
                                      ? 'bg-amber-500 text-black shadow-xs'
                                      : 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-blue-500'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isCart ? 'In Cart' : 'Put in Cart'}</span>
                              </button>

                              {/* 2. Out of Stock Button */}
                              <button
                                id={`shop-btn-out-of-stock-${item.id}`}
                                onClick={() => handleMarkOutOfStock(item)}
                                className={`h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  isMissed
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60'
                                }`}
                                title="Mark item as missing / out of stock"
                              >
                                <XCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Missing</span>
                              </button>

                              {/* Undo / Revert if not pending */}
                              {!isPending && (
                                <button
                                  onClick={() => onUpdateItem(item.id, { status: 'pending' })}
                                  className="h-10 sm:h-11 w-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                                  title="Reset to pending"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Instant "+ Extra / Forgotten Item" Action Button */}
      <div className="fixed bottom-16 sm:bottom-8 right-3 sm:right-8 z-40">
        <button
          id="btn-floating-impulse-buy"
          onClick={() => setIsImpulseModalOpen(true)}
          className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white font-heading font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 sm:gap-2.5 cursor-pointer border border-white/20"
          title="Instantly log an impulse purchase or forgotten essential in the aisles"
        >
          <div className="flex items-center -space-x-0.5">
            <Zap className="w-4 h-4 fill-current text-amber-200" />
            <ClipboardList className="w-3.5 h-3.5 text-indigo-200" />
          </div>
          <span>+ Extra / Forgotten Item</span>
        </button>
      </div>

      {/* Missing Prices Modal */}
      <MissingPricesModal
        isOpen={isMissingPricesModalOpen}
        onClose={() => setIsMissingPricesModalOpen(false)}
        missingItems={inCartMissingPriceItems}
        onSavePrices={handleSaveMissingPrices}
        currency={currency}
      />

      {/* Impulse Modal */}
      <ImpulseBuyModal
        isOpen={isImpulseModalOpen}
        onClose={() => setIsImpulseModalOpen(false)}
        onAddImpulseItem={onAddItem}
        currency={currency}
      />

      {/* Fallback Alert Modal */}
      <FallbackAlertModal
        isOpen={!!fallbackModalItem}
        onClose={() => setFallbackModalItem(null)}
        item={fallbackModalItem}
        onSwapWithFallback={handleSwapWithFallback}
        onConfirmOutOfStock={handleConfirmOutOfStock}
      />
    </div>
  );
};

