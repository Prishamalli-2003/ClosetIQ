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

const expectedWearCountForPrice = (price) => {
  const p = Number(price) || 0;
  if (p >= 8000) return 6;
  if (p >= 4000) return 15;
  return 30;
};

export const calculateAdjustedCostPerWear = (price, wearCount) => {
  const p = Number(price) || 0;
  const w = Number(wearCount) || 0;
  const baseline = expectedWearCountForPrice(p);
  const effective = Math.max(w, baseline);
  return effective > 0 ? p / effective : p;
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
  const newBrand = (newItem.brand || '').toLowerCase().trim();

  const similarItems = items.filter(item => {
    const itemName = (item.name || '').toLowerCase().trim();
    const itemBrand = (item.brand || '').toLowerCase().trim();
    const itemPrice = Number(item.purchasePrice ?? item.price ?? 0);
    const priceWindow = Math.max(1000, newPrice * 0.4);

    if (newName.length > 2 && itemName === newName) return true;
    if (newBrand && itemBrand && newBrand === itemBrand &&
        item.category === newCategory && item.color === newColor) return true;
    if (item.category === newCategory && item.color === newColor &&
        newPrice > 0 && Math.abs(itemPrice - newPrice) < priceWindow) return true;
    if (item.category === newCategory && item.color === newColor) return true;
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

export const generateOutfitRecommendations = (wardrobe, preferences = {}, context = {}) => {
  const recommendations = [];
  const favColors = preferences.favoriteColors || [];
  const neutrals = ['black', 'white', 'navy', 'gray', 'beige', 'brown'];

  const tops      = wardrobe.filter(i => i.category === 'top');
  const bottoms   = wardrobe.filter(i => i.category === 'bottom');
  const dresses   = wardrobe.filter(i => i.category === 'dress');
  const traditional = wardrobe.filter(i => i.category === 'traditional');
  const outerwear = wardrobe.filter(i => i.category === 'outerwear');

  const weather   = context.weather   || 'moderate';
  const formality = context.formality || 'casual';
  const mood      = context.mood      || null;
  const destination = context.destination || null;

  const wearBonus = (item) => {
    const w = item.wearCount ?? 0;
    if (w === 0) return 2;
    if (w < 3) return 1;
    return 0;
  };

  // Only block obvious mismatches for formality
  const formalityOk = (item) => {
    if (formality === 'black-tie' || formality === 'business-formal') {
      return !['hoodie', 'joggers', 'leggings', 'tank'].includes(item.type);
    }
    return true;
  };

  // Only block heavy items in hot weather, light items in cold
  const weatherOk = (item) => {
    if (weather === 'hot') return !['sweater', 'coat', 'turtleneck'].includes(item.type);
    if (weather === 'cold') return !['tank', 'shorts', 'camisole'].includes(item.type);
    return true;
  };

  // DRESSES
  dresses.forEach(dress => {
    if (!formalityOk(dress) || !weatherOk(dress)) return;
    let score = wearBonus(dress);
    const reasons = [];
    if (favColors.includes(dress.color)) { score += 1; reasons.push('your favourite colour'); }
    if (weather === 'hot' || weather === 'warm') { score += 1; reasons.push('great for warm weather'); }
    if (['formal', 'black-tie', 'business-formal'].includes(formality) &&
        ['evening-gown', 'cocktail-dress', 'formal-dress'].includes(dress.type)) {
      score += 2; reasons.push('perfect for formal occasions');
    }
    if (['party', 'date', 'wedding'].includes(destination)) { score += 1; reasons.push('ideal for ' + destination); }
    let ow = null;
    if (weather === 'cool' || weather === 'cold') {
      ow = outerwear.find(o => neutrals.includes(o.color) || o.color === dress.color);
    }
    recommendations.push({
      dress, outerwear: ow || null, score,
      explanation: `${dress.name} (${dress.color})${ow ? ' + ' + ow.name : ''} — ${reasons.join(', ') || 'elegant standalone look'}.`,
    });
  });

  // TRADITIONAL
  traditional.forEach(item => {
    if (!formalityOk(item)) return;
    let score = wearBonus(item);
    const reasons = [];
    if (favColors.includes(item.color)) { score += 1; reasons.push('your favourite colour'); }
    if (['party', 'wedding', 'festival', 'religious'].includes(destination)) {
      score += 2; reasons.push('perfect for ' + destination);
    }
    recommendations.push({
      traditional: item, score,
      explanation: `${item.name} (${item.color}) — ${reasons.join(', ') || 'elegant traditional choice'}.`,
    });
  });

  // TOP + BOTTOM
  tops.forEach(top => {
    if (!formalityOk(top) || !weatherOk(top)) return;
    bottoms.forEach(bottom => {
      if (!formalityOk(bottom) || !weatherOk(bottom)) return;
      if (!areColorsCompatible(top.color, bottom.color, favColors)) return;

      let score = wearBonus(top) + wearBonus(bottom);
      const reasons = [];

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
      if (['casual', 'shopping'].includes(destination) &&
          ['t-shirt', 'crop-top', 'tank'].includes(top.type) &&
          ['jeans', 'shorts', 'leggings'].includes(bottom.type)) {
        score += 1; reasons.push('relaxed casual look');
      }

      let ow = null;
      if (weather === 'cool' || weather === 'cold') {
        ow = outerwear.find(o => neutrals.includes(o.color) || o.color === top.color);
        if (ow) { score += 1; reasons.push('layered for cooler weather'); }
      }

      recommendations.push({
        top, bottom, outerwear: ow || null, score,
        explanation: `${top.name} + ${bottom.name}${ow ? ' + ' + ow.name : ''} — ${reasons.join(', ') || 'versatile combination'}.`,
      });
    });
  });

  // Sort and deduplicate — pick 5 diverse outfits
  const sorted = recommendations.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const usedTops = new Set();
  const usedBottoms = new Set();
  const usedDresses = new Set();
  const result = [];

  for (const rec of sorted) {
    if (result.length >= 5) break;
    if (rec.dress) {
      if (usedDresses.has(rec.dress.id)) continue;
      usedDresses.add(rec.dress.id);
    } else if (rec.traditional) {
      // always include
    } else {
      if (usedTops.has(rec.top?.id) && usedBottoms.has(rec.bottom?.id)) continue;
      usedTops.add(rec.top?.id);
      usedBottoms.add(rec.bottom?.id);
    }
    result.push(rec);
  }

  return result;
};
