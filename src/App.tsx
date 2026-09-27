import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GroceryItem, 
  ShoppingTrip, 
  PantryStaple, 
  MonthlyBudget, 
  ActiveTab 
} from './types';
import { Storage } from './utils/storage';
import { Navbar, BottomNav } from './components/Navbar';
import { ActiveListView } from './components/ActiveListView';
import { ShoppingModeView } from './components/ShoppingModeView';
import { TripHistoryView } from './components/TripHistoryView';
import { SpendAnalyticsView } from './components/SpendAnalyticsView';
import { PantryStaplesView } from './components/PantryStaplesView';
import { ItemModal } from './components/ItemModal';
import { TripSummaryModal } from './components/TripSummaryModal';
import { ShareModal } from './components/ShareModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { DEFAULT_STAPLES } from './data/defaultStaples';
import { auth, subscribeToUserData, saveUserDataToFirestore, UserCloudData } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  // Core application persistent states
  const [items, setItems] = useState<GroceryItem[]>(() => Storage.getItems());
  const [trips, setTrips] = useState<ShoppingTrip[]>(() => Storage.getTrips());
  const [staples, setStaples] = useState<PantryStaple[]>(() => Storage.getStaples());
  const [budgets, setBudgets] = useState<MonthlyBudget[]>(() => Storage.getBudgets());
  const [currency, setCurrencyState] = useState<string>(() => Storage.getCurrency());
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => Storage.getTheme());
  const [recentStore, setRecentStore] = useState<string>(() => Storage.getRecentStore());

  // Cloud Sync & Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const isCloudReadyRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [initialModalValues, setInitialModalValues] = useState<Partial<GroceryItem> | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTripSummaryOpen, setIsTripSummaryOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const { isInstalled, hasNativePrompt, triggerNativePrompt } = usePWAInstall();

  // Keep a ref to latest state to avoid stale closure sync issues
  const stateRef = useRef({ items, trips, staples, budgets, currency, recentStore });
  stateRef.current = { items, trips, staples, budgets, currency, recentStore };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setPermissionError(null);
        isCloudReadyRef.current = false;
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to real-time Cloud Firestore updates when logged in
  useEffect(() => {
    if (!currentUser) {
      isCloudReadyRef.current = false;
      return;
    }

    const unsubscribe = subscribeToUserData(
      currentUser.uid, 
      (cloudData, exists) => {
        setPermissionError(null);

        if (exists) {
          // Document exists on Firestore: Cloud is authoritative source of truth
          const cloudItems = Array.isArray(cloudData.items) ? cloudData.items : [];
          setItems(cloudItems);
          Storage.saveItems(cloudItems);

          if (Array.isArray(cloudData.trips)) {
            setTrips(cloudData.trips);
            Storage.saveTrips(cloudData.trips);
          }

          if (Array.isArray(cloudData.staples)) {
            setStaples(cloudData.staples);
            Storage.saveStaples(cloudData.staples);
          }

          if (Array.isArray(cloudData.budgets)) {
            setBudgets(cloudData.budgets);
            Storage.saveBudgets(cloudData.budgets);
          }

          if (cloudData.currency) {
            setCurrencyState(cloudData.currency);
            Storage.saveCurrency(cloudData.currency);
          }

          if (cloudData.recentStore !== undefined) {
            setRecentStore(cloudData.recentStore);
            Storage.saveRecentStore(cloudData.recentStore);
          }

          isCloudReadyRef.current = true;
        } else {
          // First time user registration: Migrate existing local offline data to Cloud once
          const localItems = Storage.getItems();
          const localTrips = Storage.getTrips();
          const localStaples = Storage.getStaples();
          const localBudgets = Storage.getBudgets();
          const localCurrency = Storage.getCurrency();
          const localStore = Storage.getRecentStore();

          saveUserDataToFirestore(currentUser.uid, {
            items: localItems,
            trips: localTrips,
            staples: localStaples,
            budgets: localBudgets,
            currency: localCurrency,
            recentStore: localStore,
          }).then(() => {
            isCloudReadyRef.current = true;
          }).catch((err) => {
            if (err?.code === 'permission-denied') {
              setPermissionError('Firestore permission denied. Please update your Firestore Security Rules in Firebase Console.');
            }
          });
        }

        setLastSyncedAt(new Date());
        setIsSyncing(false);
      },
      (err: any) => {
        console.error('Firestore listener error:', err);
        if (err?.code === 'permission-denied') {
          setPermissionError('Firestore permission denied. Please update your Firestore Security Rules in Firebase Console.');
        }
      }
    );

    return () => {
      unsubscribe();
      isCloudReadyRef.current = false;
    };
  }, [currentUser]);

  // Push user-triggered changes to Cloud immediately
  const syncToCloud = useCallback((overrideData: Partial<UserCloudData>) => {
    if (!currentUser || !isCloudReadyRef.current) return;

    setIsSyncing(true);
    // Update local ref immediately so any rapid successive actions see latest values
    if (overrideData.items !== undefined) stateRef.current.items = overrideData.items;
    if (overrideData.trips !== undefined) stateRef.current.trips = overrideData.trips;
    if (overrideData.staples !== undefined) stateRef.current.staples = overrideData.staples;
    if (overrideData.budgets !== undefined) stateRef.current.budgets = overrideData.budgets;
    if (overrideData.currency !== undefined) stateRef.current.currency = overrideData.currency;
    if (overrideData.recentStore !== undefined) stateRef.current.recentStore = overrideData.recentStore;

    const payload: UserCloudData = {
      items: stateRef.current.items,
      trips: stateRef.current.trips,
      staples: stateRef.current.staples,
      budgets: stateRef.current.budgets,
      currency: stateRef.current.currency,
      recentStore: stateRef.current.recentStore,
    };

    saveUserDataToFirestore(currentUser.uid, payload)
      .then(() => {
        setLastSyncedAt(new Date());
        setPermissionError(null);
      })
      .catch((err: any) => {
        console.error('Failed to sync to cloud:', err);
        if (err?.code === 'permission-denied') {
          setPermissionError('Firestore permission denied. Please update your Firestore Security Rules in Firebase Console.');
        }
      })
      .finally(() => {
        setIsSyncing(false);
      });
  }, [currentUser]);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    Storage.saveTheme(theme);
  }, [theme]);

  // Atomic state updaters with instant local storage & cloud persistence
  const updateItems = (updater: (prev: GroceryItem[]) => GroceryItem[]) => {
    setItems((prev) => {
      const next = updater(prev);
      Storage.saveItems(next);
      syncToCloud({ items: next });
      return next;
    });
  };

  const updateTrips = (updater: (prev: ShoppingTrip[]) => ShoppingTrip[]) => {
    setTrips((prev) => {
      const next = updater(prev);
      Storage.saveTrips(next);
      syncToCloud({ trips: next });
      return next;
    });
  };

  const updateStaples = (updater: (prev: PantryStaple[]) => PantryStaple[]) => {
    setStaples((prev) => {
      const next = updater(prev);
      Storage.saveStaples(next);
      syncToCloud({ staples: next });
      return next;
    });
  };

  const updateBudgets = (updater: (prev: MonthlyBudget[]) => MonthlyBudget[]) => {
    setBudgets((prev) => {
      const next = updater(prev);
      Storage.saveBudgets(next);
      syncToCloud({ budgets: next });
      return next;
    });
  };

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    Storage.saveCurrency(c);
    syncToCloud({ currency: c });
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  // Grocery Item Handlers
  const handleAddItem = (itemData: Partial<GroceryItem>) => {
    const newItem: GroceryItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: itemData.name || 'Untitled Item',
      brand: itemData.brand,
      quantity: itemData.quantity || 1,
      weightValue: itemData.weightValue,
      weightUnit: itemData.weightUnit || 'packet',
      estimatedPrice: itemData.estimatedPrice,
      actualPrice: itemData.actualPrice,
      category: itemData.category || 'Produce & Veggies',
      status: itemData.status || 'pending',
      fallbackAlternative: itemData.fallbackAlternative,
      notes: itemData.notes,
      isImpulseBuy: itemData.isImpulseBuy || false,
      addedAt: new Date().toISOString(),
    };

    updateItems((prev) => [newItem, ...prev]);
  };

  const handleUpdateItem = (id: string, updates: Partial<GroceryItem>) => {
    updateItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    updateItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDuplicateItem = (item: GroceryItem) => {
    const duplicated: GroceryItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      addedAt: new Date().toISOString(),
      status: 'pending',
    };
    updateItems((prev) => [duplicated, ...prev]);
  };

  const handleSaveItemModal = (itemData: Partial<GroceryItem>) => {
    if (editingItem) {
      handleUpdateItem(editingItem.id, itemData);
    } else {
      handleAddItem(itemData);
    }
    setEditingItem(null);
    setInitialModalValues(null);
  };

  const handleOpenDetailedModal = (itemOrInitial?: GroceryItem | Partial<GroceryItem>) => {
    if (itemOrInitial && 'id' in itemOrInitial && itemOrInitial.id) {
      setEditingItem(itemOrInitial as GroceryItem);
      setInitialModalValues(null);
    } else if (itemOrInitial) {
      setEditingItem(null);
      setInitialModalValues(itemOrInitial as Partial<GroceryItem>);
    } else {
      setEditingItem(null);
      setInitialModalValues(null);
    }
    setIsItemModalOpen(true);
  };

  // Staples Handlers
  const handleAddStapleToActiveList = (staple: PantryStaple) => {
    handleAddItem({
      name: staple.name,
      brand: staple.brand,
      quantity: staple.defaultQuantity,
      weightValue: staple.weightValue,
      weightUnit: staple.weightUnit,
      estimatedPrice: staple.estimatedPrice,
      category: staple.category,
      fallbackAlternative: staple.fallbackAlternative,
      status: 'pending',
    });
  };

  const handleAddMultipleStaples = (staplesToAdd: PantryStaple[]) => {
    const newItems: GroceryItem[] = staplesToAdd.map((staple) => ({
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: staple.name,
      brand: staple.brand,
      quantity: staple.defaultQuantity,
      weightValue: staple.weightValue,
      weightUnit: staple.weightUnit,
      estimatedPrice: staple.estimatedPrice,
      category: staple.category,
      fallbackAlternative: staple.fallbackAlternative,
      status: 'pending',
      addedAt: new Date().toISOString(),
    }));

    updateItems((prev) => [...newItems, ...prev]);
    setActiveTab('list');
  };

  const handleSaveCustomStaple = (staple: PantryStaple) => {
    updateStaples((prev) => {
      const idx = prev.findIndex((s) => s.id === staple.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = staple;
        return next;
      }
      return [staple, ...prev];
    });
  };

  const handleDeleteStaple = (id: string) => {
    updateStaples((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetDefaultStaples = () => {
    updateStaples(() => DEFAULT_STAPLES);
  };

  // Bulk List Actions
  const handleClearCompleted = () => {
    updateItems((prev) => prev.filter((i) => i.status !== 'in_cart'));
  };

  const handleClearAll = () => {
    updateItems(() => []);
  };

  // Trip Completion & Archival
  const handleCompleteTrip = ({
    storeName,
    receiptTotal,
    notes,
    rolloverItemIds,
    updatedPrices,
  }: {
    storeName: string;
    receiptTotal?: number;
    notes?: string;
    rolloverItemIds: string[];
    updatedPrices?: Record<string, number>;
  }) => {
    // Merge any prices updated in summary modal
    const completedItems = items.map((item) => {
      if (updatedPrices && updatedPrices[item.id] !== undefined) {
        return { ...item, actualPrice: updatedPrices[item.id] };
      }
      return item;
    });

    const purchasedItems = completedItems.filter((i) => i.status === 'in_cart');
    const outOfStockItems = completedItems.filter((i) => i.status === 'out_of_stock');

    const plannedSpend = purchasedItems
      .filter((i) => !i.isImpulseBuy)
      .reduce((sum, i) => sum + (i.actualPrice !== undefined ? i.actualPrice * i.quantity : (i.estimatedPrice || 0) * i.quantity), 0);

    const extrasSpend = purchasedItems
      .filter((i) => i.isImpulseBuy)
      .reduce((sum, i) => sum + (i.actualPrice !== undefined ? i.actualPrice * i.quantity : (i.estimatedPrice || 0) * i.quantity), 0);

    const totalActualSpend = plannedSpend + extrasSpend;

    const newTrip: ShoppingTrip = {
      id: `trip-${Date.now()}`,
      storeName,
      date: new Date().toISOString().split('T')[0],
      completedAt: new Date().toISOString(),
      items: completedItems,
      totalPlannedSpend: plannedSpend,
      totalActualSpend,
      totalExtrasSpend: extrasSpend,
      unbudgetedItemsCount: purchasedItems.filter((i) => i.isImpulseBuy).length,
      outOfStockCount: outOfStockItems.length,
      receiptTotal: receiptTotal ?? totalActualSpend,
      notes,
    };

    // Save recent store
    setRecentStore(storeName);
    Storage.saveRecentStore(storeName);

    // Retain rollover items for next list (reset their status to pending)
    const nextListItems = completedItems
      .filter((i) => rolloverItemIds.includes(i.id))
      .map((i) => ({
        ...i,
        status: 'pending' as const,
        actualPrice: undefined,
        collectedAt: undefined,
      }));

    // Update trips and items atomically
    const nextTrips = [newTrip, ...trips];
    setTrips(nextTrips);
    Storage.saveTrips(nextTrips);

    setItems(nextListItems);
    Storage.saveItems(nextListItems);

    syncToCloud({
      items: nextListItems,
      trips: nextTrips,
      recentStore: storeName,
    });

    setIsTripSummaryOpen(false);
    setActiveTab('history');
  };

  // Re-add past trip items to list
  const handleReAddTripItems = (tripItems: GroceryItem[]) => {
    const clonedItems: GroceryItem[] = tripItems.map((item) => ({
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'pending',
      addedAt: new Date().toISOString(),
      collectedAt: undefined,
    }));

    updateItems((prev) => [...clonedItems, ...prev]);
    setActiveTab('list');
  };

  const handleDeleteTrip = (id: string) => {
    updateTrips((prev) => prev.filter((t) => t.id !== id));
  };

  // Update budget
  const handleUpdateBudget = (month: string, amount: number) => {
    updateBudgets((prev) => {
      const idx = prev.findIndex((b) => b.month === month);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { month, amount };
        return copy;
      }
      return [...prev, { month, amount }];
    });
  };

  const inCartCount = items.filter((i) => i.status === 'in_cart').length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white transition-colors duration-200 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        theme={theme}
        setTheme={setTheme}
        itemsCount={items.length}
        inCartCount={inCartCount}
        onOpenShare={() => setIsShareModalOpen(true)}
        onStartShopping={() => setActiveTab('shop')}
        user={currentUser}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
      />

      {/* Main App Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-28">
        {permissionError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Firestore Cloud Sync Action Required</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Firestore rules are currently blocking cloud sync. Please paste the updated rules in your Firebase Console Rules tab to enable real-time sync across your phone and laptop.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPermissionError(null)}
              className="px-3 py-1.5 self-start sm:self-center text-xs font-medium bg-amber-200/60 dark:bg-amber-900/60 hover:bg-amber-200 rounded-lg transition-colors shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'list' && (
          <ActiveListView
            items={items}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onDuplicateItem={handleDuplicateItem}
            onOpenDetailedModal={handleOpenDetailedModal}
            onStartShopping={() => setActiveTab('shop')}
            onOpenShare={() => setIsShareModalOpen(true)}
            onAddStaples={() => setActiveTab('staples')}
            onClearCompleted={handleClearCompleted}
            onClearAll={handleClearAll}
            currency={currency}
          />
        )}

        {activeTab === 'shop' && (
          <ShoppingModeView
            items={items}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddItem}
            onExitShopping={() => setActiveTab('list')}
            onFinishShoppingTrip={() => setIsTripSummaryOpen(true)}
            currency={currency}
          />
        )}

        {activeTab === 'history' && (
          <TripHistoryView
            trips={trips}
            onDeleteTrip={handleDeleteTrip}
            onReAddTripItems={handleReAddTripItems}
            currency={currency}
          />
        )}

        {activeTab === 'staples' && (
          <PantryStaplesView
            staples={staples}
            onAddStapleToActiveList={handleAddStapleToActiveList}
            onAddMultipleStaples={handleAddMultipleStaples}
            onSaveCustomStaple={handleSaveCustomStaple}
            onDeleteStaple={handleDeleteStaple}
            onResetDefaultStaples={handleResetDefaultStaples}
            currency={currency}
          />
        )}

        {activeTab === 'analytics' && (
          <SpendAnalyticsView
            trips={trips}
            budgets={budgets}
            onUpdateBudget={handleUpdateBudget}
            currency={currency}
          />
        )}

        {/* Subtle Footer with Install as App Link */}
        <footer className="mt-12 py-6 text-center text-xs text-zinc-500 dark:text-zinc-500 border-t border-zinc-200/60 dark:border-zinc-850/60 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4">
          <span>CartManager</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          {!isInstalled ? (
            <button
              id="btn-footer-install-app"
              onClick={async () => {
                if (hasNativePrompt) {
                  const outcome = await triggerNativePrompt();
                  if (outcome) return;
                }
                setIsInstallModalOpen(true);
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Install this as an app
            </button>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-500 font-medium">✓ App Installed</span>
          )}
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>100% Offline Ready</span>
        </footer>
      </main>

      {/* Mobile and Tablet Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartShopping={() => setActiveTab('shop')}
        itemsCount={items.length}
      />

      {/* Modal Dialogs */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
          setInitialModalValues(null);
        }}
        onSave={handleSaveItemModal}
        editingItem={editingItem}
        initialValues={initialModalValues}
        currency={currency}
      />

      <TripSummaryModal
        isOpen={isTripSummaryOpen}
        onClose={() => setIsTripSummaryOpen(false)}
        items={items}
        onCompleteTrip={handleCompleteTrip}
        currency={currency}
        defaultStore={recentStore}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        items={items}
        currency={currency}
        onDataRestored={() => {
          setItems(Storage.getItems());
          setTrips(Storage.getTrips());
          setStaples(Storage.getStaples());
          setBudgets(Storage.getBudgets());
        }}
      />

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
