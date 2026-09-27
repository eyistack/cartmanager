import React, { useState } from 'react';
import { X, Zap, ClipboardList, Check } from 'lucide-react';
import { GroceryItem, GroceryCategory, WeightUnit } from '../types';
import { CATEGORIES, WEIGHT_UNITS } from '../data/categories';

interface ImpulseBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImpulseItem: (item: Partial<GroceryItem>) => void;
  currency: string;
}

type InStoreItemType = 'impulse' | 'forgotten';

export const ImpulseBuyModal: React.FC<ImpulseBuyModalProps> = ({
  isOpen,
  onClose,
  onAddImpulseItem,
  currency,
}) => {
  const [itemType, setItemType] = useState<InStoreItemType>('impulse');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weightValue, setWeightValue] = useState<string>('1');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('packet');
  const [category, setCategory] = useState<GroceryCategory>('Snacks & Drinks');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleTypeChange = (type: InStoreItemType) => {
    setItemType(type);
    if (type === 'forgotten') {
      if (category === 'Snacks & Drinks') setCategory('Grains & Pulses');
      setWeightUnit('kg');
    } else {
      if (category === 'Grains & Pulses') setCategory('Snacks & Drinks');
      setWeightUnit('packet');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const actualCost = price ? parseFloat(price) : 0;
    const isImpulse = itemType === 'impulse';
    const isForgotten = itemType === 'forgotten';

    onAddImpulseItem({
      name: name.trim(),
      quantity: Math.max(1, quantity),
      weightValue: weightValue ? parseFloat(weightValue) : undefined,
      weightUnit,
      estimatedPrice: actualCost,
      actualPrice: actualCost,
      category,
      isImpulseBuy: isImpulse,
      isForgottenEssential: isForgotten,
      status: 'in_cart',
      notes: notes.trim() || (isImpulse ? 'Unplanned impulse buy in aisle' : 'Forgotten regular essential added in-store'),
      addedAt: new Date().toISOString(),
      collectedAt: new Date().toISOString(),
    });

    // Reset & close
    setName('');
    setPrice('');
    setQuantity(1);
    setWeightValue('1');
    setWeightUnit('packet');
    setCategory('Snacks & Drinks');
    setNotes('');
    onClose();
  };

  const quickImpulsePresets = [
    { label: 'Chocolate Bar', price: '60', cat: 'Snacks & Drinks' as GroceryCategory, unit: 'packet' as WeightUnit, val: '1' },
    { label: 'Potato Chips', price: '30', cat: 'Snacks & Drinks' as GroceryCategory, unit: 'packet' as WeightUnit, val: '1' },
    { label: 'Cold Drink / Juice', price: '45', cat: 'Snacks & Drinks' as GroceryCategory, unit: 'bottle' as WeightUnit, val: '1' },
    { label: 'Biscuits / Cookies', price: '40', cat: 'Snacks & Drinks' as GroceryCategory, unit: 'packet' as WeightUnit, val: '1' },
    { label: 'Chewing Gum / Mints', price: '20', cat: 'Snacks & Drinks' as GroceryCategory, unit: 'packet' as WeightUnit, val: '1' },
    { label: 'Bakery Pastry / Cake', price: '80', cat: 'Bakery & Frozen' as GroceryCategory, unit: 'piece' as WeightUnit, val: '1' },
  ];

  const quickForgottenPresets = [
    { label: 'Biryani / Basmati Rice', price: '160', cat: 'Grains & Pulses' as GroceryCategory, unit: 'kg' as WeightUnit, val: '1' },
    { label: 'Badam Milk / Milk Bottle', price: '40', cat: 'Dairy & Eggs' as GroceryCategory, unit: 'bottle' as WeightUnit, val: '1' },
    { label: 'Milk Packet', price: '35', cat: 'Dairy & Eggs' as GroceryCategory, unit: 'packet' as WeightUnit, val: '1' },
    { label: 'Cooking Oil / Ghee', price: '180', cat: 'Spices & Oils' as GroceryCategory, unit: 'L' as WeightUnit, val: '1' },
    { label: 'Eggs (6 pack)', price: '50', cat: 'Dairy & Eggs' as GroceryCategory, unit: 'box' as WeightUnit, val: '1' },
    { label: 'Bread / Pav', price: '40', cat: 'Bakery & Frozen' as GroceryCategory, unit: 'packet' as WeightUnit, val: '1' },
  ];

  const activePresets = itemType === 'impulse' ? quickImpulsePresets : quickForgottenPresets;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
      <div 
        className={`bg-white dark:bg-zinc-950 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border transition-colors max-h-[92vh] overflow-y-auto ${
          itemType === 'impulse'
            ? 'border-amber-300 dark:border-amber-800/80 shadow-amber-500/10'
            : 'border-indigo-300 dark:border-indigo-800/80 shadow-indigo-500/10'
        } animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div 
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                itemType === 'impulse'
                  ? 'bg-amber-500 text-white dark:text-black'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {itemType === 'impulse' ? (
                <Zap className="w-5 h-5 fill-current" />
              ) : (
                <ClipboardList className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-zinc-900 dark:text-white">
                {itemType === 'impulse' ? 'Log Extra / Impulse Buy' : 'Add Forgotten Essential'}
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {itemType === 'impulse' 
                  ? 'Tracks spontaneous cravings as extras' 
                  : 'Keeps impulse stats clean for regular necessities'}
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

        {/* Dual Type Switcher */}
        <div className="mt-3.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl grid grid-cols-2 gap-1 border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => handleTypeChange('impulse')}
            className={`py-2 px-2.5 rounded-xl text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              itemType === 'impulse'
                ? 'bg-amber-500 text-black shadow-sm ring-1 ring-amber-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Impulse / Treat</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('forgotten')}
            className={`py-2 px-2.5 rounded-xl text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              itemType === 'forgotten'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Forgotten Item</span>
          </button>
        </div>

        {/* Context explanation pill */}
        <div 
          className={`mt-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border flex items-center gap-1.5 ${
            itemType === 'impulse'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/60'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-900/60'
          }`}
        >
          <span className="font-bold">
            {itemType === 'impulse' ? '⚡ Extra Spend:' : '📝 Essential Spend:'}
          </span>
          <span>
            {itemType === 'impulse'
              ? 'Will show as "Extras / Impulse" spend in reports.'
              : 'Will count as regular household groceries (NOT an impulse penalty).'}
          </span>
        </div>

        {/* Quick Presets */}
        <div className="mt-3">
          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            {itemType === 'impulse' ? 'Common Impulse Presets' : 'Common Forgotten Presets'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {activePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setName(preset.label);
                  setPrice(preset.price);
                  setCategory(preset.cat);
                  setWeightUnit(preset.unit);
                  setWeightValue(preset.val);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  itemType === 'impulse'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                }`}
              >
                {preset.label} ({currency}{preset.price})
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mt-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Item Name *
            </label>
            <input
              id="input-instore-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={itemType === 'impulse' ? 'e.g. Ice Cream Tub, Snack Bar' : 'e.g. Biryani Rice, Badam Milk, Curd'}
              className={`w-full h-10 px-3.5 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 ${
                itemType === 'impulse' ? 'focus:ring-amber-500' : 'focus:ring-indigo-500'
              }`}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Shelf Price ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500 font-semibold text-xs">
                  {currency}
                </span>
                <input
                  id="input-instore-price"
                  type="number"
                  step="any"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full h-10 pl-7 pr-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 ${
                    itemType === 'impulse' ? 'focus:ring-amber-500' : 'focus:ring-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Quantity
              </label>
              <div className="flex items-center h-10 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full h-full text-center text-sm font-bold bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Weight / Volume
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="any"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder="1"
                  className="w-16 h-10 px-2 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-semibold text-center focus:outline-none"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                  className="flex-1 h-10 px-2 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GroceryCategory)}
                className="w-full h-10 px-2.5 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-instore-add"
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                itemType === 'impulse'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {itemType === 'impulse' ? (
                <Zap className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{itemType === 'impulse' ? 'Put Impulse in Cart' : 'Put Essential in Cart'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
