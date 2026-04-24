import { collection, addDoc, getDocs, deleteDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

const ph = (hex, name) =>
  `https://placehold.co/400x500/${hex.replace("#","")}/ffffff?text=${encodeURIComponent(name)}&font=playfair-display`;

const ALL_ITEMS = [
  // ── SAREES (traditional) ──────────────────────────────────────────────
  { name:"Blue Silk Saree",                                    category:"traditional", type:"saree",        color:"blue",      purchasePrice:45000, size:"Free size", brand:"Kanjivaram", description:"Rich blue silk Kanjivaram with gold zari border. Grand occasions & weddings.",                          imageUrl: ph("1e40af","Blue Silk\nSaree") },
  { name:"Baby Pink Banarasi Saree",                           category:"traditional", type:"saree",        color:"pink",      purchasePrice:6500,  size:"Free size", brand:"Banarasi",   description:"Soft baby pink Banarasi silk with gold border. Festive & family occasions.",                           imageUrl: ph("f9a8d4","Baby Pink\nBanarasi") },
  { name:"Dark Green Kanjivaram Silk Saree",                   category:"traditional", type:"saree",        color:"green",     purchasePrice:2500,  size:"Free size", brand:"Kanjivaram", description:"Deep forest green Kanjivaram with gold & navy border. Temple & cultural events.",                       imageUrl: ph("065f46","Dark Green\nKanjivaram") },
  { name:"Deep Wine with Red Border Kanjivaram Silk Saree",    category:"traditional", type:"saree",        color:"maroon",    purchasePrice:12500, size:"Free size", brand:"Kanjivaram", description:"Deep wine Kanjivaram with vibrant red & gold border. Weddings & receptions.",                          imageUrl: ph("7f1d1d","Deep Wine\nKanjivaram") },
  { name:"Aqua Blue Kanjivaram Silk Saree",                    category:"traditional", type:"saree",        color:"teal",      purchasePrice:14500, size:"Free size", brand:"Kanjivaram", description:"Bright aqua blue Kanjivaram with silver zari motifs. Festive & formal occasions.",                      imageUrl: ph("0d9488","Aqua Blue\nKanjivaram") },
  { name:"Bright Red with Cream Border Kanjivaram Silk Saree", category:"traditional", type:"saree",        color:"red",       purchasePrice:2500,  size:"Free size", brand:"Kanjivaram", description:"Classic bright red Kanjivaram with cream zari border. Auspicious occasions & puja.",                   imageUrl: ph("dc2626","Bright Red\nKanjivaram") },
  { name:"Organza Designer Saree",                             category:"traditional", type:"saree",        color:"pink",      purchasePrice:15000, size:"Free size", brand:"Designer",   description:"Blush pink organza with heavy silver embroidery & matching blouse. Weddings & receptions.",             imageUrl: ph("f9a8d4","Organza\nDesigner Saree") },
  { name:"Dark Red Sequin Saree",                              category:"traditional", type:"saree",        color:"maroon",    purchasePrice:54000, size:"Free size", brand:"Designer",   description:"Stunning dark red sequin net saree. Grand parties, receptions & award nights.",                        imageUrl: ph("7f1d1d","Dark Red\nSequin Saree") },
  { name:"Pink Organza Saree",                                 category:"traditional", type:"saree",        color:"pink",      purchasePrice:12000, size:"Free size", brand:"Designer",   description:"Delicate blush pink organza with floral embroidery border. Weddings & cocktail parties.",             imageUrl: ph("f9a8d4","Pink\nOrganza Saree") },

  // ── TOPS ──────────────────────────────────────────────────────────────
  { name:"White Cotton T-Shirt",    category:"top", type:"t-shirt",  color:"white",    purchasePrice:1299,  size:"M", brand:"H&M",      description:"Classic white tee. Everyday casual wear.",                imageUrl: ph("f8f8f8","White\nCotton T-Shirt") },
  { name:"Black V-Neck T-Shirt",    category:"top", type:"t-shirt",  color:"black",    purchasePrice:1499,  size:"M", brand:"Zara",     description:"Versatile black V-neck. Casual & smart casual.",          imageUrl: ph("1a1a1a","Black\nV-Neck T-Shirt") },
  { name:"White Linen Shirt",       category:"top", type:"shirt",    color:"white",    purchasePrice:2499,  size:"M", brand:"Fabindia", description:"Breathable linen shirt. Office & smart casual.",          imageUrl: ph("f8f8f8","White\nLinen Shirt") },
  { name:"Light Blue Oxford Shirt", category:"top", type:"shirt",    color:"blue",     purchasePrice:2999,  size:"M", brand:"Arrow",    description:"Classic Oxford. Office & formal occasions.",              imageUrl: ph("3b82f6","Light Blue\nOxford Shirt") },
  { name:"Black Satin Blouse",      category:"top", type:"blouse",   color:"black",    purchasePrice:3499,  size:"S", brand:"Zara",     description:"Elegant satin blouse. Parties & formal dinners.",         imageUrl: ph("1a1a1a","Black\nSatin Blouse") },
  { name:"Ivory Silk Blouse",       category:"top", type:"blouse",   color:"cream",    purchasePrice:4999,  size:"M", brand:"AND",      description:"Luxe silk blouse. Office & formal events.",               imageUrl: ph("fef3c7","Ivory\nSilk Blouse") },
  { name:"Coral Floral Blouse",     category:"top", type:"blouse",   color:"coral",    purchasePrice:2799,  size:"S", brand:"Global Desi", description:"Floral print blouse. Casual & festive occasions.",    imageUrl: ph("ff7875","Coral\nFloral Blouse") },
  { name:"Grey Marl Hoodie",        category:"top", type:"hoodie",   color:"gray",     purchasePrice:3999,  size:"L", brand:"Nike",     description:"Cosy hoodie. Casual & gym wear.",                         imageUrl: ph("6b7280","Grey\nMarl Hoodie") },
  { name:"Cream Knit Sweater",      category:"top", type:"sweater",  color:"cream",    purchasePrice:5999,  size:"M", brand:"Mango",    description:"Soft knit sweater. Casual & winter wear.",                imageUrl: ph("fef3c7","Cream\nKnit Sweater") },
  { name:"Blush Pink Crop Top",     category:"top", type:"crop-top", color:"pink",     purchasePrice:1899,  size:"S", brand:"Zara",     description:"Trendy crop top. Casual & party wear.",                   imageUrl: ph("f9a8d4","Blush Pink\nCrop Top") },

  // ── BOTTOMS ───────────────────────────────────────────────────────────
  { name:"Blue Skinny Jeans",       category:"bottom", type:"jeans",    color:"blue",  purchasePrice:3999,  size:"M", brand:"Levis",    description:"Classic skinny jeans. Everyday casual wear.",             imageUrl: ph("3b82f6","Blue\nSkinny Jeans") },
  { name:"Black Slim Jeans",        category:"bottom", type:"jeans",    color:"black", purchasePrice:4499,  size:"M", brand:"Zara",     description:"Versatile black jeans. Casual & smart casual.",           imageUrl: ph("1a1a1a","Black\nSlim Jeans") },
  { name:"Denim Mini Skirt",        category:"bottom", type:"skirt",    color:"blue",  purchasePrice:2999,  size:"S", brand:"Zara",     description:"Classic denim mini. Casual & parties.",                   imageUrl: ph("3b82f6","Denim\nMini Skirt") },
  { name:"Black Midi Skirt",        category:"bottom", type:"skirt",    color:"black", purchasePrice:3499,  size:"M", brand:"Mango",    description:"Elegant midi length. Office & smart casual.",             imageUrl: ph("1a1a1a","Black\nMidi Skirt") },
  { name:"Beige Chinos",            category:"bottom", type:"chinos",   color:"beige", purchasePrice:3299,  size:"M", brand:"M&S",      description:"Smart chinos. Office & smart casual.",                    imageUrl: ph("d6c6a8","Beige\nChinos") },
  { name:"Black Leggings",          category:"bottom", type:"leggings", color:"black", purchasePrice:1499,  size:"M", brand:"Nike",     description:"Comfortable leggings. Gym & casual.",                     imageUrl: ph("1a1a1a","Black\nLeggings") },
  { name:"Navy Palazzo Pants",      category:"bottom", type:"palazzo",  color:"navy",  purchasePrice:2499,  size:"M", brand:"W",        description:"Flowy palazzo. Casual & festive.",                        imageUrl: ph("0b1f3a","Navy\nPalazzo Pants") },
  { name:"Pink Pleated Skirt",      category:"bottom", type:"skirt",    color:"pink",  purchasePrice:2999,  size:"S", brand:"Zara",     description:"Flirty pleated skirt. Casual & parties.",                 imageUrl: ph("f9a8d4","Pink\nPleated Skirt") },

  // ── DRESSES ───────────────────────────────────────────────────────────
  { name:"Black Wrap Dress",        category:"dress", type:"casual-dress",   color:"black",    purchasePrice:5999,  size:"M", brand:"Zara",       description:"Versatile wrap dress. Casual & smart casual.",           imageUrl: ph("1a1a1a","Black\nWrap Dress") },
  { name:"Floral Midi Dress",       category:"dress", type:"midi-dress",     color:"pink",     purchasePrice:4999,  size:"S", brand:"H&M",        description:"Feminine floral midi. Casual & brunch.",                 imageUrl: ph("f9a8d4","Floral\nMidi Dress") },
  { name:"Navy Maxi Dress",         category:"dress", type:"maxi-dress",     color:"navy",     purchasePrice:6999,  size:"M", brand:"Mango",      description:"Elegant navy maxi. Parties & formal occasions.",          imageUrl: ph("0b1f3a","Navy\nMaxi Dress") },
  { name:"Red Cocktail Dress",      category:"dress", type:"cocktail-dress", color:"red",      purchasePrice:8999,  size:"M", brand:"AND",        description:"Bold red cocktail. Parties & date nights.",               imageUrl: ph("dc2626","Red\nCocktail Dress") },
  { name:"Emerald Evening Gown",    category:"dress", type:"evening-gown",   color:"green",    purchasePrice:18999, size:"M", brand:"Ritu Kumar", description:"Stunning emerald gown. Galas & grand events.",            imageUrl: ph("065f46","Emerald\nEvening Gown") },
  { name:"Lavender Mini Dress",     category:"dress", type:"mini-dress",     color:"lavender", purchasePrice:4999,  size:"S", brand:"Zara",       description:"Dreamy lavender mini. Casual parties & brunch.",          imageUrl: ph("c4b5fd","Lavender\nMini Dress") },

  // ── OUTERWEAR ─────────────────────────────────────────────────────────
  { name:"Black Leather Jacket",    category:"outerwear", type:"jacket",   color:"black",    purchasePrice:12999, size:"M", brand:"Zara",       description:"Classic leather jacket. Casual & party wear.",            imageUrl: ph("1a1a1a","Black\nLeather Jacket") },
  { name:"Camel Trench Coat",       category:"outerwear", type:"coat",     color:"beige",    purchasePrice:15999, size:"M", brand:"Mango",      description:"Timeless trench coat. Office & smart casual.",            imageUrl: ph("d6c6a8","Camel\nTrench Coat") },
  { name:"Navy Blazer",             category:"outerwear", type:"blazer",   color:"navy",     purchasePrice:8999,  size:"M", brand:"Van Heusen", description:"Structured blazer. Office & formal events.",              imageUrl: ph("0b1f3a","Navy\nBlazer") },
  { name:"Cream Shawl",             category:"outerwear", type:"shawl",    color:"cream",    purchasePrice:2999,  size:"Free size", brand:"Fabindia", description:"Elegant shawl. Traditional outfit layering.",        imageUrl: ph("fef3c7","Cream\nShawl") },

  // ── SHOES ─────────────────────────────────────────────────────────────
  { name:"White Sneakers",          category:"shoes", type:"sneakers",     color:"white", purchasePrice:7999,  size:"M", brand:"Nike",         description:"Classic white sneakers. Casual & everyday.",              imageUrl: ph("f8f8f8","White\nSneakers") },
  { name:"Black Ankle Boots",       category:"shoes", type:"boots",        color:"black", purchasePrice:9999,  size:"M", brand:"Zara",         description:"Versatile ankle boots. Casual & smart casual.",           imageUrl: ph("1a1a1a","Black\nAnkle Boots") },
  { name:"Nude Block Heels",        category:"shoes", type:"heels",        color:"beige", purchasePrice:5999,  size:"M", brand:"Steve Madden", description:"Comfortable block heels. Office & parties.",              imageUrl: ph("d6c6a8","Nude\nBlock Heels") },
  { name:"Gold Strappy Sandals",    category:"shoes", type:"sandals",      color:"gold",  purchasePrice:4999,  size:"M", brand:"Aldo",         description:"Elegant strappy sandals. Parties & events.",              imageUrl: ph("fbbf24","Gold\nStrappy Sandals") },

  // ── ACCESSORIES ───────────────────────────────────────────────────────
  { name:"Black Leather Handbag",   category:"accessory", type:"handbag",  color:"black",     purchasePrice:8999,  size:"Free size", brand:"Zara",              description:"Classic handbag. Everyday & office.",                  imageUrl: ph("1a1a1a","Black\nLeather Handbag") },
  { name:"Gold Statement Necklace", category:"accessory", type:"jewelry",  color:"gold",      purchasePrice:3999,  size:"Free size", brand:"Accessorize",       description:"Bold necklace. Parties & festive occasions.",          imageUrl: ph("fbbf24","Gold\nNecklace") },
  { name:"Rose Gold Watch",         category:"accessory", type:"watch",    color:"rose-gold", purchasePrice:12999, size:"Free size", brand:"Daniel Wellington", description:"Elegant watch. Everyday & formal.",                    imageUrl: ph("f9a8d4","Rose Gold\nWatch") },
];

const SAMPLE_LOGS = [
  { name:"Blue Silk Saree",                                    date:"2026-01-15", occasion:"wedding",   mood:"excited",   description:"Wore to cousin's wedding reception" },
  { name:"Baby Pink Banarasi Saree",                           date:"2026-02-10", occasion:"festival",  mood:"happy",     description:"Wore for Pongal celebrations" },
  { name:"Dark Green Kanjivaram Silk Saree",                   date:"2026-01-26", occasion:"religious", mood:"peaceful",  description:"Temple visit on Republic Day" },
  { name:"Aqua Blue Kanjivaram Silk Saree",                    date:"2026-03-08", occasion:"party",     mood:"confident", description:"Women's Day office celebration" },
  { name:"Bright Red with Cream Border Kanjivaram Silk Saree", date:"2026-01-14", occasion:"religious", mood:"happy",     description:"Pongal puja at home" },
  { name:"Baby Pink Banarasi Saree",                           date:"2025-12-25", occasion:"party",     mood:"excited",   description:"Christmas family gathering" },
  { name:"Blue Silk Saree",                                    date:"2025-11-01", occasion:"wedding",   mood:"excited",   description:"Friend's engagement ceremony" },
  { name:"Organza Designer Saree",                             date:"2026-02-14", occasion:"party",     mood:"romantic",  description:"Valentine's Day dinner" },
  { name:"Deep Wine with Red Border Kanjivaram Silk Saree",    date:"2025-10-24", occasion:"festival",  mood:"happy",     description:"Diwali celebration" },
  { name:"Aqua Blue Kanjivaram Silk Saree",                    date:"2025-09-15", occasion:"religious", mood:"peaceful",  description:"Onam sadya" },
  { name:"Dark Red Sequin Saree",                              date:"2026-03-15", occasion:"party",     mood:"confident", description:"Annual company gala night" },
  { name:"Pink Organza Saree",                                 date:"2026-01-20", occasion:"wedding",   mood:"romantic",  description:"Friend's wedding reception" },
  { name:"Black Wrap Dress",                                   date:"2026-02-20", occasion:"casual",    mood:"relaxed",   description:"Casual Friday brunch" },
  { name:"Red Cocktail Dress",                                 date:"2026-03-01", occasion:"party",     mood:"excited",   description:"Birthday party" },
  { name:"White Cotton T-Shirt",                               date:"2026-04-01", occasion:"casual",    mood:"good",      description:"Everyday office wear" },
  { name:"Blue Skinny Jeans",                                  date:"2026-04-01", occasion:"casual",    mood:"good",      description:"Everyday office wear" },
];

export const seedWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const existing = await getDocs(wardrobeRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));

    const addedItems = [];
    for (const item of ALL_ITEMS) {
      const ref = await addDoc(wardrobeRef, {
        name: item.name, category: item.category, type: item.type,
        color: item.color, purchasePrice: item.purchasePrice,
        size: item.size, brand: item.brand, description: item.description,
        imageUrl: item.imageUrl, wearCount: 0, lastWorn: null,
        purchaseDate: "2024-01-01", createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      addedItems.push({ id: ref.id, ...item });
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
      const totalValue = ALL_ITEMS.reduce((s, i) => s + i.purchasePrice, 0);
      await updateDoc(doc(db, "users", userId), {
        "stats.totalItems": ALL_ITEMS.length,
        "stats.totalWardrobeValue": totalValue,
        "stats.totalOutfitLogs": SAMPLE_LOGS.length,
        "stats.lastUpdated": serverTimestamp(),
      });
    } catch (_) {}

    return { success: true, message: "Added " + ALL_ITEMS.length + " items + " + SAMPLE_LOGS.length + " outfit logs! Tap ✏️ Edit on any item to replace the photo." };
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

export const SEED_ITEMS = ALL_ITEMS;
export const FEMALE_ITEMS = ALL_ITEMS;