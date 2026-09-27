import { PantryStaple } from '../types';

export const DEFAULT_STAPLES: PantryStaple[] = [
  {
    id: 'staple-1',
    name: 'Fresh Toned Milk',
    brand: 'Amul Taaza',
    defaultQuantity: 2,
    weightValue: 1,
    weightUnit: 'L',
    estimatedPrice: 56,
    category: 'Dairy & Eggs',
    frequency: 'weekly',
    fallbackAlternative: 'Mother Dairy / Country Delight',
    iconName: 'Milk',
  },
  {
    id: 'staple-2',
    name: 'Whole Wheat Atta',
    brand: 'Aashirvaad Sharbati',
    defaultQuantity: 1,
    weightValue: 5,
    weightUnit: 'kg',
    estimatedPrice: 285,
    category: 'Grains & Pulses',
    frequency: 'monthly',
    fallbackAlternative: 'Fortune Chakki Fresh Atta',
    iconName: 'Wheat',
  }
];

export const INITIAL_DEMO_ITEMS: any[] = [];

export const INITIAL_DEMO_TRIPS: any[] = [];

