/* eslint-disable */
/**
 * ClosetIQ — Centralised Firestore data service
 *
 * Firestore schema:
 *
 * users/{uid}
 *   name, email, gender, createdAt, onboardingComplete, lastActiveAt
 *   preferences: { bodyType, comfortLevel, favoriteColors, favoriteSpots,
 *                  outfitOpinions, stylePreferences, gender }
 *   stats: { totalItems, totalOutfitLogs, totalWardrobeValue,
 *             mostWornCategory, lastUpdated }
 *
 * users/{uid}/wardrobe/{itemId}
 *   name, category, type, color, size, brand, purchasePrice, purchaseDate,
 *   imageUrl, wearCount, lastWorn, createdAt, updatedAt
 *
 * users/{uid}/outfitLogs/{logId}
 *   date, occasion, mood, itemIds, description, brand, outfitType,
 *   imageUrl, totalOutfitValue, createdAt
 *
 * users/{uid}/purchaseDecisions/{decisionId}
 *   itemName, category, color, price, recommendation, similarCount,
 *   similarItems[], addedToWardrobe, decidedAt
 *
 * users/{uid}/analytics/summary
 *   categoryBreakdown, colorBreakdown, avgCostPerWear,
 *   mostWornItems[], underutilizedItems[], totalValue, lastUpdated
 */

import {
  doc, setDoc, updateDoc, getDoc, getDocs,
  collection, addDoc, serverTimestamp, increment,
} from 'firebase/firestore';
import { db, auth } from './firebase';

const uid = () => auth.currentUser?.uid;

// ─── USER PROFILE ────────────────────────────────────────────────────────────

/** Update last active timestamp on every app load */
export const touchLastActive = () => {
  const userId = uid();
  if (!userId) return;
  return updateDoc(doc(db, 'users', userId), {
    lastActiveAt: serverTimestamp(),
  }).catch(() => {}); // silent — non-critical
};

/** Save full onboarding preferences + gender */
export const saveOnboardingData = async (preferences) => {
  const userId = uid();
  if (!userId) return;
  await setDoc(
    doc(db, 'users', userId),
    {
      onboardingComplete: true,
      gender: preferences.gender || null,
      preferences: {
        gender: preferences.gender || null,
        bodyType: preferences.bodyType || null,
        comfortLevel: preferences.comfortLevel || null,
        favoriteColors: preferences.favoriteColors || [],
        favoriteSpots: preferences.favoriteSpots || [],
        outfitOpinions: preferences.outfitOpinions || {},
        stylePreferences: preferences.stylePreferences || [],
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/** Get full user profile */
export const getUserProfile = async () => {
  const userId = uid();
  if (!userId) return null;
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── WARDROBE ─────────────────────────────────────────────────────────────────

/** Add a wardrobe item and update user stats */
export const addWardrobeItem = async (itemData) => {
  const userId = uid();
  if (!userId) throw new Error('Not logged in');

  // Clean, consistent schema stored in Firestore
  const cleanItem = {
    // Identity
    name:          itemData.name?.trim() || 'Unnamed',
    category:      itemData.category || 'top',
    type:          itemData.type || 'other',
    color:         itemData.color || 'black',
    size:          itemData.size || 'M',
    brand:         itemData.brand?.trim() || null,

    // Financial
    purchasePrice: Number(itemData.purchasePrice) || 0,
    purchaseDate:  itemData.purchaseDate || null,

    // Image — stored as URL (Firebase Storage) or Base64 data URL
    imageUrl:      itemData.imageUrl || null,

    // Usage tracking
    wearCount:     0,
    lastWorn:      null,

    // Metadata
    createdAt:     serverTimestamp(),
    updatedAt:     serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'users', userId, 'wardrobe'), cleanItem);

  // Update user-level stats
  await updateDoc(doc(db, 'users', userId), {
    'stats.totalItems':        increment(1),
    'stats.totalWardrobeValue': increment(cleanItem.purchasePrice),
    'stats.lastUpdated':       serverTimestamp(),
  }).catch(() => {});

  return ref.id;
};

/** Log a wear — increments wearCount and updates lastWorn */
export const logWear = async (itemId, date) => {
  const userId = uid();
  if (!userId) return;
  await updateDoc(doc(db, 'users', userId, 'wardrobe', itemId), {
    wearCount: increment(1),
    lastWorn: date,
    updatedAt: serverTimestamp(),
  });
};

// ─── OUTFIT LOGS ─────────────────────────────────────────────────────────────

/** Save an outfit log with full metadata */
export const saveOutfitLog = async (logData, wardrobe) => {
  const userId = uid();
  if (!userId) throw new Error('Not logged in');

  const totalOutfitValue = (logData.itemIds || []).reduce((sum, id) => {
    const item = wardrobe.find((w) => w.id === id);
    return sum + (item?.purchasePrice || 0);
  }, 0);

  // Clean schema
  const cleanLog = {
    date:            logData.date,
    occasion:        logData.occasion || 'casual',
    mood:            logData.mood || 'good',
    itemIds:         logData.itemIds || [],
    itemCount:       (logData.itemIds || []).length,
    description:     logData.description || null,
    brand:           logData.brand || null,
    outfitType:      logData.outfitType || null,
    imageUrl:        logData.imageUrl || null,
    totalOutfitValue,
    createdAt:       serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'users', userId, 'outfitLogs'), cleanLog);

  await updateDoc(doc(db, 'users', userId), {
    'stats.totalOutfitLogs': increment(1),
    'stats.lastUpdated':     serverTimestamp(),
  }).catch(() => {});

  return ref.id;
};

// ─── PURCHASE DECISIONS ───────────────────────────────────────────────────────

/** Save a purchase decision to Firestore */
export const savePurchaseDecision = async ({
  itemName, category, color, price,
  recommendation, similarCount, similarItems,
  addedToWardrobe = false,
}) => {
  const userId = uid();
  if (!userId) return;

  await addDoc(collection(db, 'users', userId, 'purchaseDecisions'), {
    itemName: itemName || 'Unnamed',
    category,
    color,
    price: price || 0,
    recommendation,
    similarCount,
    similarItemNames: (similarItems || []).map((i) => i.name || i.category),
    addedToWardrobe,
    decidedAt: serverTimestamp(),
  });
};

// ─── ANALYTICS SUMMARY ───────────────────────────────────────────────────────

/** Recompute and save analytics summary to Firestore */
export const updateAnalyticsSummary = async (wardrobe, outfitLogs = []) => {
  const userId = uid();
  if (!userId) return;

  const categoryBreakdown = {};
  const colorBreakdown = {};
  let totalValue = 0;
  let totalWears = 0;

  wardrobe.forEach((item) => {
    const cat = item.category || 'other';
    const col = item.color || 'unknown';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    colorBreakdown[col] = (colorBreakdown[col] || 0) + 1;
    totalValue += item.purchasePrice || 0;
    totalWears += item.wearCount || 0;
  });

  const mostWornItems = [...wardrobe]
    .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
    .slice(0, 5)
    .map((i) => ({ id: i.id, name: i.name, wearCount: i.wearCount || 0 }));

  const underutilizedItems = wardrobe
    .filter((i) => (i.wearCount || 0) === 0)
    .slice(0, 5)
    .map((i) => ({ id: i.id, name: i.name, category: i.category }));

  const avgCostPerWear = totalWears > 0 ? Math.round(totalValue / totalWears) : 0;

  const mostWornCategory = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  await setDoc(
    doc(db, 'users', userId, 'analytics', 'summary'),
    {
      categoryBreakdown,
      colorBreakdown,
      totalValue,
      totalItems: wardrobe.length,
      totalWears,
      avgCostPerWear,
      mostWornCategory,
      mostWornItems,
      underutilizedItems,
      totalOutfitLogs: outfitLogs.length,
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );

  // Also update top-level user stats
  await updateDoc(doc(db, 'users', userId), {
    'stats.totalItems': wardrobe.length,
    'stats.totalWardrobeValue': totalValue,
    'stats.mostWornCategory': mostWornCategory,
    'stats.avgCostPerWear': avgCostPerWear,
    'stats.lastUpdated': serverTimestamp(),
  }).catch(() => {});
};
