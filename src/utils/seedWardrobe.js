import { collection, addDoc, getDocs, deleteDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

const SAREES = [
  { name: "Blue Silk Saree",                                    color: "blue",    purchasePrice: 45000, brand: "Kanjivaram", description: "Rich blue silk Kanjivaram with gold zari border. Grand occasions & weddings.",                          imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop&q=80" },
  { name: "Baby Pink Banarasi Saree",                           color: "pink",    purchasePrice: 6500,  brand: "Banarasi",   description: "Soft baby pink Banarasi silk with gold border. Festive & family occasions.",                           imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop&q=80" },
  { name: "Dark Green Kanjivaram Silk Saree",                   color: "green",   purchasePrice: 2500,  brand: "Kanjivaram", description: "Deep forest green Kanjivaram with gold & navy border. Temple & cultural events.",                       imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&h=500&fit=crop&q=80" },
  { name: "Deep Wine with Red Border Kanjivaram Silk Saree",    color: "maroon",  purchasePrice: 12500, brand: "Kanjivaram", description: "Deep wine Kanjivaram with vibrant red & gold border. Weddings & receptions.",                          imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop&q=80" },
  { name: "Aqua Blue Kanjivaram Silk Saree",                    color: "teal",    purchasePrice: 14500, brand: "Kanjivaram", description: "Bright aqua blue Kanjivaram with silver zari motifs. Festive & formal occasions.",                      imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=500&fit=crop&q=80" },
  { name: "Bright Red with Cream Border Kanjivaram Silk Saree", color: "red",     purchasePrice: 2500,  brand: "Kanjivaram", description: "Classic bright red Kanjivaram with cream zari border. Auspicious occasions & puja.",                   imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop&q=80" },
  { name: "Organza Designer Saree",                             color: "pink",    purchasePrice: 15000, brand: "Designer",   description: "Blush pink organza with heavy silver embroidery & matching blouse. Weddings & receptions.",             imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop&q=80" },
];

const SAMPLE_LOGS = [
  { name: "Blue Silk Saree",                                    date: "2026-01-15", occasion: "wedding",   mood: "excited",   description: "Wore to cousin's wedding reception" },
  { name: "Baby Pink Banarasi Saree",                           date: "2026-02-10", occasion: "festival",  mood: "happy",     description: "Wore for Pongal celebrations" },
  { name: "Dark Green Kanjivaram Silk Saree",                   date: "2026-01-26", occasion: "religious", mood: "peaceful",  description: "Temple visit on Republic Day" },
  { name: "Aqua Blue Kanjivaram Silk Saree",                    date: "2026-03-08", occasion: "party",     mood: "confident", description: "Women's Day office celebration" },
  { name: "Bright Red with Cream Border Kanjivaram Silk Saree", date: "2026-01-14", occasion: "religious", mood: "happy",     description: "Pongal puja at home" },
  { name: "Baby Pink Banarasi Saree",                           date: "2025-12-25", occasion: "party",     mood: "excited",   description: "Christmas family gathering" },
  { name: "Blue Silk Saree",                                    date: "2025-11-01", occasion: "wedding",   mood: "excited",   description: "Friend's engagement ceremony" },
  { name: "Organza Designer Saree",                             date: "2026-02-14", occasion: "party",     mood: "romantic",  description: "Valentine's Day dinner" },
  { name: "Deep Wine with Red Border Kanjivaram Silk Saree",    date: "2025-10-24", occasion: "festival",  mood: "happy",     description: "Diwali celebration" },
  { name: "Aqua Blue Kanjivaram Silk Saree",                    date: "2025-09-15", occasion: "religious", mood: "peaceful",  description: "Onam sadya" },
];

export const seedWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const existing = await getDocs(wardrobeRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));

    const addedItems = [];
    for (const saree of SAREES) {
      const ref = await addDoc(wardrobeRef, {
        name: saree.name, category: "traditional", type: "saree",
        color: saree.color, purchasePrice: saree.purchasePrice,
        size: "Free size", brand: saree.brand, description: saree.description,
        imageUrl: saree.imageUrl, wearCount: 0, lastWorn: null,
        purchaseDate: "2024-01-01", createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      addedItems.push({ id: ref.id, ...saree });
    }

    const logsRef = collection(db, "users", userId, "outfitLogs");
    const existingLogs = await getDocs(logsRef);
    await Promise.all(existingLogs.docs.map(d => deleteDoc(d.ref)));

    const wearCounts = {};
    const lastWornDates = {};

    for (const log of SAMPLE_LOGS) {
      const item = addedItems.find(i => i.name === log.name);
      if (!item) continue;
      await addDoc(logsRef, {
        date: log.date, occasion: log.occasion, mood: log.mood,
        itemIds: [item.id], itemCount: 1, description: log.description,
        totalOutfitValue: item.purchasePrice, createdAt: serverTimestamp(),
      });
      wearCounts[item.id] = (wearCounts[item.id] || 0) + 1;
      if (!lastWornDates[item.id] || log.date > lastWornDates[item.id]) {
        lastWornDates[item.id] = log.date;
      }
    }

    for (const [itemId, count] of Object.entries(wearCounts)) {
      await updateDoc(doc(db, "users", userId, "wardrobe", itemId), {
        wearCount: count, lastWorn: lastWornDates[itemId] || null, updatedAt: serverTimestamp(),
      });
    }

    try {
      const totalValue = SAREES.reduce((s, i) => s + i.purchasePrice, 0);
      await updateDoc(doc(db, "users", userId), {
        "stats.totalItems": SAREES.length, "stats.totalWardrobeValue": totalValue,
        "stats.totalOutfitLogs": SAMPLE_LOGS.length, "stats.lastUpdated": serverTimestamp(),
      });
    } catch (_) {}

    return { success: true, message: "Added " + SAREES.length + " sarees + " + SAMPLE_LOGS.length + " outfit logs!" };
  } catch (err) {
    return { success: false, message: "Error: " + err.message };
  }
};

export const clearWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const existing = await getDocs(wardrobeRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));
    return { success: true, message: "Wardrobe cleared!" };
  } catch (err) {
    return { success: false, message: "Error: " + err.message };
  }
};

export const SEED_ITEMS = SAREES;
export const FEMALE_ITEMS = SAREES;