import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  Check, 
  Search, 
  Layers, 
  Calendar, 
  Trash2, 
  Edit3, 
  Scale, 
  DollarSign, 
  ArrowRightLeft, 
  CheckCheck,
  RotateCcw
} from 'lucide-react';
import { PantryStaple, GroceryCategory, WeightUnit } from '../types';
import { CATEGORIES, WEIGHT_UNITS } from '../data/categories';

interface PantryStaplesViewProps {
  staples: PantryStaple[];
  onAddStapleToActiveList: (staple: PantryStaple) => void;
  onAddMultipleStaples: (staples: PantryStaple[]) => void;
  onSaveCustomStaple: (staple: PantryStaple) => void;
  onDeleteStaple: (id: string) => void;
  onResetDefaultStaples: () => void;
  currency: string;
}

export const PantryStaplesView: React.FC<PantryStaplesViewProps> = ({
  staples,
  onAddStapleToActiveList,
  onAddMultipleStaples,
  onSaveCustomStaple,
  onDeleteStaple,
  onResetDefaultStaples,
  currency,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'weekly' | 'monthly' | 'biweekly'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [addedFeedback, setAddedFeedback] = useState<Record<string, boolean>>({});

  // Custom staple form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaple, setEditingStaple] = useState<PantryStaple | null>(null);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weightValue, setWeightValue] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');
  const [category, setCategory] = useState<GroceryCategory>('Grains & Pulses');
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'as_needed'>('monthly');
  const [fallbackAlternative, setFallbackAlternative] = useState('');

  // Filter staples
  const filteredStaples = useMemo(() => {
    return staples.filter((staple) => {
      const matchSearch =
        staple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staple.brand && staple.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (staple.fallbackAlternative && staple.fallbackAlternative.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchFreq = frequencyFilter === 'all' || staple.frequency === frequencyFilter;
      const matchCat = categoryFilter === 'all' || staple.category === categoryFilter;

      return matchSearch && matchFreq && matchCat;
    });
  }, [staples, searchQuery, frequencyFilter, categoryFilter]);

  const weeklyStaples = useMemo(() => staples.filter((s) => s.frequency === 'weekly'), [staples]);
  const monthlyStaples = useMemo(() => staples.filter((s) => s.frequency === 'monthly'), [staples]);

  const handleAddSingle = (staple: PantryStaple) => {
    onAddStapleToActiveList(staple);
    setAddedFeedback((prev) => ({ ...prev, [staple.id]: true }));
    setTimeout(() => {
      setAddedFeedback((prev) => ({ ...prev, [staple.id]: false }));
    }, 1500);
  };

  const handleOpenModal = (staple?: PantryStaple) => {
    if (staple) {
      setEditingStaple(staple);
      setName(staple.name);
      setBrand(staple.brand || '');
      setQuantity(staple.defaultQuantity || 1);
      setWeightValue(staple.weightValue !== undefined ? String(staple.weightValue) : '');
      setWeightUnit(staple.weightUnit || 'kg');
      setEstimatedPrice(staple.estimatedPrice !== undefined ? String(staple.estimatedPrice) : '');
      setCategory(staple.category);
      setFrequency(staple.frequency);
      setFallbackAlternative(staple.fallbackAlternative || '');
    } else {
      setEditingStaple(null);
      setName('');
      setBrand('');
      setQuantity(1);
      setWeightValue('');
      setWeightUnit('kg');
      setEstimatedPrice('');
      setCategory('Grains & Pulses');
      setFrequency('monthly');
      setFallbackAlternative('');
    }
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveCustomStaple({
      id: editingStaple ? editingStaple.id : `staple-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || undefined,
      defaultQuantity: Math.max(1, quantity),
      weightValue: weightValue ? parseFloat(weightValue) : undefined,
      weightUnit,
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      category,
      frequency,
      fallbackAlternative: fallbackAlternative.trim() || undefined,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-black rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-zinc-800 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-xs font-semibold border border-white/10">
              Master Pantry Catalog
            </span>
            <span className="text-xs text-blue-300">{staples.length} recurring essentials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            1-Click Staples & Monthly Re-Orders
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
            Never re-type standard household groceries. Tap to instantly populate your weekly dairy or monthly pantry run!
          </p>
        </div>

        {/* Quick Bulk Load Actions */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
          <button
            onClick={() => onAddMultipleStaples(weeklyStaples)}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Add all milk, bread, eggs, and veggies"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>+ All Weekly ({weeklyStaples.length})</span>
          </button>

          <button
            onClick={() => onAddMultipleStaples(monthlyStaples)}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-blue-600 text-white font-heading font-bold text-xs shadow-md hover:bg-blue-500 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Add all atta, rice, oil, pulses, spices, and detergents"
          >
            <CheckCheck className="w-4 h-4 text-white" />
            <span>+ All Monthly ({monthlyStaples.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-white dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staples library (e.g. Atta, Oil, Milk, Rice)..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Frequency filter */}
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value as any)}
              className="h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Frequencies ({staples.length})</option>
              <option value="weekly">📅 Weekly ({weeklyStaples.length})</option>
              <option value="monthly">🗓️ Monthly ({monthlyStaples.length})</option>
            </select>

            <button
              onClick={() => handleOpenModal()}
              className="h-10 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Custom Staple</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-850'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => {
            const count = staples.filter((s) => s.category === cat.name).length;
            if (count === 0 && categoryFilter !== cat.name) return null;
            return (
              <button
                key={cat.name}
                onClick={() => setCategoryFilter(cat.name)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  categoryFilter === cat.name
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-850'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Staples Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStaples.map((staple) => {
          const isAdded = !!addedFeedback[staple.id];

          return (
            <div
              key={staple.id}
              className="bg-white dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                      {staple.name}
                    </h4>
                    {staple.brand && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {staple.brand}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      staple.frequency === 'weekly'
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    {staple.frequency}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded font-medium text-zinc-800 dark:text-zinc-200 text-[11px]">
                    {staple.weightValue ? `${staple.weightValue} ${staple.weightUnit}` : staple.weightUnit}
                    {staple.defaultQuantity > 1 ? ` × ${staple.defaultQuantity}` : ''}
                  </span>

                  {staple.estimatedPrice && (
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      ~ {currency}{staple.estimatedPrice * staple.defaultQuantity}
                    </span>
                  )}
                </div>

                {staple.fallbackAlternative && (
                  <div className="mt-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-md border border-amber-200 dark:border-amber-900/40">
                    <strong>Alt:</strong> {staple.fallbackAlternative}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                  <button
                    onClick={() => handleOpenModal(staple)}
                    className="p-1 hover:text-zinc-900 dark:hover:text-zinc-200 rounded cursor-pointer"
                    title="Edit staple"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${staple.name} from staples?`)) {
                        onDeleteStaple(staple.id);
                      }
                    }}
                    className="p-1 hover:text-rose-500 rounded cursor-pointer"
                    title="Delete staple"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleAddSingle(staple)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer ${
                    isAdded
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-blue-600 dark:hover:bg-blue-600 text-zinc-700 dark:text-zinc-200 hover:text-white dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAdded ? 'Added!' : '+ Add to List'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset to Defaults option */}
      <div className="text-center pt-4">
        <button
          onClick={() => {
            if (window.confirm('Reset staples catalog back to factory defaults?')) {
              onResetDefaultStaples();
            }
          }}
          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset staples library to defaults</span>
        </button>
      </div>

      {/* Custom Staple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div 
            className="bg-white dark:bg-zinc-950 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-heading font-bold text-zinc-900 dark:text-white mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              {editingStaple ? 'Edit Household Staple' : 'Create Custom Staple'}
            </h3>

            <form onSubmit={handleSubmitModal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Staple Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sona Masoori Rice, Oat Milk"
                  className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Organic Tattva"
                    className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Default Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full h-9 px-2 text-center rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Weight/Vol
                  </label>
                  <input
                    type="number"
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    placeholder="1, 5, 500"
                    className="w-full h-9 px-2 text-center rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Unit
                  </label>
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                    className="w-full h-9 px-1 rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white cursor-pointer"
                  >
                    {WEIGHT_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.short}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GroceryCategory)}
                    className="w-full h-10 px-2 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Est. Price ({currency})
                  </label>
                  <input
                    type="number"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Backup Brand Alternative
                </label>
                <input
                  type="text"
                  value={fallbackAlternative}
                  onChange={(e) => setFallbackAlternative(e.target.value)}
                  placeholder="e.g. If brand A is out of stock, buy brand B"
                  className="w-full h-9 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Staple
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
