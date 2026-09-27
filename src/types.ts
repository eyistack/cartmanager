export type GroceryCategory =
  | 'Produce & Veggies'
  | 'Dairy & Eggs'
  | 'Grains & Pulses'
  | 'Spices & Oils'
  | 'Snacks & Drinks'
  | 'Cleaning & Household'
  | 'Personal Care'
  | 'Bakery & Frozen'
  | 'Meat & Seafood'
  | 'Other Essentials';

export type WeightUnit =
  | 'kg'
  | 'g'
  | 'L'
  | 'ml'
  | 'packet'
  | 'piece'
  | 'dozen'
  | 'box'
  | 'bunch'
  | 'bottle'
  | 'can';

export type ItemStatus = 'pending' | 'in_cart' | 'out_of_stock';

export interface GroceryItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  weightValue?: number;
  weightUnit: WeightUnit;
  estimatedPrice?: number;
  actualPrice?: number;
  category: GroceryCategory;
  status: ItemStatus;
  fallbackAlternative?: string;
  notes?: string;
  isImpulseBuy?: boolean;
  isForgottenEssential?: boolean;
  addedAt: string;
  collectedAt?: string;
}

export interface ShoppingTrip {
  id: string;
  storeName: string;
  date: string;
  completedAt: string;
  items: GroceryItem[];
  totalPlannedSpend: number;
  totalActualSpend: number;
  totalExtrasSpend: number;
  unbudgetedItemsCount: number;
  outOfStockCount: number;
  receiptTotal?: number;
  notes?: string;
}

export interface PantryStaple {
  id: string;
  name: string;
  brand?: string;
  defaultQuantity: number;
  weightValue?: number;
  weightUnit: WeightUnit;
  estimatedPrice?: number;
  category: GroceryCategory;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'as_needed';
  fallbackAlternative?: string;
  iconName?: string;
}

export interface CategoryMeta {
  name: GroceryCategory;
  icon: string;
  color: string;
  bgColor: string;
  darkBgColor: string;
  textColor: string;
  aisleNumber: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  amount: number;
}

export type ActiveTab = 'list' | 'shop' | 'history' | 'staples' | 'analytics';
