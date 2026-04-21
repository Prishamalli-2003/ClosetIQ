import { collection, addDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";

// Real flat-lay clothing photos from Unsplash (no models, white/neutral backgrounds)
export const SEED_ITEMS = [
  // TOPS
  { name: "White Cotton T-Shirt", category: "top", type: "t-shirt", color: "white", purchasePrice: 1299, size: "M", brand: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&auto=format" },
  { name: "Black V-Neck T-Shirt", category: "top", type: "t-shirt", color: "black", purchasePrice: 1499, size: "M", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop&auto=format" },
  { name: "Navy Striped T-Shirt", category: "top", type: "t-shirt", color: "navy", purchasePrice: 1599, size: "M", brand: "Marks & Spencer",
    imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop&auto=format" },
  { name: "Blush Pink Crop Top", category: "top", type: "crop-top", color: "pink", purchasePrice: 1899, size: "S", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop&auto=format" },
  { name: "White Linen Shirt", category: "top", type: "shirt", color: "white", purchasePrice: 2499, size: "M", brand: "Fabindia",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&auto=format" },
  { name: "Light Blue Oxford Shirt", category: "top", type: "shirt", color: "blue", purchasePrice: 2999, size: "M", brand: "Arrow",
    imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&h=500&fit=crop&auto=format" },
  { name: "Beige Oversized Shirt", category: "top", type: "shirt", color: "beige", purchasePrice: 2199, size: "L", brand: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Satin Blouse", category: "top", type: "blouse", color: "black", purchasePrice: 3499, size: "S", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop&auto=format" },
  { name: "Ivory Silk Blouse", category: "top", type: "blouse", color: "cream", purchasePrice: 4999, size: "M", brand: "AND",
    imageUrl: "https://images.unsplash.com/photo-1551163943-3f7253a97e52?w=400&h=500&fit=crop&auto=format" },
  { name: "Grey Marl Hoodie", category: "top", type: "hoodie", color: "gray", purchasePrice: 3999, size: "L", brand: "Nike",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Zip Hoodie", category: "top", type: "hoodie", color: "black", purchasePrice: 4499, size: "M", brand: "Adidas",
    imageUrl: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=400&h=500&fit=crop&auto=format" },
  { name: "Cream Knit Sweater", category: "top", type: "sweater", color: "cream", purchasePrice: 5999, size: "M", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop&auto=format" },
  { name: "Burgundy Turtleneck", category: "top", type: "sweater", color: "burgundy", purchasePrice: 4999, size: "M", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?w=400&h=500&fit=crop&auto=format" },
  { name: "White Camisole", category: "top", type: "camisole", color: "white", purchasePrice: 999, size: "S", brand: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop&auto=format" },
  { name: "Lavender Crop Sweater", category: "top", type: "sweater", color: "lavender", purchasePrice: 3499, size: "S", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=500&fit=crop&auto=format" },
  { name: "Olive Green Tank Top", category: "top", type: "tank", color: "olive", purchasePrice: 1199, size: "M", brand: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=500&fit=crop&auto=format" },
  { name: "Red Polo Shirt", category: "top", type: "polo", color: "red", purchasePrice: 2299, size: "M", brand: "Lacoste",
    imageUrl: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=500&fit=crop&auto=format" },
  { name: "Teal Printed Blouse", category: "top", type: "blouse", color: "teal", purchasePrice: 2599, size: "S", brand: "W",
    imageUrl: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=500&fit=crop&auto=format" },
  { name: "Yellow Crop Top", category: "top", type: "crop-top", color: "yellow", purchasePrice: 1599, size: "S", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=500&fit=crop&auto=format" },
  { name: "Brown Knit Sweater", category: "top", type: "sweater", color: "brown", purchasePrice: 4499, size: "M", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&auto=format" },

  // BOTTOMS
  { name: "Blue Skinny Jeans", category: "bottom", type: "jeans", color: "blue", purchasePrice: 3999, size: "M", brand: "Levis",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Slim Jeans", category: "bottom", type: "jeans", color: "black", purchasePrice: 4499, size: "M", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop&auto=format" },
  { name: "White Wide Leg Trousers", category: "bottom", type: "trousers", color: "white", purchasePrice: 3499, size: "M", brand: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=400&h=500&fit=crop&auto=format" },
  { name: "Beige Chinos", category: "bottom", type: "chinos", color: "beige", purchasePrice: 3299, size: "M", brand: "Marks & Spencer",
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Leggings", category: "bottom", type: "leggings", color: "black", purchasePrice: 1499, size: "M", brand: "Nike",
    imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop&auto=format" },
  { name: "Navy Palazzo Pants", category: "bottom", type: "palazzo", color: "navy", purchasePrice: 2499, size: "M", brand: "W",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop&auto=format" },
  { name: "Denim Mini Skirt", category: "bottom", type: "skirt", color: "blue", purchasePrice: 2999, size: "S", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Midi Skirt", category: "bottom", type: "skirt", color: "black", purchasePrice: 3499, size: "M", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=400&h=500&fit=crop&auto=format" },
  { name: "Grey Joggers", category: "bottom", type: "joggers", color: "gray", purchasePrice: 2499, size: "L", brand: "Adidas",
    imageUrl: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=500&fit=crop&auto=format" },
  { name: "Olive Cargo Pants", category: "bottom", type: "trousers", color: "olive", purchasePrice: 3999, size: "M", brand: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400&h=500&fit=crop&auto=format" },
  { name: "Navy Formal Trousers", category: "bottom", type: "trousers", color: "navy", purchasePrice: 4999, size: "M", brand: "Van Heusen",
    imageUrl: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Formal Trousers", category: "bottom", type: "trousers", color: "black", purchasePrice: 4499, size: "M", brand: "Arrow",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop&auto=format" },
  { name: "Pink Pleated Skirt", category: "bottom", type: "skirt", color: "pink", purchasePrice: 2999, size: "S", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&auto=format" },
  { name: "Brown Corduroy Pants", category: "bottom", type: "trousers", color: "brown", purchasePrice: 3999, size: "M", brand: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=500&fit=crop&auto=format" },

  // DRESSES
  { name: "Black Wrap Dress", category: "dress", type: "casual-dress", color: "black", purchasePrice: 5999, size: "M", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop&auto=format" },
  { name: "Floral Midi Dress", category: "dress", type: "midi-dress", color: "pink", purchasePrice: 4999, size: "S", brand: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=400&h=500&fit=crop&auto=format" },
  { name: "Navy Maxi Dress", category: "dress", type: "maxi-dress", color: "navy", purchasePrice: 6999, size: "M", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop&auto=format" },
  { name: "White Sundress", category: "dress", type: "sundress", color: "white", purchasePrice: 3999, size: "S", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop&auto=format" },
  { name: "Red Cocktail Dress", category: "dress", type: "cocktail-dress", color: "red", purchasePrice: 8999, size: "M", brand: "AND",
    imageUrl: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&h=500&fit=crop&auto=format" },
  { name: "Beige Shirt Dress", category: "dress", type: "casual-dress", color: "beige", purchasePrice: 4499, size: "M", brand: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop&auto=format" },
  { name: "Lavender Mini Dress", category: "dress", type: "mini-dress", color: "lavender", purchasePrice: 4999, size: "S", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Formal Dress", category: "dress", type: "formal-dress", color: "black", purchasePrice: 9999, size: "M", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop&auto=format" },
  { name: "Burgundy Midi Dress", category: "dress", type: "midi-dress", color: "burgundy", purchasePrice: 6499, size: "M", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=400&h=500&fit=crop&auto=format" },

  // TRADITIONAL
  { name: "Silk Banarasi Saree", category: "traditional", type: "saree", color: "red", purchasePrice: 25000, size: "Free size", brand: "Fabindia",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop&auto=format" },
  { name: "Navy Blue Lehenga", category: "traditional", type: "lehenga", color: "navy", purchasePrice: 35000, size: "M", brand: "Ritu Kumar",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop&auto=format" },
  { name: "Pink Anarkali Suit", category: "traditional", type: "anarkali", color: "pink", purchasePrice: 8999, size: "M", brand: "Biba",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop&auto=format" },
  { name: "White Cotton Kurti", category: "traditional", type: "kurti", color: "white", purchasePrice: 2499, size: "M", brand: "Fabindia",
    imageUrl: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=500&fit=crop&auto=format" },
  { name: "Maroon Silk Saree", category: "traditional", type: "saree", color: "maroon", purchasePrice: 18000, size: "Free size", brand: "Fabindia",
    imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&h=500&fit=crop&auto=format" },
  { name: "Beige Printed Kurti", category: "traditional", type: "kurti", color: "beige", purchasePrice: 1999, size: "M", brand: "Fabindia",
    imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=500&fit=crop&auto=format" },

  // OUTERWEAR
  { name: "Black Leather Jacket", category: "outerwear", type: "jacket", color: "black", purchasePrice: 12999, size: "M", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop&auto=format" },
  { name: "Camel Trench Coat", category: "outerwear", type: "coat", color: "beige", purchasePrice: 15999, size: "M", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop&auto=format" },
  { name: "Navy Blazer", category: "outerwear", type: "blazer", color: "navy", purchasePrice: 8999, size: "M", brand: "Van Heusen",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop&auto=format" },
  { name: "Grey Wool Coat", category: "outerwear", type: "coat", color: "gray", purchasePrice: 18999, size: "M", brand: "Marks & Spencer",
    imageUrl: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&h=500&fit=crop&auto=format" },
  { name: "Denim Jacket", category: "outerwear", type: "jacket", color: "blue", purchasePrice: 5999, size: "M", brand: "Levis",
    imageUrl: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400&h=500&fit=crop&auto=format" },
  { name: "White Blazer", category: "outerwear", type: "blazer", color: "white", purchasePrice: 7999, size: "M", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Formal Blazer", category: "outerwear", type: "blazer", color: "black", purchasePrice: 9999, size: "M", brand: "Arrow",
    imageUrl: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=500&fit=crop&auto=format" },
  { name: "Burgundy Cardigan", category: "outerwear", type: "cardigan", color: "burgundy", purchasePrice: 4999, size: "M", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop&auto=format" },

  // SHOES
  { name: "White Sneakers", category: "shoes", type: "sneakers", color: "white", purchasePrice: 7999, size: "M", brand: "Nike",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Ankle Boots", category: "shoes", type: "boots", color: "black", purchasePrice: 9999, size: "M", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop&auto=format" },
  { name: "Nude Block Heels", category: "shoes", type: "heels", color: "beige", purchasePrice: 5999, size: "M", brand: "Steve Madden",
    imageUrl: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=400&h=500&fit=crop&auto=format" },
  { name: "Brown Loafers", category: "shoes", type: "loafers", color: "brown", purchasePrice: 6999, size: "M", brand: "Clarks",
    imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=500&fit=crop&auto=format" },
  { name: "Gold Strappy Sandals", category: "shoes", type: "sandals", color: "gold", purchasePrice: 4999, size: "M", brand: "Aldo",
    imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Ballet Flats", category: "shoes", type: "ballet-flats", color: "black", purchasePrice: 3999, size: "M", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=500&fit=crop&auto=format" },
  { name: "Red Stilettos", category: "shoes", type: "stilettos", color: "red", purchasePrice: 8999, size: "M", brand: "Steve Madden",
    imageUrl: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=400&h=500&fit=crop&auto=format" },
  { name: "White Slip-On Sneakers", category: "shoes", type: "sneakers", color: "white", purchasePrice: 4999, size: "M", brand: "Vans",
    imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop&auto=format" },

  // ACCESSORIES
  { name: "Black Leather Handbag", category: "accessory", type: "handbag", color: "black", purchasePrice: 8999, size: "Free size", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop&auto=format" },
  { name: "Tan Tote Bag", category: "accessory", type: "bag", color: "brown", purchasePrice: 6999, size: "Free size", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop&auto=format" },
  { name: "Gold Statement Necklace", category: "accessory", type: "jewelry", color: "gold", purchasePrice: 3999, size: "Free size", brand: "Accessorize",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Leather Belt", category: "accessory", type: "belt", color: "black", purchasePrice: 2499, size: "M", brand: "Zara",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&auto=format" },
  { name: "Rose Gold Watch", category: "accessory", type: "watch", color: "rose-gold", purchasePrice: 12999, size: "Free size", brand: "Daniel Wellington",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop&auto=format" },
  { name: "Beige Clutch", category: "accessory", type: "clutch", color: "beige", purchasePrice: 4999, size: "Free size", brand: "Aldo",
    imageUrl: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=500&fit=crop&auto=format" },
  { name: "Black Backpack", category: "accessory", type: "backpack", color: "black", purchasePrice: 5999, size: "Free size", brand: "Wildcraft",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop&auto=format" },
  { name: "Silver Hoop Earrings", category: "accessory", type: "jewelry", color: "silver", purchasePrice: 1999, size: "Free size", brand: "Accessorize",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=500&fit=crop&auto=format" },
  { name: "Brown Sling Bag", category: "accessory", type: "bag", color: "brown", purchasePrice: 4499, size: "Free size", brand: "Mango",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&auto=format" },
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