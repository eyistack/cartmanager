import { GroceryItem, GroceryCategory } from '../types';

const CATEGORY_EMOJIS: Record<GroceryCategory, string> = {
  'Produce & Veggies': '🥦',
  'Dairy & Eggs': '🥛',
  'Grains & Pulses': '🌾',
  'Spices & Oils': '🫒',
  'Snacks & Drinks': '🍪',
  'Bakery & Frozen': '🥐',
  'Cleaning & Household': '🧼',
  'Personal Care': '🧴',
  'Meat & Seafood': '🥩',
  'Other Essentials': '🛒',
};

export function formatWhatsAppMessage(
  items: GroceryItem[],
  currency: string = '₹',
  title: string = 'Grocery Shopping List'
): string {
  if (items.length === 0) {
    return `🛒 *${title}*\n\n(No items on the list yet!)`;
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  let message = `🛒 *${title}* (${today})\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Group items by category
  const grouped: Record<string, GroceryItem[]> = {};
  items.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  let totalEstimated = 0;
  let totalItemsCount = 0;

  for (const [category, catItems] of Object.entries(grouped)) {
    const emoji = CATEGORY_EMOJIS[category as GroceryCategory] || '📦';
    message += `${emoji} *${category.toUpperCase()}*\n`;

    catItems.forEach((item, idx) => {
      totalItemsCount++;
      const estPrice = item.estimatedPrice ? item.estimatedPrice * item.quantity : 0;
      totalEstimated += estPrice;

      let spec = '';
      if (item.weightValue) {
        spec += `${item.weightValue} ${item.weightUnit}`;
      } else if (item.weightUnit && item.weightUnit !== 'piece' && item.weightUnit !== 'packet') {
        spec += `${item.weightUnit}`;
      }

      let line = `  ${idx + 1}. *${item.name}*`;
      if (item.brand) {
        line += ` [${item.brand}]`;
      }
      
      const qtyStr = item.quantity > 1 ? ` × ${item.quantity}` : '';
      if (spec) {
        line += ` (${spec}${qtyStr})`;
      } else if (qtyStr) {
        line += ` (${qtyStr.trim()})`;
      }

      if (item.estimatedPrice) {
        line += ` ~ ${currency}${item.estimatedPrice * item.quantity}`;
      }

      message += `${line}\n`;

      if (item.fallbackAlternative) {
        message += `     ↪️ *Alt:* ${item.fallbackAlternative}\n`;
      }
      if (item.notes) {
        message += `     💬 *Note:* ${item.notes}\n`;
      }
    });

    message += `\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📦 *Total Items:* ${totalItemsCount}\n`;
  if (totalEstimated > 0) {
    message += `💰 *Est. Total Spend:* ${currency}${totalEstimated.toLocaleString()}\n`;
  }
  message += `\n_Generated via CartManager Smart Grocery Assistant_`;

  return message;
}

export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function exportItemsToCSV(items: GroceryItem[], currency: string = '₹'): string {
  const headers = [
    'Name',
    'Brand',
    'Category',
    'Quantity',
    'Weight/Volume',
    'Unit',
    `Est. Price (${currency})`,
    `Actual Price (${currency})`,
    'Status',
    'Fallback Alternative',
    'Impulse Buy?',
    'Notes',
  ];

  const rows = items.map(i => [
    `"${(i.name || '').replace(/"/g, '""')}"`,
    `"${(i.brand || '').replace(/"/g, '""')}"`,
    `"${i.category}"`,
    i.quantity,
    i.weightValue ?? '',
    i.weightUnit,
    i.estimatedPrice ?? '',
    i.actualPrice ?? '',
    i.status,
    `"${(i.fallbackAlternative || '').replace(/"/g, '""')}"`,
    i.isImpulseBuy ? 'Yes' : 'No',
    `"${(i.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
