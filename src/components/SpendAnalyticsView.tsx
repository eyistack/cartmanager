import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  Zap, 
  ShoppingBag, 
  Store, 
  PieChart, 
  Calendar,
  AlertCircle,
  Edit2,
  Check
} from 'lucide-react';
import { ShoppingTrip, MonthlyBudget, GroceryCategory } from '../types';
import { CATEGORIES } from '../data/categories';

interface SpendAnalyticsViewProps {
  trips: ShoppingTrip[];
  budgets: MonthlyBudget[];
  onUpdateBudget: (month: string, amount: number) => void;
  currency: string;
}

export const SpendAnalyticsView: React.FC<SpendAnalyticsViewProps> = ({
  trips,
  budgets,
  onUpdateBudget,
  currency,
}) => {
  // Current month string: YYYY-MM
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  // Extract unique months from trips + current month
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthStr);
    trips.forEach((t) => {
      if (t.date) set.add(t.date.slice(0, 7));
      if (t.completedAt) set.add(t.completedAt.slice(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [trips, currentMonthStr]);

  // Current selected month budget
  const currentBudget = useMemo(() => {
    const found = budgets.find((b) => b.month === selectedMonth);
    return found ? found.amount : 8000;
  }, [budgets, selectedMonth]);

  // Trips in selected month
  const monthTrips = useMemo(() => {
    return trips.filter((t) => {
      const d = t.date || t.completedAt;
      return d && d.startsWith(selectedMonth);
    });
  }, [trips, selectedMonth]);

  // Month Total Spend
  const monthTotalSpend = useMemo(() => {
    return monthTrips.reduce(
      (sum, t) => sum + (t.receiptTotal !== undefined ? t.receiptTotal : t.totalActualSpend),
      0
    );
  }, [monthTrips]);

  // Planned vs Extras in month
  const monthPlannedSpend = useMemo(() => {
    return monthTrips.reduce((sum, t) => sum + (t.totalPlannedSpend || 0), 0);
  }, [monthTrips]);

  const monthExtrasSpend = useMemo(() => {
    return monthTrips.reduce((sum, t) => sum + (t.totalExtrasSpend || 0), 0);
  }, [monthTrips]);

  // Category Spend Breakdown
  const categorySpendMap = useMemo(() => {
    const map = new Map<GroceryCategory, number>();
    CATEGORIES.forEach((c) => map.set(c.name, 0));

    monthTrips.forEach((trip) => {
      trip.items.forEach((item) => {
        if (item.status === 'in_cart') {
          const itemTotal = (item.actualPrice ?? item.estimatedPrice ?? 0) * item.quantity;
          const current = map.get(item.category) || 0;
          map.set(item.category, current + itemTotal);
        }
      });
    });

    return Array.from(map.entries())
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [monthTrips]);

  // Store Breakdown
  const storeSpendMap = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    monthTrips.forEach((t) => {
      const store = t.storeName || 'Other Store';
      const cost = t.receiptTotal !== undefined ? t.receiptTotal : t.totalActualSpend;
      if (!map[store]) map[store] = { total: 0, count: 0 };
      map[store].total += cost;
      map[store].count += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [monthTrips]);

  // Top Impulse items
  const impulseItemsList = useMemo(() => {
    const items: { name: string; price: number; count: number }[] = [];
    monthTrips.forEach((t) => {
      t.items.forEach((i) => {
        if (i.isImpulseBuy && i.status === 'in_cart') {
          const p = (i.actualPrice ?? i.estimatedPrice ?? 0) * i.quantity;
          const existing = items.find((x) => x.name.toLowerCase() === i.name.toLowerCase());
          if (existing) {
            existing.price += p;
            existing.count += i.quantity;
          } else {
            items.push({ name: i.name, price: p, count: i.quantity });
          }
        }
      });
    });
    return items.sort((a, b) => b.price - a.price);
  }, [monthTrips]);

  // Budget calculations
  const budgetRemaining = currentBudget - monthTotalSpend;
  const budgetUsagePercent = currentBudget > 0 ? Math.min(100, Math.round((monthTotalSpend / currentBudget) * 100)) : 0;
  const avgTripCost = monthTrips.length > 0 ? Math.round(monthTotalSpend / monthTrips.length) : 0;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(selectedMonth, val);
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Month Selector */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left transition-colors">
        <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-900 dark:text-white">
              Grocery Spend Analytics
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Monthly budget tracking, impulse triggers & aisle expense distribution
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <select
            id="select-analytics-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 sm:flex-none h-10 px-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {availableMonths.map((m) => {
              const [year, monthNum] = m.split('-');
              const dateObj = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
              const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              return (
                <option key={m} value={m}>
                  {label} {m === currentMonthStr ? '(Current)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Top 4 Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Spend */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Grocery Bill
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 dark:text-white">
            {currency}{monthTotalSpend.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500">
            Across {monthTrips.length} {monthTrips.length === 1 ? 'shopping trip' : 'shopping trips'}
          </div>
        </div>

        {/* 2. Monthly Budget Progress */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Monthly Budget
            </span>
            <button
              onClick={() => {
                setBudgetInput(String(currentBudget));
                setIsEditingBudget(true);
              }}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer"
              title="Set Target Budget"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingBudget ? (
            <form onSubmit={handleSaveBudget} className="flex items-center gap-1.5 pt-1">
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-24 h-8 px-2 rounded-lg bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-750 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="h-8 px-2 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 dark:text-white">
              {currency}{currentBudget.toLocaleString()}
            </div>
          )}

          {/* Budget progress */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-850 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  budgetUsagePercent >= 100
                    ? 'bg-rose-500'
                    : budgetUsagePercent > 80
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">{budgetUsagePercent}% used</span>
              <span
                className={`font-semibold ${
                  budgetRemaining >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-rose-500'
                }`}
              >
                {budgetRemaining >= 0
                  ? `${currency}${budgetRemaining.toLocaleString()} left`
                  : `Over by ${currency}${Math.abs(budgetRemaining).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Impulse / Extras Spend */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Impulse / Extras
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900">
              <Zap className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-600 dark:text-amber-400">
            {currency}{monthExtrasSpend.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500">
            {monthTotalSpend > 0
              ? `${Math.round((monthExtrasSpend / monthTotalSpend) * 100)}% of total grocery spend`
              : 'No impulse buys logged'}
          </div>
        </div>

        {/* 4. Average Cost Per Trip */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Avg. Per Trip
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 dark:text-white">
            {currency}{avgTripCost.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500">
            {monthTrips.length} completed shopping runs
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Spend Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white">
                Category Expense Distribution
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Where your grocery money went this month
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-800">
              {categorySpendMap.length} Active Categories
            </span>
          </div>

          {categorySpendMap.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No itemized expense records for this month yet.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {categorySpendMap.map(([catName, amount]) => {
                const percent = monthTotalSpend > 0 ? Math.round((amount / monthTotalSpend) * 100) : 0;

                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                        <span>{catName}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">{percent}%</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {currency}{amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-850 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Store Breakdown & Impulse Triggers */}
        <div className="space-y-6">
          {/* Store Breakdown Card */}
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Spend by Store</span>
            </h3>

            {storeSpendMap.length === 0 ? (
              <div className="text-xs text-zinc-500 py-4 text-center">
                No store records for this month.
              </div>
            ) : (
              <div className="space-y-2">
                {storeSpendMap.map(([store, info]) => (
                  <div
                    key={store}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">{store}</div>
                      <div className="text-[11px] text-zinc-500">{info.count} trips</div>
                    </div>
                    <div className="font-extrabold text-blue-600 dark:text-blue-400">
                      {currency}{info.total.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Impulse Triggers */}
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-current" />
                <span>Impulse Buys Log</span>
              </h3>
              {impulseItemsList.length > 0 && (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {impulseItemsList.length} Items
                </span>
              )}
            </div>

            {impulseItemsList.length === 0 ? (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-xs text-center border border-zinc-200 dark:border-zinc-800">
                🎉 Great discipline! No unplanned impulse buys logged this month.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {impulseItemsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-amber-900 dark:text-amber-200 truncate">
                      {item.name} {item.count > 1 ? `(×${item.count})` : ''}
                    </span>
                    <span className="font-bold text-amber-700 dark:text-amber-300 flex-shrink-0">
                      {currency}{item.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
