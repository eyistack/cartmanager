import { GroceryCategory, WeightUnit } from '../types';

interface ParsedItemResult {
  name: string;
  brand?: string;
  quantity: number;
  weightValue?: number;
  weightUnit: WeightUnit;
  estimatedPrice?: number;
  category: GroceryCategory;
  fallbackAlternative?: string;
}

// Category keyword map
const CATEGORY_KEYWORDS: Record<GroceryCategory, string[]> = {
  'Produce & Veggies': [
    'onion', 'tomato', 'potato', 'garlic', 'ginger', 'chilli', 'lemon', 'carrot',
    'coriander', 'spinach', 'apple', 'banana', 'mango', 'orange', 'cucumber',
    'cabbage', 'cauliflower', 'capsicum', 'veggie', 'vegetable', 'fruit', 'lettuce',
    'avocado', 'mushroom', 'bhindi', 'okra', 'paneer veggie', 'palak', 'methi', 'pyaz', 'tamatar', 'aloo'
  ],
  'Dairy & Eggs': [
    'milk', 'butter', 'cheese', 'paneer', 'curd', 'dahi', 'egg', 'eggs', 'cream',
    'yogurt', 'mayo', 'mayonnaise', 'tofu', 'amul', 'mother dairy', 'eggoz', 'ghee'
  ],
  'Grains & Pulses': [
    'atta', 'flour', 'rice', 'dal', 'pulse', 'wheat', 'maida', 'suji', 'rawa',
    'poha', 'oats', 'quinoa', 'chana', 'rajma', 'toor', 'moong', 'urad', 'masoor',
    'besan', 'pasta', 'noodle', 'noodles', 'basmati', 'aashirvaad'
  ],
  'Spices & Oils': [
    'oil', 'mustard', 'sunflower', 'olive', 'salt', 'sugar', 'turmeric', 'haldi',
    'chilli powder', 'jeera', 'cumin', 'coriander powder', 'garam masala', 'pepper',
    'clove', 'cardamom', 'hing', 'vinegar', 'soy sauce', 'sauce', 'ketchup', 'tata salt', 'fortune'
  ],
  'Snacks & Drinks': [
    'chips', 'biscuit', 'cookies', 'tea', 'coffee', 'juice', 'soda', 'coke', 'pepsi',
    'chocolate', 'snack', 'namkeen', 'bhujia', 'maggi', 'lays', 'kurkure', 'popcorn',
    'drink', 'water', 'energy drink', 'tata tea', 'nescafe', 'bournvita', 'peanut', 'cashew', 'almond'
  ],
  'Bakery & Frozen': [
    'bread', 'bun', 'croissant', 'frozen', 'peas', 'patty', 'burger', 'pizza base',
    'muffin', 'cake', 'waffle', 'ice cream', 'french fries', 'paratha', 'pav'
  ],
  'Cleaning & Household': [
    'detergent', 'surf', 'vim', 'dishwash', 'soap bar', 'harpic', 'colin', 'cleaner',
    'tissue', 'paper towel', 'foil', 'garbage bag', 'sponge', 'scrub', 'mop', 'floor cleaner',
    'ariel', 'tide', 'dettol surface', 'repellent', 'odonil'
  ],
  'Personal Care': [
    'shampoo', 'conditioner', 'soap', 'body wash', 'toothpaste', 'brush', 'deodorant',
    'perfume', 'cream', 'lotion', 'face wash', 'sanitary', 'razor', 'shaving', 'colgate', 'dove'
  ],
  'Meat & Seafood': [
    'chicken', 'mutton', 'fish', 'prawns', 'meat', 'pork', 'beef', 'salmon', 'tuna', 'sausage'
  ],
  'Other Essentials': []
};

// Known popular grocery brands
const KNOWN_BRANDS = [
  'Aashirvaad', 'Amul', 'Tata', 'Tata Sampann', 'Tata Tea', 'Fortune', 'Saffola', 'Mother Dairy',
  'Nestle', 'Maggi', 'Britannia', 'Parle', 'Lays', 'Kurkure', 'Haldiram', 'MDH', 'Everest',
  'Catch', 'Dabur', 'Patanjali', 'Dhara', 'Borges', 'Figaro', 'Del Monte', 'Nutraj', 'Organic Tattva',
  'Vim', 'Surf Excel', 'Ariel', 'Tide', 'Harpic', 'Lizol', 'Dettol', 'Dove', 'Colgate', 'Pepsodent',
  'Sensodyne', 'Nivea', 'Pears', 'India Gate', 'Daawat', 'Eggoz', 'Kelloggs', 'Saffola Gold',
  'Coca-Cola', 'Pepsi', 'Nescafe', 'Bru', 'Kissan', 'Heinz', 'Sunfeast', 'Bikaji', 'Keventers'
];

export function parseGroceryInput(rawText: string): ParsedItemResult {
  let text = rawText.trim();

  let fallbackAlternative: string | undefined = undefined;
  // Check for alt / fallback pattern: e.g., "alt: Fortune", "or Aashirvaad", "if not Amul"
  const altRegex = /(?:alt:|or\s+|if\s+not\s+|fallback:|backup:)\s*([^,;]+)$/i;
  const altMatch = text.match(altRegex);
  if (altMatch) {
    fallbackAlternative = altMatch[1].trim();
    text = text.substring(0, altMatch.index).trim();
  }

  // Extract Price: ₹120, Rs 120, $15, 120rs, 120 INR
  let estimatedPrice: number | undefined = undefined;
  const priceRegex = /(?:[₹$€£]|rs\.?|inr)\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:[₹$€£]|rs|inr)/i;
  const priceMatch = text.match(priceRegex);
  if (priceMatch) {
    const pStr = priceMatch[1] || priceMatch[2];
    estimatedPrice = parseFloat(pStr);
    text = text.replace(priceMatch[0], '').trim();
  }

  // Extract Quantity with units: e.g. "2 packs", "3 pcs", "2 dozen", "2x"
  let quantity = 1;
  const countRegex = /\b(\d+)\s*(?:x|packs?|packets?|pcs?|pieces?|boxes?|bottles?|cans?|dozens?)\b/i;
  const countMatch = text.match(countRegex);
  if (countMatch) {
    quantity = parseInt(countMatch[1], 10);
    // Don't remove unit yet if it tells us weightUnit
  } else {
    // Check leading "2x " or "3 "
    const leadCountMatch = text.match(/^(\d+)\s*x\s+/i);
    if (leadCountMatch) {
      quantity = parseInt(leadCountMatch[1], 10);
      text = text.replace(leadCountMatch[0], '').trim();
    }
  }

  // Extract Weight & Unit: e.g. "500g", "5 kg", "1.5 L", "750 ml", "1 dozen", "2 pack"
  let weightValue: number | undefined = undefined;
  let weightUnit: WeightUnit = 'packet';

  const weightRegex = /\b(\d+(?:\.\d+)?)\s*(kg|kilos?|g|grams?|l|liters?|litres?|ml|milliliters?|dozen|doz|packets?|packs?|pcs?|pieces?|box|boxes|bottles?|cans?|bunches?)\b/i;
  const weightMatch = text.match(weightRegex);
  if (weightMatch) {
    weightValue = parseFloat(weightMatch[1]);
    const rawUnit = weightMatch[2].toLowerCase();
    
    if (rawUnit.startsWith('kg') || rawUnit.startsWith('kilo')) weightUnit = 'kg';
    else if (rawUnit.startsWith('g') && !rawUnit.startsWith('gar')) weightUnit = 'g';
    else if (rawUnit === 'l' || rawUnit.startsWith('liter') || rawUnit.startsWith('litre')) weightUnit = 'L';
    else if (rawUnit.startsWith('ml')) weightUnit = 'ml';
    else if (rawUnit.startsWith('doz')) weightUnit = 'dozen';
    else if (rawUnit.startsWith('pack')) weightUnit = 'packet';
    else if (rawUnit.startsWith('pc') || rawUnit.startsWith('piece')) weightUnit = 'piece';
    else if (rawUnit.startsWith('box')) weightUnit = 'box';
    else if (rawUnit.startsWith('bottle')) weightUnit = 'bottle';
    else if (rawUnit.startsWith('can')) weightUnit = 'can';
    else if (rawUnit.startsWith('bunch')) weightUnit = 'bunch';

    text = text.replace(weightMatch[0], '').trim();
  }

  // Extract Brand if any known brand is present
  let detectedBrand: string | undefined = undefined;
  for (const brand of KNOWN_BRANDS) {
    const brandRegex = new RegExp(`\\b${brand}\\b`, 'i');
    if (brandRegex.test(text)) {
      detectedBrand = brand;
      // We can leave it in or keep clean name
      break;
    }
  }

  // Clean up residual punctuation and extra spaces
  let cleanName = text.replace(/[,;]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanName) {
    cleanName = rawText.trim();
  }

  // Capitalize nicely
  cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  // Guess Category
  let detectedCategory: GroceryCategory = 'Other Essentials';
  const lowerFull = (rawText + ' ' + cleanName + ' ' + (detectedBrand || '')).toLowerCase();
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [GroceryCategory, string[]][]) {
    if (keywords.some(k => lowerFull.includes(k))) {
      detectedCategory = cat;
      break;
    }
  }

  // Sensible default unit if not specified
  if (!weightValue) {
    if (detectedCategory === 'Produce & Veggies') {
      weightUnit = 'kg';
      weightValue = 1;
    } else if (detectedCategory === 'Dairy & Eggs' && lowerFull.includes('milk')) {
      weightUnit = 'L';
      weightValue = 1;
    } else if (detectedCategory === 'Dairy & Eggs' && lowerFull.includes('egg')) {
      weightUnit = 'dozen';
      weightValue = 1;
    }
  }

  return {
    name: cleanName,
    brand: detectedBrand,
    quantity: Math.max(1, quantity),
    weightValue,
    weightUnit,
    estimatedPrice,
    category: detectedCategory,
    fallbackAlternative,
  };
}
