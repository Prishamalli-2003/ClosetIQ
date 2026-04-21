// Basic cost-per-wear in raw numbers (no currency formatting)
export const calculateCostPerWear = (price, wearCount) => {
  const p = Number(price) || 0;
  const w = Number(wearCount) || 0;
  return w > 0 ? p / w : p;
};

// Enhanced CPW calculation based on price range and occasion type
const getExpectedWearsByPriceAndOccasion = (price, category, type) => {
  const p = Number(price) || 0;
  
  // Traditional/formal wear expectations
  if (category === 'traditional' || category === 'dress') {
    if (type === 'saree' || type === 'lehenga' || type === 'evening-gown') {
      if (p >= 15000) return 3; // Very expensive traditional/formal
      if (p >= 8000) return 6;  // Expensive traditional/formal
      if (p >= 3000) return 12; // Mid-range traditional/formal
      return 20; // Affordable traditional/formal
    }
  }
  
  // General price-based expectations
  if (p >= 20000) return 4;   // Ultra-expensive items (designer pieces)
  if (p >= 10000) return 8;   // Very expensive (luxury/wedding wear)
  if (p >= 5000) return 15;   // Expensive (formal/occasion wear)
  if (p >= 2000) return 25;   // Mid-range (work/smart casual)
  return 40;                  // Affordable (everyday/casual)
};

export const calculateSmartCostPerWear = (price, wearCount, category = '', type = '') => {
  const p = Number(price) || 0;
  const w = Number(wearCount) || 0;
  const expectedWears = getExpectedWearsByPriceAndOccasion(p, category, type);
  
  if (w === 0) return p; // Never worn
  
  // If worn less than expected, show potential CPW
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
  
  return p / w; // Achieved good value
};

// For different outfit types, CPW should feel fair:
// - Expensive function / occasion wear: fewer expected wears
// - Everyday casual: many wears
const expectedWearCountForPrice = (price) => {
  const p = Number(price) || 0;
  if (p >= 8000) return 6;   // wedding / function outfits
  if (p >= 4000) return 15;  // formal / occasion
  return 30;                 // casual / work / basics
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
    if (!lastWorn) return true; // never worn
    const lastWornTime = typeof lastWorn?.toMillis === 'function' ? lastWorn.toMillis() : new Date(lastWorn).getTime();
    const daysSinceLastWorn = (now.getTime() - lastWornTime) / (1000 * 60 * 60 * 24);
    return daysSinceLastWorn > thresholdDays;
  });
};

export const detectRedundancy = (items, newItem) => {
  const newPrice = Number(newItem.price) || 0;
  const priceWindow = Math.max(500, newPrice * 0.15); // INR-aware window
  const similarItems = items.filter(item => 
    item.category === newItem.category &&
    item.color === newItem.color &&
    Math.abs((item.purchasePrice ?? item.price ?? 0) - newPrice) < priceWindow
  );
  
  return {
    similarCount: similarItems.length,
    items: similarItems,
    recommendation: similarItems.length >= 3 ? 
      "You already have similar items. Consider if this is necessary." : 
      "This could be a good addition to your wardrobe."
  };
};

// Rule-based color compatibility (neutral goes with everything; prefer user favorites)
const areColorsCompatible = (color1, color2, favoriteColors = []) => {
  const neutrals = ['black', 'white', 'navy', 'gray', 'beige', 'brown'];
  if (!color1 || !color2) return true;
  if (neutrals.includes(color1) || neutrals.includes(color2)) return true;
  if (color1 === color2) return true;
  if (favoriteColors && favoriteColors.length && (favoriteColors.includes(color1) || favoriteColors.includes(color2))) return true;
  return true; // default allow for variety
};

export const suggestItemsForDeletion = (items, maxItems = 50) => {
  if (items.length <= maxItems) return [];
  
  const now = new Date();
  const sixMonthsAgo = now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000);
  
  // Score items for deletion (higher score = better candidate for deletion)
  const scoredItems = items.map(item => {
    let score = 0;
    const wearCount = item.wearCount || 0;
    const lastWorn = item.lastWorn;
    const price = item.purchasePrice || item.price || 0;
    
    // Low wear count increases deletion score
    if (wearCount === 0) score += 10;
    else if (wearCount <= 2) score += 7;
    else if (wearCount <= 5) score += 3;
    
    // Old items with no recent wear
    if (!lastWorn) {
      score += 8;
    } else {
      const lastWornTime = typeof lastWorn?.toMillis === 'function' ? 
        lastWorn.toMillis() : new Date(lastWorn).getTime();
      if (lastWornTime < sixMonthsAgo) score += 6;
    }
    
    // High cost per wear
    const cpw = calculateCostPerWear(price, wearCount);
    if (cpw > price * 0.8) score += 5; // CPW is 80%+ of original price
    
    return { ...item, deletionScore: score };
  });
  
  // Sort by deletion score and return top candidates
  return scoredItems
    .sort((a, b) => b.deletionScore - a.deletionScore)
    .slice(0, Math.min(10, items.length - maxItems + 5))
    .map(item => ({
      ...item,
      reason: getDeletionReason(item)
    }));
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

  const tops = wardrobe.filter(item => item.category === 'top');
  const bottoms = wardrobe.filter(item => item.category === 'bottom');
  const dresses = wardrobe.filter(item => item.category === 'dress');
  const traditional = wardrobe.filter(item => item.category === 'traditional');
  const outerwear = wardrobe.filter(item => item.category === 'outerwear');

  const neutrals = ['black', 'white', 'navy', 'gray', 'beige', 'brown'];
  const destination = context.destination || null;
  const mood = context.mood || null;
  const weather = context.weather || 'moderate';
  const formality = context.formality || 'casual';

  const matchesDestination = (item) => {
    if (!destination || destination === 'other') return true;
    const occ = item.preferredOccasion || item.category || 'other';
    if (occ === destination) return true;
    if (occ === 'other') return true;
    if ((destination === 'formal' && occ === 'work') || (destination === 'work' && occ === 'formal')) return true;
    return false;
  };

  const matchesFormality = (item, formalityLevel) => {
    const formalCategories = ['formal', 'business-casual', 'black-tie'];
    const casualCategories = ['very-casual', 'casual', 'smart-casual'];
    
    if (formalCategories.includes(formalityLevel)) {
      return item.type !== 't-shirt' && item.type !== 'hoodie' && item.type !== 'shorts';
    }
    return true;
  };

  const wearBonus = (item) => {
    const w = item.wearCount ?? 0;
    if (w === 0) return 2;
    if (w < 3) return 1;
    return 0;
  };

  // DRESS RECOMMENDATIONS (standalone outfits)
  dresses.forEach(dress => {
    if (!matchesDestination(dress)) return;
    if (!matchesFormality(dress, formality)) return;

    let score = 0;
    const reasons = [];

    // Rotate underused pieces
    score += wearBonus(dress);
    if (wearBonus(dress)) reasons.push('helps rotate underused items');

    // Favourites
    if (favColors.includes(dress.color)) {
      score += 1;
      reasons.push('uses your favourite colour');
    }

    // Weather appropriate
    if (weather === 'hot' || weather === 'warm') {
      score += 1;
      reasons.push('perfect for warm weather');
    }

    // Formality match
    if (formality === 'formal' || formality === 'black-tie') {
      if (dress.type === 'evening-gown' || dress.type === 'cocktail-dress') {
        score += 2;
        reasons.push('matches formal occasion');
      }
    }

    // Find matching outerwear if weather is cool/cold
    let ow = null;
    if (weather === 'cool' || weather === 'cold') {
      ow = outerwear.find(owItem => areColorsCompatible(owItem.color, dress.color, favColors));
      if (ow) {
        score += 1;
        reasons.push('includes outerwear for cooler weather');
      }
    }

    recommendations.push({
      dress,
      outerwear: ow || null,
      score,
      explanation: `${dress.name} (${dress.color}) - ${reasons.join(', ') || 'great choice for this occasion'}.`,
    });
  });

  // TRADITIONAL WEAR RECOMMENDATIONS (standalone outfits)
  traditional.forEach(item => {
    if (!matchesDestination(item)) return;

    let score = 0;
    const reasons = [];

    score += wearBonus(item);
    if (wearBonus(item)) reasons.push('helps rotate underused items');

    if (favColors.includes(item.color)) {
      score += 1;
      reasons.push('uses your favourite colour');
    }

    // Traditional wear is great for cultural/festive occasions
    if (destination === 'party' || destination === 'wedding' || destination === 'festive') {
      score += 2;
      reasons.push('perfect for cultural occasions');
    }

    recommendations.push({
      traditional: item,
      score,
      explanation: `${item.name} (${item.color}) - ${reasons.join(', ') || 'elegant traditional choice'}.`,
    });
  });

  // TOP + BOTTOM COMBINATIONS
  tops.forEach(top => {
    bottoms.forEach(bottom => {
      if (!areColorsCompatible(top.color, bottom.color, favColors)) return;
      if (!matchesDestination(top) || !matchesDestination(bottom)) return;
      if (!matchesFormality(top, formality) || !matchesFormality(bottom, formality)) return;

      let score = 0;
      const reasons = [];

      // Rotate underused pieces
      score += wearBonus(top) + wearBonus(bottom);
      if (wearBonus(top) || wearBonus(bottom)) reasons.push('helps rotate underused items');

      // Favourites
      if (favColors.includes(top.color) || favColors.includes(bottom.color)) {
        score += 1;
        reasons.push('uses your favourite colours');
      }

      // Mood: tired/stressed → simpler neutral combos
      if (mood === 'tired' || mood === 'stressed') {
        const neutralCount = (neutrals.includes(top.color) ? 1 : 0) + (neutrals.includes(bottom.color) ? 1 : 0);
        score += neutralCount;
        if (neutralCount > 0) reasons.push('neutral, low-effort combination for your mood');
      }

      // Weather considerations
      if (weather === 'hot' && (top.type === 't-shirt' || top.type === 'tank')) {
        score += 1;
        reasons.push('light clothing for hot weather');
      }

      const ow = outerwear.find(owItem => areColorsCompatible(owItem.color, top.color, favColors));
      if (ow && (weather === 'cool' || weather === 'cold')) {
        score += 1;
        reasons.push('includes outerwear for cooler weather');
      }

      recommendations.push({
        top,
        bottom,
        outerwear: ow || null,
        score,
        explanation: `${top.name} + ${bottom.name} - color harmony (${top.color} + ${bottom.color}), ${reasons.join(', ') || 'fits your preferences'}.`,
      });
    });
  });

  return recommendations
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5);
};