import { GroceryItem, ShoppingTrip, PantryStaple, MonthlyBudget } from '../types';
import { DEFAULT_STAPLES } from '../data/defaultStaples';

const STORAGE_KEYS = {
  ITEMS: 'cartmanager_items_v1',
  TRIPS: 'cartmanager_trips_v1',
  STAPLES: 'cartmanager_staples_v2',
  BUDGET: 'cartmanager_budget_v1',
  CURRENCY: 'cartmanager_currency_v1',
  THEME: 'cartmanager_theme_v1',
  RECENT_STORE: 'cartmanager_recent_store_v1',
};

export const Storage = {
  getItems(): GroceryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (!data) {
        this.saveItems([]);
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveItems(items: GroceryItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items', e);
    }
  },

  getTrips(): ShoppingTrip[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
      if (!data) {
        this.saveTrips([]);
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTrips(trips: ShoppingTrip[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to save trips', e);
    }
  },

  getStaples(): PantryStaple[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAPLES);
      if (!data) {
        this.saveStaples(DEFAULT_STAPLES);
        return DEFAULT_STAPLES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_STAPLES;
    }
  },

  saveStaples(staples: PantryStaple[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STAPLES, JSON.stringify(staples));
    } catch (e) {
      console.error('Failed to save staples', e);
    }
  },

  getBudgets(): MonthlyBudget[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
      if (!data) {
        const currentMonth = new Date().toISOString().slice(0, 7); // e.g. 2026-08
        const defaultBudget: MonthlyBudget[] = [{ month: currentMonth, amount: 8000 }];
        this.saveBudgets(defaultBudget);
        return defaultBudget;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBudgets(budgets: MonthlyBudget[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budget', e);
    }
  },

  getCurrency(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || '₹';
  },

  saveCurrency(currency: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  },

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  },

  saveTheme(theme: 'light' | 'dark') {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getRecentStore(): string {
    return localStorage.getItem(STORAGE_KEYS.RECENT_STORE) || 'DMart';
  },

  saveRecentStore(store: string) {
    localStorage.setItem(STORAGE_KEYS.RECENT_STORE, store);
  },

  exportAllData() {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        items: this.getItems(),
        trips: this.getTrips(),
        staples: this.getStaples(),
        budgets: this.getBudgets(),
        currency: this.getCurrency(),
      },
      null,
      2
    );
  },

  importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.items)) this.saveItems(parsed.items);
      if (Array.isArray(parsed.trips)) this.saveTrips(parsed.trips);
      if (Array.isArray(parsed.staples)) this.saveStaples(parsed.staples);
      if (Array.isArray(parsed.budgets)) this.saveBudgets(parsed.budgets);
      if (parsed.currency) this.saveCurrency(parsed.currency);
      return true;
    } catch (e) {
      console.error('Failed to import backup data', e);
      return false;
    }
  },

  resetToDefault() {
    this.saveItems([]);
    this.saveTrips([]);
    this.saveStaples(DEFAULT_STAPLES);
  }
};
