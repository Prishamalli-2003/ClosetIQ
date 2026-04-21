import { collection, addDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

// Color hex map for placehold.co backgrounds
const HEX = {
  white: "f8f8f8", black: "1a1a1a", navy: "0b1f3a", gray: "6b7280",
  beige: "d6c6a8", brown: "7c4a2d", red: "ef4444", blue: "3b82f6",
  green: "22c55e", yellow: "f59e0b", pink: "ec4899", orange: "f97316",
  purple: "8b5cf6", maroon: "7f1d1d", teal: "14b8a6", mint: "6ee7b7",
  coral: "ff7875", lavender: "c4b5fd", cream: "fef3c7", gold: "fbbf24",
  silver: "d1d5db", "rose-gold": "f9a8d4", olive: "84cc16",
  burgundy: "991b1b", turquoise: "06b6d4",
};

const textColor = (color) => {
  const dark = ["black","navy","maroon","burgundy","brown","purple"];
  return dark.includes(color) ? "ffffff" : "1a1a1a";
};

// Generate a clean product-style placeholder image
// Shows the item name on a background matching the item color
const img = (color, label) => {
  const bg = HEX[color] || "e5e7eb";
  const fg = textColor(color);
  const text = encodeURIComponent(label);
  return `https://placehold.co/400x500/${bg}/${fg}?text=${text}&font=playfair-display`;
};

export const FEMALE_ITEMS = [
  // TOPS
  { name: "White Cotton T-Shirt",    category: "top", type: "t-shirt",   color: "white",    purchasePrice: 1299,  size: "M", brand: "H&M",            imageUrl: img("white",    "White\nCotton\nT-Shirt") },
  { name: "Black V-Neck T-Shirt",    category: "top", type: "t-shirt",   color: "black",    purchasePrice: 1499,  size: "M", brand: "Zara",           imageUrl: img("black",    "Black\nV-Neck\nT-Shirt") },
  { name: "Blush Pink Crop Top",     category: "top", type: "crop-top",  color: "pink",     purchasePrice: 1899,  size: "S", brand: "Zara",           imageUrl: img("pink",     "Blush Pink\nCrop Top") },
  { name: "White Linen Shirt",       category: "top", type: "shirt",     color: "white",    purchasePrice: 2499,  size: "M", brand: "Fabindia",       imageUrl: img("white",    "White\nLinen Shirt") },
  { name: "Light Blue Oxford Shirt", category: "top", type: "shirt",     color: "blue",     purchasePrice: 2999,  size: "M", brand: "Arrow",          imageUrl: img("blue",     "Light Blue\nOxford Shirt") },
  { name: "Beige Oversized Shirt",   category: "top", type: "shirt",     color: "beige",    purchasePrice: 2199,  size: "L", brand: "H&M",            imageUrl: img("beige",    "Beige\nOversized Shirt") },
  { name: "Black Satin Blouse",      category: "top", type: "blouse",    color: "black",    purchasePrice: 3499,  size: "S", brand: "Zara",           imageUrl: img("black",    "Black\nSatin Blouse") },
  { name: "Ivory Silk Blouse",       category: "top", type: "blouse",    color: "cream",    purchasePrice: 4999,  size: "M", brand: "AND",            imageUrl: img("cream",    "Ivory\nSilk Blouse") },
  { name: "Coral Floral Blouse",     category: "top", type: "blouse",    color: "coral",    purchasePrice: 2799,  size: "S", brand: "Global Desi",    imageUrl: img("coral",    "Coral\nFloral Blouse") },
  { name: "Grey Marl Hoodie",        category: "top", type: "hoodie",    color: "gray",     purchasePrice: 3999,  size: "L", brand: "Nike",           imageUrl: img("gray",     "Grey\nMarl Hoodie") },
  { name: "Cream Knit Sweater",      category: "top", type: "sweater",   color: "cream",    purchasePrice: 5999,  size: "M", brand: "Mango",          imageUrl: img("cream",    "Cream\nKnit Sweater") },
  { name: "Burgundy Turtleneck",     category: "top", type: "sweater",   color: "burgundy", purchasePrice: 4999,  size: "M", brand: "Zara",           imageUrl: img("burgundy", "Burgundy\nTurtleneck") },
  { name: "Lavender Crop Sweater",   category: "top", type: "sweater",   color: "lavender", purchasePrice: 3499,  size: "S", brand: "Mango",          imageUrl: img("lavender", "Lavender\nCrop Sweater") },
  { name: "White Camisole",          category: "top", type: "camisole",  color: "white",    purchasePrice: 999,   size: "S", brand: "H&M",            imageUrl: img("white",    "White\nCamisole") },
  { name: "Olive Green Tank Top",    category: "top", type: "tank",      color: "olive",    purchasePrice: 1199,  size: "M", brand: "H&M",            imageUrl: img("olive",    "Olive Green\nTank Top") },
  { name: "Teal Printed Blouse",     category: "top", type: "blouse",    color: "teal",     purchasePrice: 2599,  size: "S", brand: "W",              imageUrl: img("teal",     "Teal\nPrinted Blouse") },
  { name: "Red Polo Shirt",          category: "top", type: "polo",      color: "red",      purchasePrice: 2299,  size: "M", brand: "Lacoste",        imageUrl: img("red",      "Red\nPolo Shirt") },
  { name: "Navy Striped T-Shirt",    category: "top", type: "t-shirt",   color: "navy",     purchasePrice: 1599,  size: "M", brand: "M&S",            imageUrl: img("navy",     "Navy\nStriped T-Shirt") },
  { name: "Pink Floral Blouse",      category: "top", type: "blouse",    color: "pink",     purchasePrice: 2199,  size: "S", brand: "Global Desi",    imageUrl: img("pink",     "Pink\nFloral Blouse") },
  { name: "Brown Knit Sweater",      category: "top", type: "sweater",   color: "brown",    purchasePrice: 4499,  size: "M", brand: "Mango",          imageUrl: img("brown",    "Brown\nKnit Sweater") },

  // BOTTOMS
  { name: "Blue Skinny Jeans",       category: "bottom", type: "jeans",    color: "blue",  purchasePrice: 3999,  size: "M", brand: "Levis",          imageUrl: img("blue",     "Blue\nSkinny Jeans") },
  { name: "Black Slim Jeans",        category: "bottom", type: "jeans",    color: "black", purchasePrice: 4499,  size: "M", brand: "Zara",           imageUrl: img("black",    "Black\nSlim Jeans") },
  { name: "Denim Mini Skirt",        category: "bottom", type: "skirt",    color: "blue",  purchasePrice: 2999,  size: "S", brand: "Zara",           imageUrl: img("blue",     "Denim\nMini Skirt") },
  { name: "Black Midi Skirt",        category: "bottom", type: "skirt",    color: "black", purchasePrice: 3499,  size: "M", brand: "Mango",          imageUrl: img("black",    "Black\nMidi Skirt") },
  { name: "Pink Pleated Skirt",      category: "bottom", type: "skirt",    color: "pink",  purchasePrice: 2999,  size: "S", brand: "Zara",           imageUrl: img("pink",     "Pink\nPleated Skirt") },
  { name: "Beige Chinos",            category: "bottom", type: "chinos",   color: "beige", purchasePrice: 3299,  size: "M", brand: "M&S",            imageUrl: img("beige",    "Beige\nChinos") },
  { name: "Black Leggings",          category: "bottom", type: "leggings", color: "black", purchasePrice: 1499,  size: "M", brand: "Nike",           imageUrl: img("black",    "Black\nLeggings") },
  { name: "Navy Palazzo Pants",      category: "bottom", type: "palazzo",  color: "navy",  purchasePrice: 2499,  size: "M", brand: "W",              imageUrl: img("navy",     "Navy\nPalazzo Pants") },
  { name: "Grey Joggers",            category: "bottom", type: "joggers",  color: "gray",  purchasePrice: 2499,  size: "L", brand: "Adidas",         imageUrl: img("gray",     "Grey\nJoggers") },
  { name: "Navy Formal Trousers",    category: "bottom", type: "trousers", color: "navy",  purchasePrice: 4999,  size: "M", brand: "Van Heusen",     imageUrl: img("navy",     "Navy\nFormal Trousers") },
  { name: "Black Formal Trousers",   category: "bottom", type: "trousers", color: "black", purchasePrice: 4499,  size: "M", brand: "Arrow",          imageUrl: img("black",    "Black\nFormal Trousers") },
  { name: "White Wide Leg Trousers", category: "bottom", type: "trousers", color: "white", purchasePrice: 3499,  size: "M", brand: "H&M",            imageUrl: img("white",    "White Wide\nLeg Trousers") },
  { name: "Burgundy Culottes",       category: "bottom", type: "culottes", color: "burgundy",purchasePrice: 2799,size: "M", brand: "AND",            imageUrl: img("burgundy", "Burgundy\nCulottes") },
  { name: "Teal Palazzo",            category: "bottom", type: "palazzo",  color: "teal",  purchasePrice: 2299,  size: "M", brand: "W",              imageUrl: img("teal",     "Teal\nPalazzo") },

  // DRESSES
  { name: "Black Wrap Dress",        category: "dress", type: "casual-dress",   color: "black",    purchasePrice: 5999,  size: "M", brand: "Zara",       imageUrl: img("black",    "Black\nWrap Dress") },
  { name: "Floral Midi Dress",       category: "dress", type: "midi-dress",     color: "pink",     purchasePrice: 4999,  size: "S", brand: "H&M",        imageUrl: img("pink",     "Floral\nMidi Dress") },
  { name: "Navy Maxi Dress",         category: "dress", type: "maxi-dress",     color: "navy",     purchasePrice: 6999,  size: "M", brand: "Mango",      imageUrl: img("navy",     "Navy\nMaxi Dress") },
  { name: "White Sundress",          category: "dress", type: "sundress",       color: "white",    purchasePrice: 3999,  size: "S", brand: "Zara",       imageUrl: img("white",    "White\nSundress") },
  { name: "Red Cocktail Dress",      category: "dress", type: "cocktail-dress", color: "red",      purchasePrice: 8999,  size: "M", brand: "AND",        imageUrl: img("red",      "Red\nCocktail Dress") },
  { name: "Beige Shirt Dress",       category: "dress", type: "casual-dress",   color: "beige",    purchasePrice: 4499,  size: "M", brand: "H&M",        imageUrl: img("beige",    "Beige\nShirt Dress") },
  { name: "Lavender Mini Dress",     category: "dress", type: "mini-dress",     color: "lavender", purchasePrice: 4999,  size: "S", brand: "Zara",       imageUrl: img("lavender", "Lavender\nMini Dress") },
  { name: "Black Formal Dress",      category: "dress", type: "formal-dress",   color: "black",    purchasePrice: 9999,  size: "M", brand: "Mango",      imageUrl: img("black",    "Black\nFormal Dress") },
  { name: "Burgundy Midi Dress",     category: "dress", type: "midi-dress",     color: "burgundy", purchasePrice: 6499,  size: "M", brand: "Zara",       imageUrl: img("burgundy", "Burgundy\nMidi Dress") },
  { name: "Emerald Evening Gown",    category: "dress", type: "evening-gown",   color: "green",    purchasePrice: 18999, size: "M", brand: "Ritu Kumar", imageUrl: img("green",    "Emerald\nEvening Gown") },
  { name: "Coral Sundress",          category: "dress", type: "sundress",       color: "coral",    purchasePrice: 3499,  size: "S", brand: "H&M",        imageUrl: img("coral",    "Coral\nSundress") },
  { name: "Yellow Maxi Dress",       category: "dress", type: "maxi-dress",     color: "yellow",   purchasePrice: 5999,  size: "M", brand: "Global Desi",imageUrl: img("yellow",   "Yellow\nMaxi Dress") },

  // TRADITIONAL
  { name: "Silk Banarasi Saree",     category: "traditional", type: "saree",         color: "red",    purchasePrice: 25000, size: "Free size", brand: "Fabindia",   imageUrl: img("red",      "Silk\nBanarasi Saree") },
  { name: "Navy Blue Lehenga",       category: "traditional", type: "lehenga",       color: "navy",   purchasePrice: 35000, size: "M",         brand: "Ritu Kumar", imageUrl: img("navy",     "Navy Blue\nLehenga") },
  { name: "Pink Anarkali Suit",      category: "traditional", type: "anarkali",      color: "pink",   purchasePrice: 8999,  size: "M",         brand: "Biba",       imageUrl: img("pink",     "Pink\nAnarkali Suit") },
  { name: "White Cotton Kurti",      category: "traditional", type: "kurti",         color: "white",  purchasePrice: 2499,  size: "M",         brand: "Fabindia",   imageUrl: img("white",    "White\nCotton Kurti") },
  { name: "Maroon Silk Saree",       category: "traditional", type: "saree",         color: "maroon", purchasePrice: 18000, size: "Free size", brand: "Fabindia",   imageUrl: img("maroon",   "Maroon\nSilk Saree") },
  { name: "Teal Salwar Kameez",      category: "traditional", type: "salwar-kameez", color: "teal",   purchasePrice: 5999,  size: "M",         brand: "W",          imageUrl: img("teal",     "Teal\nSalwar Kameez") },
  { name: "Gold Embroidered Lehenga",category: "traditional", type: "lehenga",       color: "gold",   purchasePrice: 45000, size: "M",         brand: "Sabyasachi", imageUrl: img("gold",     "Gold\nLehenga") },
  { name: "Beige Printed Kurti",     category: "traditional", type: "kurti",         color: "beige",  purchasePrice: 1999,  size: "M",         brand: "Fabindia",   imageUrl: img("beige",    "Beige\nPrinted Kurti") },

  // OUTERWEAR
  { name: "Black Leather Jacket",    category: "outerwear", type: "jacket",   color: "black",    purchasePrice: 12999, size: "M", brand: "Zara",       imageUrl: img("black",    "Black\nLeather Jacket") },
  { name: "Camel Trench Coat",       category: "outerwear", type: "coat",     color: "beige",    purchasePrice: 15999, size: "M", brand: "Mango",      imageUrl: img("beige",    "Camel\nTrench Coat") },
  { name: "Navy Blazer",             category: "outerwear", type: "blazer",   color: "navy",     purchasePrice: 8999,  size: "M", brand: "Van Heusen", imageUrl: img("navy",     "Navy\nBlazer") },
  { name: "Grey Wool Coat",          category: "outerwear", type: "coat",     color: "gray",     purchasePrice: 18999, size: "M", brand: "M&S",        imageUrl: img("gray",     "Grey\nWool Coat") },
  { name: "Denim Jacket",            category: "outerwear", type: "jacket",   color: "blue",     purchasePrice: 5999,  size: "M", brand: "Levis",      imageUrl: img("blue",     "Denim\nJacket") },
  { name: "White Blazer",            category: "outerwear", type: "blazer",   color: "white",    purchasePrice: 7999,  size: "M", brand: "Zara",       imageUrl: img("white",    "White\nBlazer") },
  { name: "Black Formal Blazer",     category: "outerwear", type: "blazer",   color: "black",    purchasePrice: 9999,  size: "M", brand: "Arrow",      imageUrl: img("black",    "Black\nFormal Blazer") },
  { name: "Burgundy Cardigan",       category: "outerwear", type: "cardigan", color: "burgundy", purchasePrice: 4999,  size: "M", brand: "Mango",      imageUrl: img("burgundy", "Burgundy\nCardigan") },

  // SHOES
  { name: "White Sneakers",          category: "shoes", type: "sneakers",     color: "white", purchasePrice: 7999,  size: "M", brand: "Nike",         imageUrl: img("white",    "White\nSneakers") },
  { name: "Black Ankle Boots",       category: "shoes", type: "boots",        color: "black", purchasePrice: 9999,  size: "M", brand: "Zara",         imageUrl: img("black",    "Black\nAnkle Boots") },
  { name: "Nude Block Heels",        category: "shoes", type: "heels",        color: "beige", purchasePrice: 5999,  size: "M", brand: "Steve Madden", imageUrl: img("beige",    "Nude\nBlock Heels") },
  { name: "Gold Strappy Sandals",    category: "shoes", type: "sandals",      color: "gold",  purchasePrice: 4999,  size: "M", brand: "Aldo",         imageUrl: img("gold",     "Gold\nStrappy Sandals") },
  { name: "Black Ballet Flats",      category: "shoes", type: "ballet-flats", color: "black", purchasePrice: 3999,  size: "M", brand: "Mango",        imageUrl: img("black",    "Black\nBallet Flats") },
  { name: "Red Stilettos",           category: "shoes", type: "stilettos",    color: "red",   purchasePrice: 8999,  size: "M", brand: "Steve Madden", imageUrl: img("red",      "Red\nStilettos") },
  { name: "White Slip-On Sneakers",  category: "shoes", type: "sneakers",     color: "white", purchasePrice: 4999,  size: "M", brand: "Vans",         imageUrl: img("white",    "White\nSlip-On") },
  { name: "Brown Loafers",           category: "shoes", type: "loafers",      color: "brown", purchasePrice: 6999,  size: "M", brand: "Clarks",       imageUrl: img("brown",    "Brown\nLoafers") },

  // ACCESSORIES
  { name: "Black Leather Handbag",   category: "accessory", type: "handbag",  color: "black",     purchasePrice: 8999,  size: "Free size", brand: "Zara",              imageUrl: img("black",     "Black\nLeather Handbag") },
  { name: "Tan Tote Bag",            category: "accessory", type: "bag",      color: "brown",     purchasePrice: 6999,  size: "Free size", brand: "Mango",             imageUrl: img("brown",     "Tan\nTote Bag") },
  { name: "Gold Statement Necklace", category: "accessory", type: "jewelry",  color: "gold",      purchasePrice: 3999,  size: "Free size", brand: "Accessorize",       imageUrl: img("gold",      "Gold\nNecklace") },
  { name: "Black Leather Belt",      category: "accessory", type: "belt",     color: "black",     purchasePrice: 2499,  size: "M",         brand: "Zara",              imageUrl: img("black",     "Black\nLeather Belt") },
  { name: "Rose Gold Watch",         category: "accessory", type: "watch",    color: "rose-gold", purchasePrice: 12999, size: "Free size", brand: "Daniel Wellington", imageUrl: img("rose-gold", "Rose Gold\nWatch") },
  { name: "Beige Clutch Bag",        category: "accessory", type: "clutch",   color: "beige",     purchasePrice: 4999,  size: "Free size", brand: "Aldo",              imageUrl: img("beige",     "Beige\nClutch Bag") },
  { name: "Silver Hoop Earrings",    category: "accessory", type: "jewelry",  color: "silver",    purchasePrice: 1999,  size: "Free size", brand: "Accessorize",       imageUrl: img("silver",    "Silver\nHoop Earrings") },
  { name: "Brown Sling Bag",         category: "accessory", type: "bag",      color: "brown",     purchasePrice: 4499,  size: "Free size", brand: "Mango",             imageUrl: img("brown",     "Brown\nSling Bag") },
  { name: "Navy Blue Scarf",         category: "accessory", type: "scarf",    color: "navy",      purchasePrice: 1999,  size: "Free size", brand: "Fabindia",          imageUrl: img("navy",      "Navy Blue\nScarf") },
  { name: "Silver Watch",            category: "accessory", type: "watch",    color: "silver",    purchasePrice: 9999,  size: "Free size", brand: "Titan",             imageUrl: img("silver",    "Silver\nWatch") },
];

export const seedWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    const gender = userSnap.data()?.preferences?.gender || userSnap.data()?.gender || "female";
    const items = gender === "male" ? FEMALE_ITEMS : FEMALE_ITEMS; // always female for now

    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const existing = await getDocs(wardrobeRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));
    await Promise.all(
      items.map(item =>
        addDoc(wardrobeRef, { ...item, wearCount: 0, lastWorn: null, purchaseDate: "2024-01-01", createdAt: serverTimestamp() })
      )
    );
    return { success: true, message: `Added ${items.length} items to your wardrobe!` };
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

export const SEED_ITEMS = FEMALE_ITEMS;