import { collection, addDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";

// Pexels CDN - free, no CORS issues, no models, flat-lay clothing photos
export const SEED_ITEMS = [
  // TOPS
  { name: "White Cotton T-Shirt", category: "top", type: "t-shirt", color: "white", purchasePrice: 1299, size: "M", brand: "H&M",
    imageUrl: "https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black V-Neck T-Shirt", category: "top", type: "t-shirt", color: "black", purchasePrice: 1499, size: "M", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/5698852/pexels-photo-5698852.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "White Linen Shirt", category: "top", type: "shirt", color: "white", purchasePrice: 2499, size: "M", brand: "Fabindia",
    imageUrl: "https://images.pexels.com/photos/6311654/pexels-photo-6311654.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Light Blue Oxford Shirt", category: "top", type: "shirt", color: "blue", purchasePrice: 2999, size: "M", brand: "Arrow",
    imageUrl: "https://images.pexels.com/photos/3760854/pexels-photo-3760854.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Beige Oversized Shirt", category: "top", type: "shirt", color: "beige", purchasePrice: 2199, size: "L", brand: "H&M",
    imageUrl: "https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Grey Marl Hoodie", category: "top", type: "hoodie", color: "gray", purchasePrice: 3999, size: "L", brand: "Nike",
    imageUrl: "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Zip Hoodie", category: "top", type: "hoodie", color: "black", purchasePrice: 4499, size: "M", brand: "Adidas",
    imageUrl: "https://images.pexels.com/photos/6311388/pexels-photo-6311388.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Cream Knit Sweater", category: "top", type: "sweater", color: "cream", purchasePrice: 5999, size: "M", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/6311389/pexels-photo-6311389.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Burgundy Turtleneck Sweater", category: "top", type: "sweater", color: "burgundy", purchasePrice: 4999, size: "M", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Blush Pink Crop Top", category: "top", type: "crop-top", color: "pink", purchasePrice: 1899, size: "S", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/6311391/pexels-photo-6311391.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Satin Blouse", category: "top", type: "blouse", color: "black", purchasePrice: 3499, size: "S", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/6311393/pexels-photo-6311393.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Ivory Silk Blouse", category: "top", type: "blouse", color: "cream", purchasePrice: 4999, size: "M", brand: "AND",
    imageUrl: "https://images.pexels.com/photos/6311394/pexels-photo-6311394.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Red Polo Shirt", category: "top", type: "polo", color: "red", purchasePrice: 2299, size: "M", brand: "Lacoste",
    imageUrl: "https://images.pexels.com/photos/6311395/pexels-photo-6311395.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Olive Green Tank Top", category: "top", type: "tank", color: "olive", purchasePrice: 1199, size: "M", brand: "H&M",
    imageUrl: "https://images.pexels.com/photos/6311396/pexels-photo-6311396.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Lavender Crop Sweater", category: "top", type: "sweater", color: "lavender", purchasePrice: 3499, size: "S", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/6311397/pexels-photo-6311397.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },

  // BOTTOMS
  { name: "Blue Skinny Jeans", category: "bottom", type: "jeans", color: "blue", purchasePrice: 3999, size: "M", brand: "Levis",
    imageUrl: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Slim Jeans", category: "bottom", type: "jeans", color: "black", purchasePrice: 4499, size: "M", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Denim Mini Skirt", category: "bottom", type: "skirt", color: "blue", purchasePrice: 2999, size: "S", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/6311398/pexels-photo-6311398.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Midi Skirt", category: "bottom", type: "skirt", color: "black", purchasePrice: 3499, size: "M", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/6311399/pexels-photo-6311399.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Pink Pleated Skirt", category: "bottom", type: "skirt", color: "pink", purchasePrice: 2999, size: "S", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/6311400/pexels-photo-6311400.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Beige Chinos", category: "bottom", type: "chinos", color: "beige", purchasePrice: 3299, size: "M", brand: "Marks & Spencer",
    imageUrl: "https://images.pexels.com/photos/6311401/pexels-photo-6311401.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Leggings", category: "bottom", type: "leggings", color: "black", purchasePrice: 1499, size: "M", brand: "Nike",
    imageUrl: "https://images.pexels.com/photos/6311402/pexels-photo-6311402.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Navy Palazzo Pants", category: "bottom", type: "palazzo", color: "navy", purchasePrice: 2499, size: "M", brand: "W",
    imageUrl: "https://images.pexels.com/photos/6311403/pexels-photo-6311403.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Grey Joggers", category: "bottom", type: "joggers", color: "gray", purchasePrice: 2499, size: "L", brand: "Adidas",
    imageUrl: "https://images.pexels.com/photos/6311404/pexels-photo-6311404.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Navy Formal Trousers", category: "bottom", type: "trousers", color: "navy", purchasePrice: 4999, size: "M", brand: "Van Heusen",
    imageUrl: "https://images.pexels.com/photos/6311405/pexels-photo-6311405.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Formal Trousers", category: "bottom", type: "trousers", color: "black", purchasePrice: 4499, size: "M", brand: "Arrow",
    imageUrl: "https://images.pexels.com/photos/6311406/pexels-photo-6311406.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },

  // DRESSES
  { name: "Black Wrap Dress", category: "dress", type: "casual-dress", color: "black", purchasePrice: 5999, size: "M", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/6311407/pexels-photo-6311407.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Floral Midi Dress", category: "dress", type: "midi-dress", color: "pink", purchasePrice: 4999, size: "S", brand: "H&M",
    imageUrl: "https://images.pexels.com/photos/6311408/pexels-photo-6311408.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Navy Maxi Dress", category: "dress", type: "maxi-dress", color: "navy", purchasePrice: 6999, size: "M", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/6311409/pexels-photo-6311409.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "White Sundress", category: "dress", type: "sundress", color: "white", purchasePrice: 3999, size: "S", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/6311410/pexels-photo-6311410.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Red Cocktail Dress", category: "dress", type: "cocktail-dress", color: "red", purchasePrice: 8999, size: "M", brand: "AND",
    imageUrl: "https://images.pexels.com/photos/6311411/pexels-photo-6311411.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Beige Shirt Dress", category: "dress", type: "casual-dress", color: "beige", purchasePrice: 4499, size: "M", brand: "H&M",
    imageUrl: "https://images.pexels.com/photos/6311412/pexels-photo-6311412.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Lavender Mini Dress", category: "dress", type: "mini-dress", color: "lavender", purchasePrice: 4999, size: "S", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/6311413/pexels-photo-6311413.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Formal Dress", category: "dress", type: "formal-dress", color: "black", purchasePrice: 9999, size: "M", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/6311414/pexels-photo-6311414.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Burgundy Midi Dress", category: "dress", type: "midi-dress", color: "burgundy", purchasePrice: 6499, size: "M", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/6311415/pexels-photo-6311415.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Emerald Evening Gown", category: "dress", type: "evening-gown", color: "green", purchasePrice: 18999, size: "M", brand: "Ritu Kumar",
    imageUrl: "https://images.pexels.com/photos/6311416/pexels-photo-6311416.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },

  // TRADITIONAL
  { name: "Silk Banarasi Saree", category: "traditional", type: "saree", color: "red", purchasePrice: 25000, size: "Free size", brand: "Fabindia",
    imageUrl: "https://images.pexels.com/photos/2916450/pexels-photo-2916450.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Navy Blue Lehenga", category: "traditional", type: "lehenga", color: "navy", purchasePrice: 35000, size: "M", brand: "Ritu Kumar",
    imageUrl: "https://images.pexels.com/photos/2916451/pexels-photo-2916451.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Pink Anarkali Suit", category: "traditional", type: "anarkali", color: "pink", purchasePrice: 8999, size: "M", brand: "Biba",
    imageUrl: "https://images.pexels.com/photos/2916452/pexels-photo-2916452.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "White Cotton Kurti", category: "traditional", type: "kurti", color: "white", purchasePrice: 2499, size: "M", brand: "Fabindia",
    imageUrl: "https://images.pexels.com/photos/2916453/pexels-photo-2916453.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Maroon Silk Saree", category: "traditional", type: "saree", color: "maroon", purchasePrice: 18000, size: "Free size", brand: "Fabindia",
    imageUrl: "https://images.pexels.com/photos/2916454/pexels-photo-2916454.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },

  // OUTERWEAR
  { name: "Black Leather Jacket", category: "outerwear", type: "jacket", color: "black", purchasePrice: 12999, size: "M", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Camel Trench Coat", category: "outerwear", type: "coat", color: "beige", purchasePrice: 15999, size: "M", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/1124469/pexels-photo-1124469.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Navy Blazer", category: "outerwear", type: "blazer", color: "navy", purchasePrice: 8999, size: "M", brand: "Van Heusen",
    imageUrl: "https://images.pexels.com/photos/1124470/pexels-photo-1124470.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Denim Jacket", category: "outerwear", type: "jacket", color: "blue", purchasePrice: 5999, size: "M", brand: "Levis",
    imageUrl: "https://images.pexels.com/photos/1124471/pexels-photo-1124471.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Formal Blazer", category: "outerwear", type: "blazer", color: "black", purchasePrice: 9999, size: "M", brand: "Arrow",
    imageUrl: "https://images.pexels.com/photos/1124472/pexels-photo-1124472.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Burgundy Cardigan", category: "outerwear", type: "cardigan", color: "burgundy", purchasePrice: 4999, size: "M", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/1124473/pexels-photo-1124473.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },

  // SHOES
  { name: "White Sneakers", category: "shoes", type: "sneakers", color: "white", purchasePrice: 7999, size: "M", brand: "Nike",
    imageUrl: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Ankle Boots", category: "shoes", type: "boots", color: "black", purchasePrice: 9999, size: "M", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/2529149/pexels-photo-2529149.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Nude Block Heels", category: "shoes", type: "heels", color: "beige", purchasePrice: 5999, size: "M", brand: "Steve Madden",
    imageUrl: "https://images.pexels.com/photos/2529150/pexels-photo-2529150.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Gold Strappy Sandals", category: "shoes", type: "sandals", color: "gold", purchasePrice: 4999, size: "M", brand: "Aldo",
    imageUrl: "https://images.pexels.com/photos/2529151/pexels-photo-2529151.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Black Ballet Flats", category: "shoes", type: "ballet-flats", color: "black", purchasePrice: 3999, size: "M", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/2529152/pexels-photo-2529152.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Red Stilettos", category: "shoes", type: "stilettos", color: "red", purchasePrice: 8999, size: "M", brand: "Steve Madden",
    imageUrl: "https://images.pexels.com/photos/2529153/pexels-photo-2529153.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },

  // ACCESSORIES
  { name: "Black Leather Handbag", category: "accessory", type: "handbag", color: "black", purchasePrice: 8999, size: "Free size", brand: "Zara",
    imageUrl: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Tan Tote Bag", category: "accessory", type: "bag", color: "brown", purchasePrice: 6999, size: "Free size", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/1152078/pexels-photo-1152078.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Gold Statement Necklace", category: "accessory", type: "jewelry", color: "gold", purchasePrice: 3999, size: "Free size", brand: "Accessorize",
    imageUrl: "https://images.pexels.com/photos/1152079/pexels-photo-1152079.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Rose Gold Watch", category: "accessory", type: "watch", color: "rose-gold", purchasePrice: 12999, size: "Free size", brand: "Daniel Wellington",
    imageUrl: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Beige Clutch Bag", category: "accessory", type: "clutch", color: "beige", purchasePrice: 4999, size: "Free size", brand: "Aldo",
    imageUrl: "https://images.pexels.com/photos/1152080/pexels-photo-1152080.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Silver Hoop Earrings", category: "accessory", type: "jewelry", color: "silver", purchasePrice: 1999, size: "Free size", brand: "Accessorize",
    imageUrl: "https://images.pexels.com/photos/1152081/pexels-photo-1152081.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
  { name: "Brown Sling Bag", category: "accessory", type: "bag", color: "brown", purchasePrice: 4499, size: "Free size", brand: "Mango",
    imageUrl: "https://images.pexels.com/photos/1152082/pexels-photo-1152082.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop" },
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