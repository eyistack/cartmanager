import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Sparkles, 
  Tag, 
  Scale, 
  Layers, 
  ArrowRightLeft, 
  DollarSign, 
  FileText 
} from 'lucide-react';
import { GroceryItem, GroceryCategory, WeightUnit } from '../types';
import { CATEGORIES, WEIGHT_UNITS } from '../data/categories';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<GroceryItem>) => void;
  editingItem?: GroceryItem | null;
  initialValues?: Partial<GroceryItem> | null;
  currency: string;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  initialValues,
  currency,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weightValue, setWeightValue] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('packet');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');
  const [category, setCategory] = useState<GroceryCategory>('Produce & Veggies');
  const [fallbackAlternative, setFallbackAlternative] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setBrand(editingItem.brand || '');
      setQuantity(editingItem.quantity || 1);
      setWeightValue(editingItem.weightValue !== undefined ? String(editingItem.weightValue) : '');
      setWeightUnit(editingItem.weightUnit || 'packet');
      setEstimatedPrice(editingItem.estimatedPrice !== undefined ? String(editingItem.estimatedPrice) : '');
      setCategory(editingItem.category || 'Produce & Veggies');
      setFallbackAlternative(editingItem.fallbackAlternative || '');
      setNotes(editingItem.notes || '');
    } else if (initialValues) {
      setName(initialValues.name || '');
      setBrand(initialValues.brand || '');
      setQuantity(initialValues.quantity || 1);
      setWeightValue(initialValues.weightValue !== undefined ? String(initialValues.weightValue) : '');
      setWeightUnit(initialValues.weightUnit || 'packet');
      setEstimatedPrice(initialValues.estimatedPrice !== undefined ? String(initialValues.estimatedPrice) : '');
      setCategory(initialValues.category || 'Produce & Veggies');
      setFallbackAlternative(initialValues.fallbackAlternative || '');
      setNotes(initialValues.notes || '');
    } else {
      setName('');
      setBrand('');
      setQuantity(1);
      setWeightValue('');
      setWeightUnit('kg');
      setEstimatedPrice('');
      setCategory('Produce & Veggies');
      setFallbackAlternative('');
      setNotes('');
    }
  }, [editingItem, initialValues, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      brand: brand.trim() || undefined,
      quantity: Math.max(1, Number(quantity) || 1),
      weightValue: weightValue ? parseFloat(weightValue) : undefined,
      weightUnit,
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      category,
      fallbackAlternative: fallbackAlternative.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white dark:bg-zinc-950 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 my-8 animate-in fade-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-xl font-heading font-bold text-zinc-900 dark:text-white">
              {editingItem ? 'Edit Grocery Item' : 'Add Item with Full Specs'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Specify brand, package weight, price estimate & backup alternative
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Item Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Item Name *
              </label>
              <input
                id="input-item-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Whole Wheat Atta, Milk"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Specific Brand <span className="text-zinc-400 dark:text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                id="input-item-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Aashirvaad, Amul, Borges"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quantity, Weight / Volume & Unit */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Quantity & Package Measurement</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Quantity (Count) */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Qty (Packs)
                </label>
                <div className="flex items-center h-9 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    id="input-item-qty"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full h-full text-center text-xs font-bold bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Weight / Volume Value */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Weight / Vol
                </label>
                <input
                  id="input-item-weight-val"
                  type="number"
                  step="any"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder="e.g. 500, 1, 5"
                  className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-center"
                />
              </div>

              {/* Unit Dropdown */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Unit Preset
                </label>
                <select
                  id="select-item-unit"
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                  className="w-full h-9 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category & Estimated Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Category</span>
              </label>
              <select
                id="select-item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as GroceryCategory)}
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Est. Price / Unit ({currency})</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500 text-sm font-semibold">
                  {currency}
                </span>
                <input
                  id="input-item-price"
                  type="number"
                  step="any"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 pl-8 pr-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Fallback Alternative (Crucial real-world feature) */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <label className="block text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Backup Brand / Fallback Alternative</span>
            </label>
            <input
              id="input-item-fallback"
              type="text"
              value={fallbackAlternative}
              onChange={(e) => setFallbackAlternative(e.target.value)}
              placeholder="e.g. If Fortune Chakki is out of stock, get Aashirvaad"
              className="w-full h-9 px-3 rounded-lg bg-white dark:bg-black border border-amber-300 dark:border-amber-900/60 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
            <p className="text-[11px] text-amber-700 dark:text-amber-400/80 mt-1">
              💡 In Shopping Mode, if this item is marked Out of Stock, you'll be instantly prompted with this alternative!
            </p>
          </div>

          {/* Custom Shopping Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Special Instructions / Notes</span>
            </label>
            <input
              id="input-item-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Check latest expiry date, buy green unripened bananas"
              className="w-full h-9 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-item-modal"
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              {editingItem ? 'Update Item' : 'Add to Grocery List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
