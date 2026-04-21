import { collection, addDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";

const p = (color, label) =>
  "https://placehold.co/400x500/" + color + "/ffffff?text=" + encodeURIComponent(label);

export const SEED_ITEMS = [
  { name: "White Cotton T-Shirt", category: "top", type: "t-shirt", color: "white", purchasePrice: 1299, size: "M", brand: "H&M", imageUrl: p("f5f5f5","White Tee") },
  { name: "Black V-Neck T-Shirt", category: "top", type: "t-shirt", color: "black", purchasePrice: 1499, size: "M", brand: "Zara", imageUrl: p("111827","Black Tee") },
  { name: "Navy Striped T-Shirt", category: "top", type: "t-shirt", color: "navy", purchasePrice: 1599, size: "M", brand: "Marks & Spencer", imageUrl: p("0b1f3a","Navy Stripe") },
  { name: "Blush Pink Crop Top", category: "top", type: "crop-top", color: "pink", purchasePrice: 1899, size: "S", brand: "Zara", imageUrl: p("ec4899","Pink Crop") },
  { name: "White Linen Shirt", category: "top", type: "shirt", color: "white", purchasePrice: 2499, size: "M", brand: "Fabindia", imageUrl: p("f9fafb","White Linen") },
  { name: "Light Blue Oxford Shirt", category: "top", type: "shirt", color: "blue", purchasePrice: 2999, size: "M", brand: "Arrow", imageUrl: p("3b82f6","Blue Oxford") },
  { name: "Beige Oversized Shirt", category: "top", type: "shirt", color: "beige", purchasePrice: 2199, size: "L", brand: "H&M", imageUrl: p("d6c6a8","Beige Shirt") },
  { name: "Black Satin Blouse", category: "top", type: "blouse", color: "black", purchasePrice: 3499, size: "S", brand: "Zara", imageUrl: p("111827","Black Blouse") },
  { name: "Ivory Silk Blouse", category: "top", type: "blouse", color: "cream", purchasePrice: 4999, size: "M", brand: "AND", imageUrl: p("fef3c7","Ivory Blouse") },
  { name: "Coral Floral Blouse", category: "top", type: "blouse", color: "coral", purchasePrice: 2799, size: "S", brand: "Global Desi", imageUrl: p("ff7875","Coral Blouse") },
  { name: "Grey Marl Hoodie", category: "top", type: "hoodie", color: "gray", purchasePrice: 3999, size: "L", brand: "Nike", imageUrl: p("6b7280","Grey Hoodie") },
  { name: "Black Zip Hoodie", category: "top", type: "hoodie", color: "black", purchasePrice: 4499, size: "M", brand: "Adidas", imageUrl: p("111827","Black Hoodie") },
  { name: "Cream Knit Sweater", category: "top", type: "sweater", color: "cream", purchasePrice: 5999, size: "M", brand: "Mango", imageUrl: p("fef3c7","Cream Knit") },
  { name: "Burgundy Turtleneck", category: "top", type: "sweater", color: "burgundy", purchasePrice: 4999, size: "M", brand: "Zara", imageUrl: p("991b1b","Burgundy Turtle") },
  { name: "White Camisole", category: "top", type: "camisole", color: "white", purchasePrice: 999, size: "S", brand: "H&M", imageUrl: p("f9fafb","White Cami") },
  { name: "Black Bodysuit", category: "top", type: "bodysuit", color: "black", purchasePrice: 2499, size: "M", brand: "Zara", imageUrl: p("111827","Black Bodysuit") },
  { name: "Lavender Crop Sweater", category: "top", type: "sweater", color: "lavender", purchasePrice: 3499, size: "S", brand: "Mango", imageUrl: p("c4b5fd","Lavender Sweater") },
  { name: "Olive Green Tank Top", category: "top", type: "tank", color: "olive", purchasePrice: 1199, size: "M", brand: "H&M", imageUrl: p("84cc16","Olive Tank") },
  { name: "Red Polo Shirt", category: "top", type: "polo", color: "red", purchasePrice: 2299, size: "M", brand: "Lacoste", imageUrl: p("ef4444","Red Polo") },
  { name: "Teal Printed Blouse", category: "top", type: "blouse", color: "teal", purchasePrice: 2599, size: "S", brand: "W", imageUrl: p("14b8a6","Teal Blouse") },
  { name: "Blue Skinny Jeans", category: "bottom", type: "jeans", color: "blue", purchasePrice: 3999, size: "M", brand: "Levis", imageUrl: p("3b82f6","Blue Jeans") },
  { name: "Black Slim Jeans", category: "bottom", type: "jeans", color: "black", purchasePrice: 4499, size: "M", brand: "Zara", imageUrl: p("111827","Black Jeans") },
  { name: "White Wide Leg Trousers", category: "bottom", type: "trousers", color: "white", purchasePrice: 3499, size: "M", brand: "H&M", imageUrl: p("f9fafb","White Trousers") },
  { name: "Beige Chinos", category: "bottom", type: "chinos", color: "beige", purchasePrice: 3299, size: "M", brand: "Marks & Spencer", imageUrl: p("d6c6a8","Beige Chinos") },
  { name: "Black Leggings", category: "bottom", type: "leggings", color: "black", purchasePrice: 1499, size: "M", brand: "Nike", imageUrl: p("111827","Black Leggings") },
  { name: "Navy Palazzo Pants", category: "bottom", type: "palazzo", color: "navy", purchasePrice: 2499, size: "M", brand: "W", imageUrl: p("0b1f3a","Navy Palazzo") },
  { name: "Denim Mini Skirt", category: "bottom", type: "skirt", color: "blue", purchasePrice: 2999, size: "S", brand: "Zara", imageUrl: p("3b82f6","Denim Skirt") },
  { name: "Black Midi Skirt", category: "bottom", type: "skirt", color: "black", purchasePrice: 3499, size: "M", brand: "Mango", imageUrl: p("111827","Black Midi Skirt") },
  { name: "Grey Joggers", category: "bottom", type: "joggers", color: "gray", purchasePrice: 2499, size: "L", brand: "Adidas", imageUrl: p("6b7280","Grey Joggers") },
  { name: "Olive Cargo Pants", category: "bottom", type: "trousers", color: "olive", purchasePrice: 3999, size: "M", brand: "H&M", imageUrl: p("84cc16","Olive Cargo") },
  { name: "Navy Formal Trousers", category: "bottom", type: "trousers", color: "navy", purchasePrice: 4999, size: "M", brand: "Van Heusen", imageUrl: p("0b1f3a","Navy Trousers") },
  { name: "Black Formal Trousers", category: "bottom", type: "trousers", color: "black", purchasePrice: 4499, size: "M", brand: "Arrow", imageUrl: p("111827","Black Formal") },
  { name: "Pink Pleated Skirt", category: "bottom", type: "skirt", color: "pink", purchasePrice: 2999, size: "S", brand: "Zara", imageUrl: p("ec4899","Pink Pleated") },
  { name: "Brown Corduroy Pants", category: "bottom", type: "trousers", color: "brown", purchasePrice: 3999, size: "M", brand: "H&M", imageUrl: p("7c4a2d","Brown Cord") },
  { name: "Black Wrap Dress", category: "dress", type: "casual-dress", color: "black", purchasePrice: 5999, size: "M", brand: "Zara", imageUrl: p("111827","Black Wrap") },
  { name: "Floral Midi Dress", category: "dress", type: "midi-dress", color: "pink", purchasePrice: 4999, size: "S", brand: "H&M", imageUrl: p("ec4899","Floral Midi") },
  { name: "Navy Maxi Dress", category: "dress", type: "maxi-dress", color: "navy", purchasePrice: 6999, size: "M", brand: "Mango", imageUrl: p("0b1f3a","Navy Maxi") },
  { name: "White Sundress", category: "dress", type: "sundress", color: "white", purchasePrice: 3999, size: "S", brand: "Zara", imageUrl: p("f9fafb","White Sundress") },
  { name: "Red Cocktail Dress", category: "dress", type: "cocktail-dress", color: "red", purchasePrice: 8999, size: "M", brand: "AND", imageUrl: p("ef4444","Red Cocktail") },
  { name: "Beige Shirt Dress", category: "dress", type: "casual-dress", color: "beige", purchasePrice: 4499, size: "M", brand: "H&M", imageUrl: p("d6c6a8","Beige Shirt Dress") },
  { name: "Emerald Evening Gown", category: "dress", type: "evening-gown", color: "green", purchasePrice: 18999, size: "M", brand: "Ritu Kumar", imageUrl: p("22c55e","Emerald Gown") },
  { name: "Lavender Mini Dress", category: "dress", type: "mini-dress", color: "lavender", purchasePrice: 4999, size: "S", brand: "Zara", imageUrl: p("c4b5fd","Lavender Mini") },
  { name: "Black Formal Dress", category: "dress", type: "formal-dress", color: "black", purchasePrice: 9999, size: "M", brand: "Mango", imageUrl: p("111827","Black Formal Dress") },
  { name: "Burgundy Midi Dress", category: "dress", type: "midi-dress", color: "burgundy", purchasePrice: 6499, size: "M", brand: "Zara", imageUrl: p("991b1b","Burgundy Midi") },
  { name: "Silk Banarasi Saree", category: "traditional", type: "saree", color: "red", purchasePrice: 25000, size: "Free size", brand: "Fabindia", imageUrl: p("ef4444","Banarasi Saree") },
  { name: "Navy Blue Lehenga", category: "traditional", type: "lehenga", color: "navy", purchasePrice: 35000, size: "M", brand: "Ritu Kumar", imageUrl: p("0b1f3a","Navy Lehenga") },
  { name: "Pink Anarkali Suit", category: "traditional", type: "anarkali", color: "pink", purchasePrice: 8999, size: "M", brand: "Biba", imageUrl: p("ec4899","Pink Anarkali") },
  { name: "Teal Salwar Kameez", category: "traditional", type: "salwar-kameez", color: "teal", purchasePrice: 5999, size: "M", brand: "W", imageUrl: p("14b8a6","Teal Salwar") },
  { name: "White Cotton Kurti", category: "traditional", type: "kurti", color: "white", purchasePrice: 2499, size: "M", brand: "Fabindia", imageUrl: p("f9fafb","White Kurti") },
  { name: "Purple Churidar Suit", category: "traditional", type: "churidar", color: "purple", purchasePrice: 6999, size: "M", brand: "Biba", imageUrl: p("8b5cf6","Purple Churidar") },
  { name: "Maroon Silk Saree", category: "traditional", type: "saree", color: "maroon", purchasePrice: 18000, size: "Free size", brand: "Fabindia", imageUrl: p("7f1d1d","Maroon Saree") },
  { name: "Beige Printed Kurti", category: "traditional", type: "kurti", color: "beige", purchasePrice: 1999, size: "M", brand: "Fabindia", imageUrl: p("d6c6a8","Beige Kurti") },
  { name: "Black Leather Jacket", category: "outerwear", type: "jacket", color: "black", purchasePrice: 12999, size: "M", brand: "Zara", imageUrl: p("111827","Black Leather") },
  { name: "Camel Trench Coat", category: "outerwear", type: "coat", color: "beige", purchasePrice: 15999, size: "M", brand: "Mango", imageUrl: p("d6c6a8","Camel Trench") },
  { name: "Navy Blazer", category: "outerwear", type: "blazer", color: "navy", purchasePrice: 8999, size: "M", brand: "Van Heusen", imageUrl: p("0b1f3a","Navy Blazer") },
  { name: "Grey Wool Coat", category: "outerwear", type: "coat", color: "gray", purchasePrice: 18999, size: "M", brand: "Marks & Spencer", imageUrl: p("6b7280","Grey Coat") },
  { name: "Denim Jacket", category: "outerwear", type: "jacket", color: "blue", purchasePrice: 5999, size: "M", brand: "Levis", imageUrl: p("3b82f6","Denim Jacket") },
  { name: "White Blazer", category: "outerwear", type: "blazer", color: "white", purchasePrice: 7999, size: "M", brand: "Zara", imageUrl: p("f9fafb","White Blazer") },
  { name: "Black Formal Blazer", category: "outerwear", type: "blazer", color: "black", purchasePrice: 9999, size: "M", brand: "Arrow", imageUrl: p("111827","Black Blazer") },
  { name: "Burgundy Cardigan", category: "outerwear", type: "cardigan", color: "burgundy", purchasePrice: 4999, size: "M", brand: "Mango", imageUrl: p("991b1b","Burgundy Cardi") },
  { name: "White Sneakers", category: "shoes", type: "sneakers", color: "white", purchasePrice: 7999, size: "M", brand: "Nike", imageUrl: p("f9fafb","White Sneakers") },
  { name: "Black Ankle Boots", category: "shoes", type: "boots", color: "black", purchasePrice: 9999, size: "M", brand: "Zara", imageUrl: p("111827","Black Boots") },
  { name: "Nude Block Heels", category: "shoes", type: "heels", color: "beige", purchasePrice: 5999, size: "M", brand: "Steve Madden", imageUrl: p("d6c6a8","Nude Heels") },
  { name: "Brown Loafers", category: "shoes", type: "loafers", color: "brown", purchasePrice: 6999, size: "M", brand: "Clarks", imageUrl: p("7c4a2d","Brown Loafers") },
  { name: "Gold Strappy Sandals", category: "shoes", type: "sandals", color: "gold", purchasePrice: 4999, size: "M", brand: "Aldo", imageUrl: p("fbbf24","Gold Sandals") },
  { name: "Black Ballet Flats", category: "shoes", type: "ballet-flats", color: "black", purchasePrice: 3999, size: "M", brand: "Mango", imageUrl: p("111827","Black Flats") },
  { name: "Red Stilettos", category: "shoes", type: "stilettos", color: "red", purchasePrice: 8999, size: "M", brand: "Steve Madden", imageUrl: p("ef4444","Red Stilettos") },
  { name: "White Slip-On Sneakers", category: "shoes", type: "sneakers", color: "white", purchasePrice: 4999, size: "M", brand: "Vans", imageUrl: p("f9fafb","White Slip-On") },
  { name: "Black Leather Handbag", category: "accessory", type: "handbag", color: "black", purchasePrice: 8999, size: "Free size", brand: "Zara", imageUrl: p("111827","Black Handbag") },
  { name: "Tan Tote Bag", category: "accessory", type: "bag", color: "brown", purchasePrice: 6999, size: "Free size", brand: "Mango", imageUrl: p("7c4a2d","Tan Tote") },
  { name: "Gold Statement Necklace", category: "accessory", type: "jewelry", color: "gold", purchasePrice: 3999, size: "Free size", brand: "Accessorize", imageUrl: p("fbbf24","Gold Necklace") },
  { name: "Black Leather Belt", category: "accessory", type: "belt", color: "black", purchasePrice: 2499, size: "M", brand: "Zara", imageUrl: p("111827","Black Belt") },
  { name: "Navy Blue Scarf", category: "accessory", type: "scarf", color: "navy", purchasePrice: 1999, size: "Free size", brand: "Fabindia", imageUrl: p("0b1f3a","Navy Scarf") },
  { name: "Rose Gold Watch", category: "accessory", type: "watch", color: "rose-gold", purchasePrice: 12999, size: "Free size", brand: "Daniel Wellington", imageUrl: p("f9a8d4","Rose Gold Watch") },
  { name: "Beige Clutch", category: "accessory", type: "clutch", color: "beige", purchasePrice: 4999, size: "Free size", brand: "Aldo", imageUrl: p("d6c6a8","Beige Clutch") },
  { name: "Black Backpack", category: "accessory", type: "backpack", color: "black", purchasePrice: 5999, size: "Free size", brand: "Wildcraft", imageUrl: p("111827","Black Backpack") },
  { name: "Silver Hoop Earrings", category: "accessory", type: "jewelry", color: "silver", purchasePrice: 1999, size: "Free size", brand: "Accessorize", imageUrl: p("d1d5db","Silver Hoops") },
  { name: "Brown Sling Bag", category: "accessory", type: "bag", color: "brown", purchasePrice: 4499, size: "Free size", brand: "Mango", imageUrl: p("7c4a2d","Brown Sling") },
];

export const seedWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const existing = await getDocs(wardrobeRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));
    await Promise.all(
      SEED_ITEMS.map(item =>
        addDoc(wardrobeRef, { ...item, wearCount: 0, lastWorn: null, purchaseDate: "2024-01-01", createdAt: serverTimestamp() })
      )
    );
    return { success: true, message: "Added " + SEED_ITEMS.length + " items to your wardrobe!" };
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