import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, SlidersHorizontal, ArrowRight, CornerDownLeft, Edit2 } from 'lucide-react';
import { GroceryItem } from '../types';
import { parseGroceryInput } from '../utils/nlpParser';

interface QuickAddBarProps {
  onAddItem: (item: Partial<GroceryItem>) => void;
  onOpenDetailedModal: (initialValues?: Partial<GroceryItem>) => void;
  currency: string;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  onAddItem,
  onOpenDetailedModal,
  currency,
}) => {
  const [input, setInput] = useState('');

  // Live parsed preview as user types
  const parsedPreview = useMemo(() => {
    if (!input.trim() || input.trim().length < 2) return null;
    return parseGroceryInput(input);
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = parseGroceryInput(input);
    onAddItem({
      name: parsed.name,
      brand: parsed.brand,
      quantity: parsed.quantity,
      weightValue: parsed.weightValue,
      weightUnit: parsed.weightUnit,
      estimatedPrice: parsed.estimatedPrice,
      category: parsed.category,
      fallbackAlternative: parsed.fallbackAlternative,
      status: 'pending',
    });

    setInput('');
  };

  const handleOpenDetails = () => {
    if (input.trim()) {
      const parsed = parseGroceryInput(input);
      onOpenDetailedModal({
        name: parsed.name,
        brand: parsed.brand,
        quantity: parsed.quantity,
        weightValue: parsed.weightValue,
        weightUnit: parsed.weightUnit,
        estimatedPrice: parsed.estimatedPrice,
        category: parsed.category,
        fallbackAlternative: parsed.fallbackAlternative,
      });
      setInput('');
    } else {
      onOpenDetailedModal();
    }
  };

  const quickPills = [
    'Amul Butter 500g',
    'Aashirvaad Atta 5kg',
    'Eggs 1 dozen',
    'Fortune Oil 1L',
    'Milk 2L',
    'Red Onions 2kg',
    'Vim Gel 750ml',
    'Tata Tea 500g',
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl p-3.5 sm:p-5 shadow-xs dark:shadow-md border border-zinc-200 dark:border-zinc-800 transition-all">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Input Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <input
            id="input-quick-add-grocery"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Smart Quick Add: e.g. "Amul butter 500g ₹120"'
            className="w-full h-11 sm:h-12 pl-10 sm:pl-11 pr-28 sm:pr-36 md:pr-40 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all"
          />

          <div className="absolute right-1.5 sm:right-2 flex items-center gap-1 sm:gap-1.5">
            <button
              id="btn-open-detailed-modal"
              type="button"
              onClick={handleOpenDetails}
              className={`h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                input.trim()
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800'
              }`}
              title={input.trim() ? `Open details pre-filled with "${input.trim()}"` : "Open full item details modal"}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Details</span>
            </button>

            <button
              id="btn-submit-quick-add"
              type="submit"
              disabled={!input.trim()}
              className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap ${
                input.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  : 'bg-zinc-200 dark:bg-zinc-850 cursor-not-allowed opacity-50 text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <span>Add</span>
              <CornerDownLeft className="w-3 h-3 hidden sm:inline" />
            </button>
          </div>
        </div>

        {/* Live NLP Smart Detection Preview */}
        {parsedPreview && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-blue-600 dark:text-blue-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                Auto-detected:
              </span>
              <span className="font-bold text-zinc-900 dark:text-white bg-white dark:bg-black px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                {parsedPreview.name}
              </span>
              {parsedPreview.brand && (
                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/80">
                  🏷️ {parsedPreview.brand}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/60">
                📦 {parsedPreview.quantity} × {parsedPreview.weightValue ? `${parsedPreview.weightValue}${parsedPreview.weightUnit}` : parsedPreview.weightUnit}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                📁 {parsedPreview.category}
              </span>
              {parsedPreview.estimatedPrice && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/80">
                  💰 {currency}{parsedPreview.estimatedPrice}
                </span>
              )}
              {parsedPreview.fallbackAlternative && (
                <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800/60">
                  ↪️ Alt: {parsedPreview.fallbackAlternative}
                </span>
              )}
            </div>

            {/* Quick action to edit before adding */}
            <button
              type="button"
              onClick={handleOpenDetails}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer bg-white dark:bg-zinc-800 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-2xs"
            >
              <Edit2 className="w-3 h-3" />
              <span>Customize Specs</span>
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs no-scrollbar">
          <span className="text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap text-[11px]">
            Suggestions:
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => {
                const parsed = parseGroceryInput(pill);
                onAddItem({
                  name: parsed.name,
                  brand: parsed.brand,
                  quantity: parsed.quantity,
                  weightValue: parsed.weightValue,
                  weightUnit: parsed.weightUnit,
                  estimatedPrice: parsed.estimatedPrice,
                  category: parsed.category,
                  status: 'pending',
                });
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-black text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors font-medium text-[11px] cursor-pointer"
            >
              + {pill}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
