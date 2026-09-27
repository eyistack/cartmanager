import React, { useState } from 'react';
import { 
  History, 
  Store, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Receipt, 
  Search,
  ArrowRight
} from 'lucide-react';
import { ShoppingTrip, GroceryItem } from '../types';

interface TripHistoryViewProps {
  trips: ShoppingTrip[];
  onDeleteTrip: (id: string) => void;
  onReAddTripItems: (items: GroceryItem[]) => void;
  currency: string;
}

export const TripHistoryView: React.FC<TripHistoryViewProps> = ({
  trips,
  onDeleteTrip,
  onReAddTripItems,
  currency,
}) => {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(trips[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = trips.filter((trip) => {
    return (
      trip.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.notes && trip.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      trip.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedTripId((prev) => (prev === id ? null : id));
  };

  const totalAllTimeSpent = trips.reduce(
    (sum, t) => sum + (t.receiptTotal !== undefined ? t.receiptTotal : t.totalActualSpend),
    0
  );

  return (
    <div className="space-y-5 pb-16">
      {/* History Header & All-Time Stats */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left transition-colors">
        <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-900 dark:text-white">
              Grocery Trip Log
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Chronological records of in-store runs, receipts, and impulse trends
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Total Trips</div>
            <div className="text-lg font-heading font-bold text-zinc-900 dark:text-white">
              {trips.length}
            </div>
          </div>
          <div className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-center">
            <div className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">All-Time Spend</div>
            <div className="text-lg font-heading font-extrabold text-blue-600 dark:text-blue-400">
              {currency}{totalAllTimeSpent.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400 dark:text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search past trips by store, item name, or notes..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {/* Trips Timeline */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 rounded-3xl p-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
          <History className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white">
            No shopping trips recorded yet
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Complete your first shopping run in "Shop Mode" to archive your receipt and spend breakdown!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const isExpanded = expandedTripId === trip.id;
            const tripCost = trip.receiptTotal !== undefined ? trip.receiptTotal : trip.totalActualSpend;
            const purchasedItems = trip.items.filter((i) => i.status === 'in_cart');
            const missingItems = trip.items.filter((i) => i.status === 'out_of_stock');
            const impulseItems = trip.items.filter((i) => i.isImpulseBuy);

            const formattedDate = new Date(trip.date || trip.completedAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={trip.id}
                className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-all"
              >
                {/* Trip Summary Row */}
                <div
                  onClick={() => toggleExpand(trip.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-900">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading font-bold text-base text-zinc-900 dark:text-white">
                          {trip.storeName}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        <span>{purchasedItems.length} items purchased</span>
                        {impulseItems.length > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                            <Zap className="w-3 h-3 fill-current" />
                            {impulseItems.length} impulse buys ({currency}{trip.totalExtrasSpend})
                          </span>
                        )}
                        {missingItems.length > 0 && (
                          <span className="text-rose-500 font-medium">
                            • {missingItems.length} missing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Spend & Expand toggle */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-850">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium block">Total Paid</span>
                      <span className="text-lg font-heading font-extrabold text-blue-600 dark:text-blue-400">
                        {currency}{tripCost.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Accordion */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-black border-t border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in duration-150">
                    {/* Notes & Actions Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-850">
                      <div>
                        {trip.notes ? (
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                            💬 "{trip.notes}"
                          </p>
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">No notes recorded</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Re-add all items to active list */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReAddTripItems(trip.items);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          title="Copy all items from this trip back into active grocery list"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Re-Add to Active List</span>
                        </button>

                        {/* Delete trip */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this trip record?')) {
                              onDeleteTrip(trip.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Itemized List */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Itemized Breakdown ({trip.items.length})
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {trip.items.map((item) => {
                          const itemPrice = item.actualPrice ?? item.estimatedPrice;
                          return (
                            <div
                              key={item.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                item.status === 'in_cart'
                                  ? item.isImpulseBuy
                                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                                    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 opacity-70'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {item.status === 'in_cart' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                                )}
                                <div className="truncate">
                                  <span className="font-semibold text-zinc-900 dark:text-white">
                                    {item.name}
                                  </span>
                                  {item.brand && (
                                    <span className="ml-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                      [{item.brand}]
                                    </span>
                                  )}
                                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                    {item.quantity} × {item.weightValue ? `${item.weightValue}${item.weightUnit}` : item.weightUnit}
                                    {item.isImpulseBuy && ' • ⚡ Impulse'}
                                  </div>
                                </div>
                              </div>

                              <div className="font-bold text-zinc-800 dark:text-zinc-200 flex-shrink-0">
                                {itemPrice !== undefined ? `${currency}${(itemPrice * item.quantity).toLocaleString()}` : '-'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
