import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  XCircle, 
  Edit3, 
  Trash2, 
  Copy, 
  Plus, 
  Play, 
  Search, 
  Filter, 
  Layers, 
  List, 
  ArrowRightLeft, 
  DollarSign, 
  Sparkles, 
  MoreVertical, 
  Share2, 
  FileSpreadsheet, 
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { GroceryItem, GroceryCategory, ItemStatus } from '../types';
import { CATEGORIES } from '../data/categories';
import { QuickAddBar } from './QuickAddBar';

interface ActiveListViewProps {
  items: GroceryItem[];
  onAddItem: (item: Partial<GroceryItem>) => void;
  onUpdateItem: (id: string, updates: Partial<GroceryItem>) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (item: GroceryItem) => void;
  onOpenDetailedModal: (itemOrInitial?: GroceryItem | Partial<GroceryItem>) => void;
  onStartShopping: () => void;
  onOpenShare: () => void;
  onAddStaples: () => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
  currency: string;
}

export const ActiveListView: React.FC<ActiveListViewProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onOpenDetailedModal,
  onStartShopping,
  onOpenShare,
  onAddStaples,
  onClearCompleted,
  onClearAll,
  currency,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_cart' | 'out_of_stock'>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.fallbackAlternative && item.fallbackAlternative.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchSearch && matchCat && matchStatus;
    });
  }, [items, searchQuery, selectedCategory, statusFilter]);

  // Group items by category for grouped view
  const groupedItems = useMemo(() => {
    const map = new Map<GroceryCategory, GroceryItem[]>();
    CATEGORIES.forEach((c) => map.set(c.name, []));

    filteredItems.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });

    return Array.from(map.entries()).filter(([_, list]) => list.length > 0);
  }, [filteredItems]);

  // Spend calculations
  const totalEstimated = useMemo(() => {
    return items.reduce((sum, i) => sum + (i.estimatedPrice ? i.estimatedPrice * i.quantity : 0), 0);
  }, [items]);

  const inCartCount = items.filter((i) => i.status === 'in_cart').length;
  const outOfStockCount = items.filter((i) => i.status === 'out_of_stock').length;
  const pendingCount = items.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner / Metrics Overview */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl p-4 sm:p-6 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-xs dark:shadow-xl relative overflow-hidden transition-colors">
        {/* Subtle decorative glow */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-24 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
                Active Grocery Plan
              </span>
              {items.length > 0 && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {inCartCount} of {items.length} items collected
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {totalEstimated > 0 ? (
                <span>
                  Est. {currency}{totalEstimated.toLocaleString()}{' '}
                  <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 font-sans">
                    ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </span>
                </span>
              ) : (
                <span>{items.length} Items on List</span>
              )}
            </h2>
          </div>

          {/* Quick Start Shopping Mode Action */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <button
              id="btn-quick-staples"
              onClick={onAddStaples}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Load standard recurring household items into this list"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>+ Add Staples</span>
            </button>

            <button
              id="btn-start-shopping-hero"
              onClick={onStartShopping}
              className="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs sm:text-sm shadow-md sm:shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Enter In-Store Mode</span>
            </button>
          </div>
        </div>

        {/* In-Cart Progress Meter */}
        {items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">
              <span>Shopping Progress</span>
              <span>
                {Math.round((inCartCount / items.length) * 100)}% ({inCartCount}/{items.length} In Cart)
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden flex border border-zinc-200 dark:border-zinc-800">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${(inCartCount / items.length) * 100}%` }}
              />
              {outOfStockCount > 0 && (
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${(outOfStockCount / items.length) * 100}%` }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Smart Quick Add Bar */}
      <QuickAddBar
        onAddItem={onAddItem}
        onOpenDetailedModal={onOpenDetailedModal}
        currency={currency}
      />

      {/* Controls Bar: Search, Category Filter, View Mode & Bulk Actions */}
      <div className="space-y-3 bg-white dark:bg-zinc-950 rounded-2xl p-3.5 sm:p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400 dark:text-zinc-500" />
            <input
              id="input-search-items"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, brands, or alternatives..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status & View Mode Switches */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 sm:flex-none h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses ({items.length})</option>
              <option value="pending">⏳ Pending ({pendingCount})</option>
              <option value="in_cart">✅ In Cart ({inCartCount})</option>
              <option value="out_of_stock">❌ Out of Stock ({outOfStockCount})</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-100 dark:bg-black p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              <button
                onClick={() => setViewMode('grouped')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                title="Group items by store aisle / category"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'flat'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                title="Compact flat list"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Horizontal Scroll Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-black text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80'
            }`}
          >
            All Categories ({items.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat.name).length;
            if (count === 0 && selectedCategory !== cat.name) return null;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-zinc-100 dark:bg-black text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[11px] opacity-75 font-bold">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">
            Showing {filteredItems.length} of {items.length} items
          </span>

          <div className="flex items-center gap-2">
            {inCartCount > 0 && (
              <button
                id="btn-clear-completed"
                onClick={onClearCompleted}
                className="px-2.5 py-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium transition-colors cursor-pointer"
                title="Remove purchased items from this list"
              >
                Clear In-Cart ({inCartCount})
              </button>
            )}

            {items.length > 0 && (
              <button
                id="btn-clear-all"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all items from the list?')) {
                    onClearAll();
                  }
                }}
                className="px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors border border-rose-200 dark:border-rose-900/40 cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Items List Content */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 sm:p-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <CheckCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-zinc-900 dark:text-white">
              {items.length === 0 ? 'Your Grocery List is Empty' : 'No matching items found'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              {items.length === 0
                ? 'Type in the quick add bar above or tap "+ Add Staples" to build your monthly pantry list in 1 click.'
                : 'Try clearing your search query or switching category filter.'}
            </p>
          </div>

          {items.length === 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={onAddStaples}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Load Household Staples</span>
              </button>
              <button
                onClick={() => onOpenDetailedModal()}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
              >
                + Add Custom Item
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'grouped' ? (
        /* Grouped View (Aisles / Categories) */
        <div className="space-y-5">
          {groupedItems.map(([categoryName, catItems]) => {
            const catMeta = CATEGORIES.find((c) => c.name === categoryName);
            const catEstimated = catItems.reduce(
              (sum, i) => sum + (i.estimatedPrice ? i.estimatedPrice * i.quantity : 0),
              0
            );

            return (
              <div
                key={categoryName}
                className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs"
              >
                {/* Category Header */}
                <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-heading font-bold text-sm text-zinc-900 dark:text-white">
                      {categoryName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                      {catItems.length}
                    </span>
                  </div>

                  {catEstimated > 0 && (
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Est. {currency}{catEstimated.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Items in Category */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {catItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onUpdateItem={onUpdateItem}
                      onDeleteItem={onDeleteItem}
                      onDuplicateItem={onDuplicateItem}
                      onOpenDetailedModal={onOpenDetailedModal}
                      currency={currency}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Compact List */
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs divide-y divide-zinc-100 dark:divide-zinc-900">
          {filteredItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onDuplicateItem={onDuplicateItem}
              onOpenDetailedModal={onOpenDetailedModal}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ItemRowProps {
  item: GroceryItem;
  onUpdateItem: (id: string, updates: Partial<GroceryItem>) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (item: GroceryItem) => void;
  onOpenDetailedModal: (item?: GroceryItem) => void;
  currency: string;
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onOpenDetailedModal,
  currency,
}) => {
  const isPurchased = item.status === 'in_cart';
  const isMissing = item.status === 'out_of_stock';

  const toggleStatus = () => {
    if (item.status === 'pending') {
      onUpdateItem(item.id, { status: 'in_cart', collectedAt: new Date().toISOString() });
    } else if (item.status === 'in_cart') {
      onUpdateItem(item.id, { status: 'pending', collectedAt: undefined });
    } else {
      onUpdateItem(item.id, { status: 'pending' });
    }
  };

  return (
    <div
      className={`p-3.5 sm:p-4 flex items-start sm:items-center justify-between gap-3 transition-colors ${
        isPurchased
          ? 'bg-zinc-50/80 dark:bg-zinc-950/70 opacity-75'
          : isMissing
          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-l-2 border-rose-500'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
      }`}
    >
      {/* Left: Checkbox & Info */}
      <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
        <button
          id={`btn-toggle-status-${item.id}`}
          onClick={toggleStatus}
          className="mt-0.5 sm:mt-0 text-zinc-400 hover:text-blue-500 transition-colors flex-shrink-0 cursor-pointer"
          title={isPurchased ? 'Mark as Pending' : 'Mark as In Cart'}
        >
          {isPurchased ? (
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-50 dark:fill-blue-950" />
          ) : isMissing ? (
            <XCircle className="w-5 h-5 text-rose-500" />
          ) : (
            <Circle className="w-5 h-5 text-zinc-400 dark:text-zinc-600 hover:text-blue-500" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`font-semibold text-sm sm:text-base text-zinc-900 dark:text-white truncate ${
                isPurchased ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
              }`}
            >
              {item.name}
            </span>

            {/* Brand Badge */}
            {item.brand && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold text-[11px] border border-blue-200 dark:border-blue-800/80">
                {item.brand}
              </span>
            )}

            {/* Impulse buy tag */}
            {item.isImpulseBuy && (
              <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800/60">
                ⚡ Extra
              </span>
            )}

            {/* Forgotten Essential tag */}
            {item.isForgottenEssential && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800/60">
                📝 Forgotten
              </span>
            )}
          </div>

          {/* Badges: Weight, Quantity, Category, Est. Price */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {/* Weight & Unit */}
            <span className="font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
              {item.weightValue ? `${item.weightValue} ${item.weightUnit}` : item.weightUnit}
              {item.quantity > 1 ? ` × ${item.quantity}` : ''}
            </span>

            {/* Price */}
            {item.estimatedPrice && (
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {currency}{(item.estimatedPrice * item.quantity).toLocaleString()}
                {item.quantity > 1 && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal ml-0.5">
                    ({currency}{item.estimatedPrice}/ea)
                  </span>
                )}
              </span>
            )}

            {/* Notes */}
            {item.notes && (
              <span className="text-[11px] italic text-zinc-400 dark:text-zinc-500 truncate max-w-xs">
                "{item.notes}"
              </span>
            )}
          </div>

          {/* Fallback Alternative Reminder */}
          {item.fallbackAlternative && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60 max-w-fit">
              <ArrowRightLeft className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>
                <strong className="font-semibold">Fallback:</strong> {item.fallbackAlternative}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Quantity Adjuster & Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Quantity quick adjuster */}
        <div className="flex items-center h-8 rounded-lg bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            onClick={() => onUpdateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
            className="w-6 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-l-lg font-bold cursor-pointer"
            title="Decrease quantity"
          >
            -
          </button>
          <span className="px-2 font-bold text-zinc-900 dark:text-white">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateItem(item.id, { quantity: item.quantity + 1 })}
            className="w-6 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-900 rounded-r-lg font-bold cursor-pointer"
            title="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => onOpenDetailedModal(item)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          title="Edit item specifications"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Duplicate Button */}
        <button
          onClick={() => onDuplicateItem(item)}
          className="hidden sm:block p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          title="Duplicate item"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDeleteItem(item.id)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          title="Delete item from list"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
