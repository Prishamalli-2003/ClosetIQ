// Basic cost-per-wear in raw numbers (no currency formatting)
export const calculateCostPerWear = (price, wearCount) => {
  const p = Number(price) || 0;
  const w = Number(wearCount) || 0;
  return w > 0 ? p / w : p;
};

const getExpectedWearsByPriceAndOccasion = (price, category, type) => {
  const p = Number(price) || 0;
  if (category === 'traditional' || category === 'dress') {
    if (type === 'saree' || type === 'lehenga' || type === 'evening-gown') {
      if (p >= 15000) return 3;
      if (p >= 8000) return 6;
      if (p >= 3000) return 12;
      return 20;
    }
  }
  if (p >= 20000) return 4;
  if (p >= 10000) return 8;
  if (p >= 5000) return 15;
  if (p >= 2000) return 25;
  return 40;
};

export const calculateSmartCostPerWear = (price, wearCount, category = '', type = '') => {
  const p = Number(price) || 0;
  const w = Number(wearCount) || 0;
  const expectedWears = getExpectedWearsByPriceAndOccasion(p, category, type);
  if (w === 0) return p;
  if (w < expectedWears) {
    const potentialCPW = p / expectedWears;
    const currentCPW = p / w;
    return {
      current: currentCPW,
      potential: potentialCPW,
      expectedWears,
      message: `Current: ₹${currentCPW.toFixed(0)} | Target: ₹${potentialCPW.toFixed(0)} (${expectedWears} wears)`
    };
  }
  return p / w;
};

// ─── SMART CPW LOGIC ─────────────────────────────────────────────────────────
//
// CPW = Price ÷ Actual Wears (only when worn ≥ 1 time)
//
// For context we also show a "target CPW" — what the CPW would be
// if worn the expected number of times for that item type/price.
//
// Expected wear counts by category & price:
//   Everyday casual (t-shirt, jeans, leggings) → 50 wears/year
//   Office/smart casual (shirt, blazer, trousers) → 20 wears/year
//   Party/cocktail dress → 5 wears/year
//   Wedding/formal saree (₹5k–₹20k) → 8 wears lifetime
//   Designer/heirloom saree (₹20k+) → 3 wears lifetime
//   Shoes (everyday) → 40 wears/year
//   Accessories (bag, watch) → 100 wears/year (daily use)

const EXPECTED_WEARS = {
  // Traditional
  saree_budget:    8,   // < ₹5,000 — worn more often
  saree_mid:       6,   // ₹5k–₹20k
  saree_premium:   3,   // ₹20k+ — heirloom, worn rarely
  lehenga:         2,   // worn 1-2 times
  anarkali:        8,
  kurti:           30,  // daily/casual
  salwar_kameez:   15,
  // Dresses
  sundress:        20,
  casual_dress:    15,
  midi_dress:      10,
  cocktail_dress:  5,
  evening_gown:    3,
  formal_dress:    5,
  // Tops
  't-shirt':       50,
  shirt:           25,
  blouse:          20,
  hoodie:          30,
  sweater:         20,
  'crop-top':      25,
  camisole:        40,
  tank:            40,
  bodysuit:        20,
  polo:            25,
  // Bottoms
  jeans:           50,
  trousers:        25,
  skirt:           20,
  leggings:        40,
  palazzo:         20,
  chinos:          25,
  joggers:         30,
  shorts:          30,
  culottes:        15,
  // Outerwear
  jacket:          20,
  coat:            15,
  blazer:          20,
  cardigan:        25,
  shawl:           10,
  // Shoes
  sneakers:        50,
  boots:           25,
  heels:           15,
  sandals:         20,
  'ballet-flats':  30,
  loafers:         25,
  stilettos:       10,
  // Accessories
  handbag:         100,
  bag:             80,
  watch:           200,
  jewelry:         50,
  belt:            60,
  clutch:          10,
  backpack:        80,
  scarf:           20,
};

const getExpectedWears = (category, type, price) => {
  const p = Number(price) || 0;

  // Sarees — price-tiered
  if (type === 'saree') {
    if (p >= 20000) return EXPECTED_WEARS.saree_premium;
    if (p >= 5000)  return EXPECTED_WEARS.saree_mid;
    return EXPECTED_WEARS.saree_budget;
  }

  // Lehenga — almost always worn once or twice
  if (type === 'lehenga') return EXPECTED_WEARS.lehenga;

  // Look up by type first
  const byType = EXPECTED_WEARS[type] || EXPECTED_WEARS[type?.replace('-', '_')];
  if (byType) return byType;

  // Fallback by category
  const fallbacks = { top: 30, bottom: 30, dress: 10, traditional: 8, outerwear: 20, shoes: 30, accessory: 60 };
  return fallbacks[category] || 20;
};

/**
 * Returns actual CPW (price ÷ wears) when worn ≥ 1 time.
 * Returns null when never worn.
 */
export const calculateAdjustedCostPerWear = (price, wearCount, category = '', type = '') => {
  const p = Number(price) || 0;
  const w = Number(wearCount) || 0;
  if (w === 0) return null; // not worn yet
  return p / w;
};

/**
 * Returns the target CPW — what CPW would be if worn the expected number of times.
 * Used to show "you're getting good value" vs "you need to wear this more".
 */
export const getTargetCPW = (price, category, type) => {
  const p = Number(price) || 0;
  const expected = getExpectedWears(category, type, p);
  return { targetCPW: Math.round(p / expected), expectedWears: expected };
};

/**
 * Returns a value assessment string based on actual vs target CPW.
 */
export const getCPWAssessment = (price, wearCount, category, type) => {
  const p = Number(price) || 0;
  const w = Number(wearCount) || 0;
  if (w === 0) return null;

  const actualCPW = p / w;
  const { targetCPW, expectedWears } = getTargetCPW(p, category, type);

  if (actualCPW <= targetCPW) return { label: '✅ Great value', color: '#22c55e' };
  if (actualCPW <= targetCPW * 2) return { label: '⚡ Wear more', color: '#f59e0b' };
  return { label: `👗 Wear ${expectedWears - w} more times`, color: '#ef4444' };
};

export const identifyUnderutilized = (items, thresholdDays = 30) => {
  const now = new Date();
  return items.filter(item => {
    const wearCount = item.wearCount ?? 0;
    if (wearCount >= 3) return false;
    const lastWorn = item.lastWorn;
    if (!lastWorn) return true;
    const lastWornTime = typeof lastWorn?.toMillis === 'function' ? lastWorn.toMillis() : new Date(lastWorn).getTime();
    const daysSinceLastWorn = (now.getTime() - lastWornTime) / (1000 * 60 * 60 * 24);
    return daysSinceLastWorn > thresholdDays;
  });
};

export const detectRedundancy = (items, newItem) => {
  const newPrice = Number(newItem.price) || 0;
  const newName = (newItem.name || '').toLowerCase().trim();
  const newCategory = newItem.category || '';
  const newColor = newItem.color || '';
  const newType = newItem.type || '';
  const newBrand = (newItem.brand || '').toLowerCase().trim();

  // Accessory sub-types that are functionally the same regardless of color/brand
  const BAG_TYPES = ['handbag', 'bag', 'tote', 'clutch', 'backpack', 'sling', 'purse'];
  const SHOE_TYPES = ['sneakers', 'boots', 'heels', 'sandals', 'flats', 'loafers', 'stilettos', 'wedges', 'ballet-flats'];
  const WATCH_TYPES = ['watch'];

  const similarItems = items.filter(item => {
    const itemName = (item.name || '').toLowerCase().trim();
    const itemBrand = (item.brand || '').toLowerCase().trim();
    const itemPrice = Number(item.purchasePrice ?? item.price ?? 0);
    const itemType = item.type || '';
    const priceWindow = Math.max(1000, newPrice * 0.5);

    // 1. Exact name match
    if (newName.length > 2 && itemName === newName) return true;

    // 2. Same accessory type (bag = bag regardless of color/brand)
    if (newCategory === 'accessory' && item.category === 'accessory') {
      const newIsBag = BAG_TYPES.some(t => newType.includes(t) || newName.includes(t));
      const itemIsBag = BAG_TYPES.some(t => itemType.includes(t) || itemName.includes(t));
      if (newIsBag && itemIsBag) return true;

      const newIsShoe = SHOE_TYPES.includes(newType);
      const itemIsShoe = SHOE_TYPES.includes(itemType);
      if (newIsShoe && itemIsShoe && newType === itemType) return true;

      const newIsWatch = WATCH_TYPES.includes(newType);
      const itemIsWatch = WATCH_TYPES.includes(itemType);
      if (newIsWatch && itemIsWatch) return true;
    }

    // 3. Same shoe type (sneakers = sneakers regardless of brand)
    if (newCategory === 'shoes' && item.category === 'shoes' && newType === itemType) return true;

    // 4. Same brand + same category + same color
    if (newBrand && itemBrand && newBrand === itemBrand &&
        item.category === newCategory && item.color === newColor) return true;

    // 5. Same category + same color + similar price
    if (item.category === newCategory && item.color === newColor &&
        newPrice > 0 && Math.abs(itemPrice - newPrice) < priceWindow) return true;

    // 6. Same category + same color (general)
    if (item.category === newCategory && item.color === newColor) return true;

    // 7. Name word overlap (2+ meaningful words)
    if (newName.length > 4) {
      const newWords = newName.split(' ').filter(w => w.length > 3);
      const matchedWords = newWords.filter(w => itemName.includes(w));
      if (matchedWords.length >= 2) return true;
    }

    return false;
  });

  const unique = [...new Map(similarItems.map(i => [i.id, i])).values()];
  return { similarCount: unique.length, items: unique };
};

/**
 * Generate a simple perceptual fingerprint from a Base64 image.
 * Draws the image at 8x8, converts to grayscale, returns a 64-bit hash string.
 * Two photos of the same item will produce identical or near-identical hashes.
 */
export const imageFingerprint = (base64DataUrl) => {
  return new Promise((resolve) => {
    if (!base64DataUrl || !base64DataUrl.startsWith('data:')) {
      resolve(null);
      return;
    }
    try {
      const img = new Image();
      img.onload = () => {
        const SIZE = 8;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
        // Convert to grayscale values
        const grays = [];
        for (let i = 0; i < data.length; i += 4) {
          grays.push(Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]));
        }
        // Average hash — compare each pixel to mean
        const mean = grays.reduce((a, b) => a + b, 0) / grays.length;
        const hash = grays.map(g => g >= mean ? '1' : '0').join('');
        canvas.width = 0; canvas.height = 0;
        resolve(hash);
      };
      img.onerror = () => resolve(null);
      img.src = base64DataUrl;
    } catch {
      resolve(null);
    }
  });
};

/**
 * Compare two fingerprint hashes — returns similarity 0-1.
 * >= 0.85 means visually very similar (same item, different angle/lighting).
 */
export const hashSimilarity = (hash1, hash2) => {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 0;
  let matches = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matches++;
  }
  return matches / hash1.length;
};

const areColorsCompatible = (color1, color2, favoriteColors = []) => {
  const neutrals = ['black', 'white', 'navy', 'gray', 'beige', 'brown'];
  if (!color1 || !color2) return true;
  if (neutrals.includes(color1) || neutrals.includes(color2)) return true;
  if (color1 === color2) return true;
  if (favoriteColors?.length && (favoriteColors.includes(color1) || favoriteColors.includes(color2))) return true;
  return true;
};

export const suggestItemsForDeletion = (items, maxItems = 50) => {
  if (items.length <= maxItems) return [];
  const now = new Date();
  const sixMonthsAgo = now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000);
  const scoredItems = items.map(item => {
    let score = 0;
    const wearCount = item.wearCount || 0;
    const lastWorn = item.lastWorn;
    const price = item.purchasePrice || item.price || 0;
    if (wearCount === 0) score += 10;
    else if (wearCount <= 2) score += 7;
    else if (wearCount <= 5) score += 3;
    if (!lastWorn) {
      score += 8;
    } else {
      const lastWornTime = typeof lastWorn?.toMillis === 'function' ?
        lastWorn.toMillis() : new Date(lastWorn).getTime();
      if (lastWornTime < sixMonthsAgo) score += 6;
    }
    const cpw = calculateCostPerWear(price, wearCount);
    if (cpw > price * 0.8) score += 5;
    return { ...item, deletionScore: score };
  });
  return scoredItems
    .sort((a, b) => b.deletionScore - a.deletionScore)
    .slice(0, Math.min(10, items.length - maxItems + 5))
    .map(item => ({ ...item, reason: getDeletionReason(item) }));
};

const getDeletionReason = (item) => {
  const wearCount = item.wearCount || 0;
  const lastWorn = item.lastWorn;
  if (wearCount === 0) return "Never worn - consider if you'll actually use it";
  if (wearCount <= 2) return "Rarely worn - might not suit your lifestyle";
  if (!lastWorn) return "No recent wear data - possibly forgotten";
  const lastWornTime = typeof lastWorn?.toMillis === 'function' ?
    lastWorn.toMillis() : new Date(lastWorn).getTime();
  const monthsAgo = (Date.now() - lastWornTime) / (30 * 24 * 60 * 60 * 1000);
  if (monthsAgo > 6) return `Last worn ${Math.floor(monthsAgo)} months ago`;
  return "Low utilization for the price paid";
};

// ─── OUTFIT CATEGORY RULES ────────────────────────────────────────────────────
// Maps occasion/destination to which outfit categories are appropriate
const OCCASION_RULES = {
  wedding:    { allow: ['traditional', 'dress'],          priority: ['traditional'] },
  festival:   { allow: ['traditional', 'dress'],          priority: ['traditional'] },
  religious:  { allow: ['traditional'],                   priority: ['traditional'] },
  party:      { allow: ['dress', 'traditional', 'top+bottom'], priority: ['dress'] },
  formal:     { allow: ['dress', 'top+bottom'],           priority: ['dress'] },
  work:       { allow: ['top+bottom'],                    priority: ['top+bottom'] },
  casual:     { allow: ['top+bottom', 'dress'],           priority: ['top+bottom'] },
  date:       { allow: ['dress', 'top+bottom'],           priority: ['dress'] },
  sport:      { allow: ['top+bottom'],                    priority: ['top+bottom'] },
  travel:     { allow: ['top+bottom', 'dress'],           priority: ['top+bottom'] },
  shopping:   { allow: ['top+bottom', 'dress'],           priority: ['top+bottom'] },
};

// Outerwear that pairs with traditional wear (shawls, dupattas only)
const TRADITIONAL_OUTERWEAR = ['shawl', 'cape', 'poncho'];
// Outerwear that pairs with western wear
const WESTERN_OUTERWEAR = ['jacket', 'coat', 'blazer', 'cardigan', 'vest'];

export const generateOutfitRecommendations = (wardrobe, preferences = {}, context = {}) => {
  const recommendations = [];
  const favColors = preferences.favoriteColors || [];
  const neutrals = ['black', 'white', 'navy', 'gray', 'beige', 'brown'];

  const tops       = wardrobe.filter(i => i.category === 'top');
  const bottoms    = wardrobe.filter(i => i.category === 'bottom');
  const dresses    = wardrobe.filter(i => i.category === 'dress');
  const traditional = wardrobe.filter(i => i.category === 'traditional');
  const outerwear  = wardrobe.filter(i => i.category === 'outerwear');
  const accessories = wardrobe.filter(i => i.category === 'accessory');
  const shoes      = wardrobe.filter(i => i.category === 'shoes');

  const weather     = context.weather     || 'moderate';
  const formality   = context.formality   || 'casual';
  const mood        = context.mood        || null;
  const destination = context.destination || 'casual';

  // Get rules for this occasion
  const rules = OCCASION_RULES[destination] || OCCASION_RULES.casual;
  const allowedTypes = rules.allow;
  const priorityTypes = rules.priority;

  const wearBonus = (item) => {
    const w = item.wearCount ?? 0;
    if (w === 0) return 2;
    if (w < 3) return 1;
    return 0;
  };

  // Formality filter — only block very casual items for formal occasions
  const formalityOk = (item) => {
    if (formality === 'black-tie' || formality === 'business-formal') {
      return !['hoodie', 'joggers', 'leggings', 'tank', 't-shirt'].includes(item.type);
    }
    if (formality === 'very-casual') {
      return !['evening-gown', 'cocktail-dress'].includes(item.type);
    }
    return true;
  };

  // Weather filter
  const weatherOk = (item) => {
    if (weather === 'hot') return !['sweater', 'coat', 'turtleneck', 'hoodie'].includes(item.type);
    if (weather === 'cold') return !['tank', 'shorts', 'camisole', 'sundress'].includes(item.type);
    return true;
  };

  // Find appropriate outerwear for traditional items (shawl/cape only)
  const findTraditionalOuterwear = (item) => {
    if (weather !== 'cool' && weather !== 'cold') return null;
    return outerwear.find(o =>
      TRADITIONAL_OUTERWEAR.includes(o.type) &&
      (neutrals.includes(o.color) || o.color === item.color)
    ) || null;
  };

  // Find appropriate outerwear for western items (jacket/blazer/coat)
  const findWesternOuterwear = (primaryColor) => {
    if (weather !== 'cool' && weather !== 'cold') return null;
    return outerwear.find(o =>
      WESTERN_OUTERWEAR.includes(o.type) &&
      (neutrals.includes(o.color) || o.color === primaryColor)
    ) || null;
  };

  // ── TRADITIONAL outfits ──────────────────────────────────────────────────
  if (allowedTypes.includes('traditional')) {
    traditional.forEach(item => {
      if (!formalityOk(item)) return;
      let score = wearBonus(item);
      const reasons = [];

      // Priority boost for traditional occasions
      if (priorityTypes.includes('traditional')) score += 3;
      if (favColors.includes(item.color)) { score += 1; reasons.push('your favourite colour'); }
      if (['wedding', 'festival', 'religious', 'party'].includes(destination)) {
        score += 2; reasons.push(`perfect for ${destination}`);
      }

      // Traditional outerwear only (shawl/cape) — NO leather jackets
      const ow = findTraditionalOuterwear(item);

      recommendations.push({
        traditional: item,
        outerwear: ow || null,
        score,
        outfitType: 'traditional',
        explanation: `${item.name} (${item.color})${ow ? ' + ' + ow.name : ''} — ${reasons.join(', ') || 'elegant traditional look'}.`,
      });
    });
  }

  // ── DRESS outfits ────────────────────────────────────────────────────────
  if (allowedTypes.includes('dress')) {
    dresses.forEach(dress => {
      if (!formalityOk(dress) || !weatherOk(dress)) return;
      let score = wearBonus(dress);
      const reasons = [];

      if (priorityTypes.includes('dress')) score += 2;
      if (favColors.includes(dress.color)) { score += 1; reasons.push('your favourite colour'); }
      if (weather === 'hot' || weather === 'warm') { score += 1; reasons.push('great for warm weather'); }
      if (['formal', 'black-tie', 'business-formal'].includes(formality) &&
          ['evening-gown', 'cocktail-dress', 'formal-dress'].includes(dress.type)) {
        score += 2; reasons.push('perfect for formal occasions');
      }
      if (['party', 'date', 'wedding'].includes(destination)) {
        score += 1; reasons.push(`ideal for ${destination}`);
      }

      // Western outerwear for dresses (blazer/jacket)
      const ow = findWesternOuterwear(dress.color);

      // Suggest matching accessories for dresses
      const accessory = accessories.find(a =>
        ['clutch', 'handbag'].includes(a.type) &&
        (neutrals.includes(a.color) || a.color === dress.color)
      );
      const shoe = shoes.find(s =>
        ['heels', 'stilettos', 'sandals'].includes(s.type) &&
        (neutrals.includes(s.color) || s.color === dress.color)
      );

      recommendations.push({
        dress,
        outerwear: ow || null,
        accessory: accessory || null,
        shoes: shoe || null,
        score,
        outfitType: 'dress',
        explanation: `${dress.name} (${dress.color})${ow ? ' + ' + ow.name : ''}${accessory ? ' · ' + accessory.name : ''}${shoe ? ' · ' + shoe.name : ''} — ${reasons.join(', ') || 'elegant standalone look'}.`,
      });
    });
  }

  // ── TOP + BOTTOM outfits ─────────────────────────────────────────────────
  if (allowedTypes.includes('top+bottom')) {
    tops.forEach(top => {
      if (!formalityOk(top) || !weatherOk(top)) return;
      bottoms.forEach(bottom => {
        if (!formalityOk(bottom) || !weatherOk(bottom)) return;
        if (!areColorsCompatible(top.color, bottom.color, favColors)) return;

        let score = wearBonus(top) + wearBonus(bottom);
        const reasons = [];

        if (priorityTypes.includes('top+bottom')) score += 1;

        const topNeutral = neutrals.includes(top.color);
        const botNeutral = neutrals.includes(bottom.color);
        if (topNeutral || botNeutral || top.color === bottom.color) {
          score += 1; reasons.push('great colour harmony');
        }
        if (favColors.includes(top.color) || favColors.includes(bottom.color)) {
          score += 1; reasons.push('uses your favourite colours');
        }
        if ((mood === 'tired' || mood === 'stressed') && topNeutral && botNeutral) {
          score += 1; reasons.push('easy neutral combo for your mood');
        }
        if ((mood === 'confident' || mood === 'excited') && (!topNeutral || !botNeutral)) {
          score += 1; reasons.push('bold combo matching your energy');
        }
        if (weather === 'hot' && ['t-shirt', 'tank', 'camisole'].includes(top.type)) {
          score += 1; reasons.push('light and breathable');
        }
        if (weather === 'cold' && ['sweater', 'hoodie'].includes(top.type)) {
          score += 1; reasons.push('warm and cosy');
        }
        if (['work', 'formal'].includes(destination) &&
            ['shirt', 'blouse', 'polo'].includes(top.type) &&
            ['trousers', 'chinos', 'skirt'].includes(bottom.type)) {
          score += 2; reasons.push('smart work-appropriate combo');
        }
        if (['casual', 'shopping', 'travel'].includes(destination) &&
            ['t-shirt', 'crop-top', 'tank'].includes(top.type) &&
            ['jeans', 'shorts', 'leggings'].includes(bottom.type)) {
          score += 1; reasons.push('relaxed casual look');
        }
        if (destination === 'sport' &&
            ['tank', 't-shirt'].includes(top.type) &&
            ['leggings', 'shorts', 'joggers'].includes(bottom.type)) {
          score += 2; reasons.push('perfect activewear combo');
        }

        // Western outerwear only for top+bottom
        const ow = findWesternOuterwear(top.color);
        if (ow) { score += 1; reasons.push('layered for cooler weather'); }

        // Suggest a matching accessory (bag or jewelry) for 1-2 outfits
        const accessory = accessories.find(a =>
          ['handbag', 'bag', 'clutch'].includes(a.type) &&
          (neutrals.includes(a.color) || a.color === top.color || a.color === bottom.color)
        );
        const shoe = shoes.find(s =>
          neutrals.includes(s.color) || s.color === bottom.color
        );

        recommendations.push({
          top, bottom,
          outerwear: ow || null,
          accessory: accessory || null,
          shoes: shoe || null,
          score,
          outfitType: 'top+bottom',
          explanation: `${top.name} + ${bottom.name}${ow ? ' + ' + ow.name : ''}${accessory ? ' · ' + accessory.name : ''}${shoe ? ' · ' + shoe.name : ''} — ${reasons.join(', ') || 'versatile combination'}.`,
        });
      });
    });
  }

  // ── Sort, deduplicate, return top 5 ─────────────────────────────────────
  const sorted = recommendations.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const usedTops     = new Set();
  const usedBottoms  = new Set();
  const usedDresses  = new Set();
  const usedTraditional = new Set();
  const result = [];

  for (const rec of sorted) {
    if (result.length >= 5) break;

    if (rec.traditional) {
      if (usedTraditional.has(rec.traditional.id)) continue;
      usedTraditional.add(rec.traditional.id);
    } else if (rec.dress) {
      if (usedDresses.has(rec.dress.id)) continue;
      usedDresses.add(rec.dress.id);
    } else {
      if (usedTops.has(rec.top?.id) && usedBottoms.has(rec.bottom?.id)) continue;
      usedTops.add(rec.top?.id);
      usedBottoms.add(rec.bottom?.id);
    }
    result.push(rec);
  }

  return result;
};
