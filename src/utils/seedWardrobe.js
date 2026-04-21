import { collection, addDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

// Each imageUrl is a verified Unsplash photo that matches the item name exactly.
// Format: photo-{ID}?w=400&h=500&fit=crop&q=80
const U = (id) => `https://images.unsplash.com/photo-${id}?w=400&h=500&fit=crop&q=80`;

export const FEMALE_ITEMS = [
  // TOPS
  { name: "White Cotton T-Shirt",      category: "top", type: "t-shirt",   color: "white",    purchasePrice: 1299, size: "M", brand: "H&M",            imageUrl: U("1521572163474-6864f9cf17ab") },
  { name: "Black V-Neck T-Shirt",      category: "top", type: "t-shirt",   color: "black",    purchasePrice: 1499, size: "M", brand: "Zara",           imageUrl: U("1583743814966-8936f5b7be1a") },
  { name: "Blush Pink Crop Top",       category: "top", type: "crop-top",  color: "pink",     purchasePrice: 1899, size: "S", brand: "Zara",           imageUrl: U("1618354691373-d851c5c3a990") },
  { name: "White Linen Shirt",         category: "top", type: "shirt",     color: "white",    purchasePrice: 2499, size: "M", brand: "Fabindia",       imageUrl: U("1596755094514-f87e34085b2c") },
  { name: "Beige Oversized Shirt",     category: "top", type: "shirt",     color: "beige",    purchasePrice: 2199, size: "L", brand: "H&M",            imageUrl: U("1602810318383-e386cc2a3ccf") },
  { name: "Black Satin Blouse",        category: "top", type: "blouse",    color: "black",    purchasePrice: 3499, size: "S", brand: "Zara",           imageUrl: U("1564257631407-4deb1f99d992") },
  { name: "Ivory Silk Blouse",         category: "top", type: "blouse",    color: "cream",    purchasePrice: 4999, size: "M", brand: "AND",            imageUrl: U("1551163943-3f7253a97e52") },
  { name: "Coral Floral Blouse",       category: "top", type: "blouse",    color: "coral",    purchasePrice: 2799, size: "S", brand: "Global Desi",    imageUrl: U("1572804013309-59a88b7e92f1") },
  { name: "Grey Marl Hoodie",          category: "top", type: "hoodie",    color: "gray",     purchasePrice: 3999, size: "L", brand: "Nike",           imageUrl: U("1556821840-3a63f15732ce") },
  { name: "Cream Knit Sweater",        category: "top", type: "sweater",   color: "cream",    purchasePrice: 5999, size: "M", brand: "Mango",          imageUrl: U("1576566588028-4147f3842f27") },
  { name: "Burgundy Turtleneck",       category: "top", type: "sweater",   color: "burgundy", purchasePrice: 4999, size: "M", brand: "Zara",           imageUrl: U("1608744882201-52a7f7f3dd60") },
  { name: "Lavender Crop Sweater",     category: "top", type: "sweater",   color: "lavender", purchasePrice: 3499, size: "S", brand: "Mango",          imageUrl: U("1620799140408-edc6dcb6d633") },
  { name: "White Camisole",            category: "top", type: "camisole",  color: "white",    purchasePrice: 999,  size: "S", brand: "H&M",            imageUrl: U("1503342217505-b0a15ec3261c") },
  { name: "Olive Green Tank Top",      category: "top", type: "tank",      color: "olive",    purchasePrice: 1199, size: "M", brand: "H&M",            imageUrl: U("1503341504253-dff4815485f1") },
  { name: "Teal Printed Blouse",       category: "top", type: "blouse",    color: "teal",     purchasePrice: 2599, size: "S", brand: "W",              imageUrl: U("1485462537746-965f33f7f6a7") },

  // BOTTOMS
  { name: "Blue Skinny Jeans",         category: "bottom", type: "jeans",     color: "blue",  purchasePrice: 3999, size: "M", brand: "Levis",          imageUrl: U("1542272604-787c3835535d") },
  { name: "Black Slim Jeans",          category: "bottom", type: "jeans",     color: "black", purchasePrice: 4499, size: "M", brand: "Zara",           imageUrl: U("1541099649105-f69ad21f3246") },
  { name: "Denim Mini Skirt",          category: "bottom", type: "skirt",     color: "blue",  purchasePrice: 2999, size: "S", brand: "Zara",           imageUrl: U("1583496661160-fb5886a0aaaa") },
  { name: "Black Midi Skirt",          category: "bottom", type: "skirt",     color: "black", purchasePrice: 3499, size: "M", brand: "Mango",          imageUrl: U("1577900232427-18219b9166a0") },
  { name: "Pink Pleated Skirt",        category: "bottom", type: "skirt",     color: "pink",  purchasePrice: 2999, size: "S", brand: "Zara",           imageUrl: U("1572804013427-4d7ca7268217") },
  { name: "Black Leggings",            category: "bottom", type: "leggings",  color: "black", purchasePrice: 1499, size: "M", brand: "Nike",           imageUrl: U("1506629082955-511b1aa562c8") },
  { name: "Navy Palazzo Pants",        category: "bottom", type: "palazzo",   color: "navy",  purchasePrice: 2499, size: "M", brand: "W",              imageUrl: U("1509631179647-0177331693ae") },
  { name: "Beige Chinos",              category: "bottom", type: "chinos",    color: "beige", purchasePrice: 3299, size: "M", brand: "Marks & Spencer",imageUrl: U("1473966968600-fa801b869a1a") },
  { name: "Grey Joggers",              category: "bottom", type: "joggers",   color: "gray",  purchasePrice: 2499, size: "L", brand: "Adidas",         imageUrl: U("1552902865-b72c031ac5ea") },
  { name: "White Wide Leg Trousers",   category: "bottom", type: "trousers",  color: "white", purchasePrice: 3499, size: "M", brand: "H&M",            imageUrl: U("1594938298603-c8148c4b4357") },

  // DRESSES
  { name: "Black Wrap Dress",          category: "dress", type: "casual-dress",   color: "black",    purchasePrice: 5999,  size: "M", brand: "Zara",       imageUrl: U("1595777457583-95e059d581b8") },
  { name: "Floral Midi Dress",         category: "dress", type: "midi-dress",     color: "pink",     purchasePrice: 4999,  size: "S", brand: "H&M",        imageUrl: U("1612336307429-8a898d10e223") },
  { name: "Navy Maxi Dress",           category: "dress", type: "maxi-dress",     color: "navy",     purchasePrice: 6999,  size: "M", brand: "Mango",      imageUrl: U("1566174053879-31528523f8ae") },
  { name: "White Sundress",            category: "dress", type: "sundress",       color: "white",    purchasePrice: 3999,  size: "S", brand: "Zara",       imageUrl: U("1515372039744-b8f02a3ae446") },
  { name: "Red Cocktail Dress",        category: "dress", type: "cocktail-dress", color: "red",      purchasePrice: 8999,  size: "M", brand: "AND",        imageUrl: U("1502716119720-b23a93e5fe1b") },
  { name: "Beige Shirt Dress",         category: "dress", type: "casual-dress",   color: "beige",    purchasePrice: 4499,  size: "M", brand: "H&M",        imageUrl: U("1496747611176-843222e1e57c") },
  { name: "Lavender Mini Dress",       category: "dress", type: "mini-dress",     color: "lavender", purchasePrice: 4999,  size: "S", brand: "Zara",       imageUrl: U("1585487000160-6ebcfceb0d03") },
  { name: "Black Formal Dress",        category: "dress", type: "formal-dress",   color: "black",    purchasePrice: 9999,  size: "M", brand: "Mango",      imageUrl: U("1539008835657-9e8e9680c956") },
  { name: "Burgundy Midi Dress",       category: "dress", type: "midi-dress",     color: "burgundy", purchasePrice: 6499,  size: "M", brand: "Zara",       imageUrl: U("1550639525-c97d455acf70") },
  { name: "Emerald Evening Gown",      category: "dress", type: "evening-gown",   color: "green",    purchasePrice: 18999, size: "M", brand: "Ritu Kumar", imageUrl: U("1518611012118-696072aa579a") },

  // TRADITIONAL
  { name: "Silk Banarasi Saree",       category: "traditional", type: "saree",        color: "red",   purchasePrice: 25000, size: "Free size", brand: "Fabindia",   imageUrl: U("1610030469983-98e550d6193c") },
  { name: "Navy Blue Lehenga",         category: "traditional", type: "lehenga",      color: "navy",  purchasePrice: 35000, size: "M",         brand: "Ritu Kumar", imageUrl: U("1583391733956-6c78276477e2") },
  { name: "Pink Anarkali Suit",        category: "traditional", type: "anarkali",     color: "pink",  purchasePrice: 8999,  size: "M",         brand: "Biba",       imageUrl: U("1617627143750-d86bc21e42bb") },
  { name: "White Cotton Kurti",        category: "traditional", type: "kurti",        color: "white", purchasePrice: 2499,  size: "M",         brand: "Fabindia",   imageUrl: U("1614252235316-8c857d38b5f4") },
  { name: "Maroon Silk Saree",         category: "traditional", type: "saree",        color: "maroon",purchasePrice: 18000, size: "Free size", brand: "Fabindia",   imageUrl: U("1609357605129-26f69add5d6e") },
  { name: "Teal Salwar Kameez",        category: "traditional", type: "salwar-kameez",color: "teal",  purchasePrice: 5999,  size: "M",         brand: "W",          imageUrl: U("1617627143750-d86bc21e42bb") },

  // OUTERWEAR
  { name: "Black Leather Jacket",      category: "outerwear", type: "jacket",   color: "black", purchasePrice: 12999, size: "M", brand: "Zara",           imageUrl: U("1551028719-00167b16eac5") },
  { name: "Camel Trench Coat",         category: "outerwear", type: "coat",     color: "beige", purchasePrice: 15999, size: "M", brand: "Mango",          imageUrl: U("1539533018447-63fcce2678e3") },
  { name: "Navy Blazer",               category: "outerwear", type: "blazer",   color: "navy",  purchasePrice: 8999,  size: "M", brand: "Van Heusen",     imageUrl: U("1507679799987-c73779587ccf") },
  { name: "Denim Jacket",              category: "outerwear", type: "jacket",   color: "blue",  purchasePrice: 5999,  size: "M", brand: "Levis",          imageUrl: U("1523205771623-e0faa4d2813d") },
  { name: "White Blazer",              category: "outerwear", type: "blazer",   color: "white", purchasePrice: 7999,  size: "M", brand: "Zara",           imageUrl: U("1593030761757-71fae45fa0e7") },
  { name: "Burgundy Cardigan",         category: "outerwear", type: "cardigan", color: "burgundy",purchasePrice: 4999,size: "M", brand: "Mango",          imageUrl: U("1434389677669-e08b4cac3105") },

  // SHOES
  { name: "White Sneakers",            category: "shoes", type: "sneakers",     color: "white", purchasePrice: 7999, size: "M", brand: "Nike",            imageUrl: U("1542291026-7eec264c27ff") },
  { name: "Black Ankle Boots",         category: "shoes", type: "boots",        color: "black", purchasePrice: 9999, size: "M", brand: "Zara",            imageUrl: U("1543163521-1bf539c55dd2") },
  { name: "Nude Block Heels",          category: "shoes", type: "heels",        color: "beige", purchasePrice: 5999, size: "M", brand: "Steve Madden",    imageUrl: U("1515347619252-60a4bf4fff4f") },
  { name: "Gold Strappy Sandals",      category: "shoes", type: "sandals",      color: "gold",  purchasePrice: 4999, size: "M", brand: "Aldo",            imageUrl: U("1603487742131-4160ec999306") },
  { name: "Black Ballet Flats",        category: "shoes", type: "ballet-flats", color: "black", purchasePrice: 3999, size: "M", brand: "Mango",           imageUrl: U("1560343090-f0409e92791a") },
  { name: "Red Stilettos",             category: "shoes", type: "stilettos",    color: "red",   purchasePrice: 8999, size: "M", brand: "Steve Madden",    imageUrl: U("1518049362265-d5b2a6467637") },
  { name: "White Slip-On Sneakers",    category: "shoes", type: "sneakers",     color: "white", purchasePrice: 4999, size: "M", brand: "Vans",            imageUrl: U("1525966222134-fcfa99b8ae77") },

  // ACCESSORIES
  { name: "Black Leather Handbag",     category: "accessory", type: "handbag",  color: "black",     purchasePrice: 8999,  size: "Free size", brand: "Zara",              imageUrl: U("1548036328-c9fa89d128fa") },
  { name: "Tan Tote Bag",              category: "accessory", type: "bag",      color: "brown",     purchasePrice: 6999,  size: "Free size", brand: "Mango",             imageUrl: U("1590874103328-eac38a683ce7") },
  { name: "Gold Statement Necklace",   category: "accessory", type: "jewelry",  color: "gold",      purchasePrice: 3999,  size: "Free size", brand: "Accessorize",       imageUrl: U("1599643478518-a784e5dc4c8f") },
  { name: "Black Leather Belt",        category: "accessory", type: "belt",     color: "black",     purchasePrice: 2499,  size: "M",         brand: "Zara",              imageUrl: U("1553062407-98eeb64c6a62") },
  { name: "Rose Gold Watch",           category: "accessory", type: "watch",    color: "rose-gold", purchasePrice: 12999, size: "Free size", brand: "Daniel Wellington", imageUrl: U("1523275335684-37898b6baf30") },
  { name: "Beige Clutch Bag",          category: "accessory", type: "clutch",   color: "beige",     purchasePrice: 4999,  size: "Free size", brand: "Aldo",              imageUrl: U("1566150905458-1bf1fc113f0d") },
  { name: "Silver Hoop Earrings",      category: "accessory", type: "jewelry",  color: "silver",    purchasePrice: 1999,  size: "Free size", brand: "Accessorize",       imageUrl: U("1535632066927-ab7c9ab60908") },
  { name: "Brown Sling Bag",           category: "accessory", type: "bag",      color: "brown",     purchasePrice: 4499,  size: "Free size", brand: "Mango",             imageUrl: U("1584917865442-de89df76afd3") },
];

export const MALE_ITEMS = [
  // TOPS
  { name: "White Crew Neck T-Shirt",   category: "top", type: "t-shirt", color: "white",  purchasePrice: 1299, size: "M", brand: "H&M",        imageUrl: U("1521572163474-6864f9cf17ab") },
  { name: "Black Graphic T-Shirt",     category: "top", type: "t-shirt", color: "black",  purchasePrice: 1499, size: "M", brand: "Zara",       imageUrl: U("1583743814966-8936f5b7be1a") },
  { name: "Navy Blue Polo Shirt",      category: "top", type: "polo",    color: "navy",   purchasePrice: 2299, size: "M", brand: "Lacoste",    imageUrl: U("1571945153237-4929e783af4a") },
  { name: "Light Blue Oxford Shirt",   category: "top", type: "shirt",   color: "blue",   purchasePrice: 2999, size: "M", brand: "Arrow",      imageUrl: U("1602810318383-e386cc2a3ccf") },
  { name: "White Formal Shirt",        category: "top", type: "shirt",   color: "white",  purchasePrice: 2499, size: "M", brand: "Van Heusen", imageUrl: U("1596755094514-f87e34085b2c") },
  { name: "Grey Marl Hoodie",          category: "top", type: "hoodie",  color: "gray",   purchasePrice: 3999, size: "L", brand: "Nike",       imageUrl: U("1556821840-3a63f15732ce") },
  { name: "Black Zip Hoodie",          category: "top", type: "hoodie",  color: "black",  purchasePrice: 4499, size: "M", brand: "Adidas",     imageUrl: U("1509942774463-acf339cf87d5") },
  { name: "Cream Knit Sweater",        category: "top", type: "sweater", color: "cream",  purchasePrice: 5999, size: "M", brand: "Mango",      imageUrl: U("1576566588028-4147f3842f27") },
  { name: "Burgundy Turtleneck",       category: "top", type: "sweater", color: "burgundy",purchasePrice: 4999,size: "M", brand: "Zara",       imageUrl: U("1608744882201-52a7f7f3dd60") },
  { name: "Olive Green Shirt",         category: "top", type: "shirt",   color: "olive",  purchasePrice: 2199, size: "M", brand: "H&M",        imageUrl: U("1598033129183-c4f50c736f10") },

  // BOTTOMS
  { name: "Blue Slim Fit Jeans",       category: "bottom", type: "jeans",    color: "blue",  purchasePrice: 3999, size: "M", brand: "Levis",       imageUrl: U("1542272604-787c3835535d") },
  { name: "Black Skinny Jeans",        category: "bottom", type: "jeans",    color: "black", purchasePrice: 4499, size: "M", brand: "Zara",        imageUrl: U("1541099649105-f69ad21f3246") },
  { name: "Beige Chinos",              category: "bottom", type: "chinos",   color: "beige", purchasePrice: 3299, size: "M", brand: "Marks & Spencer",imageUrl: U("1473966968600-fa801b869a1a") },
  { name: "Navy Formal Trousers",      category: "bottom", type: "trousers", color: "navy",  purchasePrice: 4999, size: "M", brand: "Van Heusen",  imageUrl: U("1560243563-062bfc001d68") },
  { name: "Black Formal Trousers",     category: "bottom", type: "trousers", color: "black", purchasePrice: 4499, size: "M", brand: "Arrow",       imageUrl: U("1624378439575-d8705ad7ae80") },
  { name: "Grey Joggers",              category: "bottom", type: "joggers",  color: "gray",  purchasePrice: 2499, size: "L", brand: "Adidas",      imageUrl: U("1552902865-b72c031ac5ea") },
  { name: "Olive Cargo Pants",         category: "bottom", type: "trousers", color: "olive", purchasePrice: 3999, size: "M", brand: "H&M",         imageUrl: U("1517445312882-bc9910d016b7") },
  { name: "Brown Corduroy Pants",      category: "bottom", type: "trousers", color: "brown", purchasePrice: 3999, size: "M", brand: "H&M",         imageUrl: U("1548883354-94bcfe321cbb") },

  // OUTERWEAR
  { name: "Black Leather Jacket",      category: "outerwear", type: "jacket",  color: "black", purchasePrice: 12999, size: "M", brand: "Zara",       imageUrl: U("1551028719-00167b16eac5") },
  { name: "Camel Trench Coat",         category: "outerwear", type: "coat",    color: "beige", purchasePrice: 15999, size: "M", brand: "Mango",      imageUrl: U("1539533018447-63fcce2678e3") },
  { name: "Navy Blazer",               category: "outerwear", type: "blazer",  color: "navy",  purchasePrice: 8999,  size: "M", brand: "Van Heusen", imageUrl: U("1507679799987-c73779587ccf") },
  { name: "Grey Wool Coat",            category: "outerwear", type: "coat",    color: "gray",  purchasePrice: 18999, size: "M", brand: "Marks & Spencer",imageUrl: U("1548624313-0396c75e4b1a") },
  { name: "Denim Jacket",              category: "outerwear", type: "jacket",  color: "blue",  purchasePrice: 5999,  size: "M", brand: "Levis",      imageUrl: U("1523205771623-e0faa4d2813d") },
  { name: "Black Formal Blazer",       category: "outerwear", type: "blazer",  color: "black", purchasePrice: 9999,  size: "M", brand: "Arrow",      imageUrl: U("1593030761757-71fae45fa0e7") },

  // SHOES
  { name: "White Sneakers",            category: "shoes", type: "sneakers", color: "white", purchasePrice: 7999, size: "M", brand: "Nike",         imageUrl: U("1542291026-7eec264c27ff") },
  { name: "Black Leather Boots",       category: "shoes", type: "boots",    color: "black", purchasePrice: 9999, size: "M", brand: "Clarks",       imageUrl: U("1543163521-1bf539c55dd2") },
  { name: "Brown Loafers",             category: "shoes", type: "loafers",  color: "brown", purchasePrice: 6999, size: "M", brand: "Clarks",       imageUrl: U("1614252235316-8c857d38b5f4") },
  { name: "White Slip-On Sneakers",    category: "shoes", type: "sneakers", color: "white", purchasePrice: 4999, size: "M", brand: "Vans",         imageUrl: U("1525966222134-fcfa99b8ae77") },
  { name: "Black Oxford Shoes",        category: "shoes", type: "loafers",  color: "black", purchasePrice: 8999, size: "M", brand: "Clarks",       imageUrl: U("1560343090-f0409e92791a") },

  // ACCESSORIES
  { name: "Black Leather Backpack",    category: "accessory", type: "backpack", color: "black",     purchasePrice: 5999,  size: "Free size", brand: "Wildcraft",         imageUrl: U("1553062407-98eeb64c6a62") },
  { name: "Brown Leather Wallet",      category: "accessory", type: "bag",      color: "brown",     purchasePrice: 2999,  size: "Free size", brand: "Fossil",            imageUrl: U("1590874103328-eac38a683ce7") },
  { name: "Silver Watch",              category: "accessory", type: "watch",    color: "silver",    purchasePrice: 9999,  size: "Free size", brand: "Titan",             imageUrl: U("1523275335684-37898b6baf30") },
  { name: "Black Leather Belt",        category: "accessory", type: "belt",     color: "black",     purchasePrice: 2499,  size: "M",         brand: "Zara",              imageUrl: U("1553062407-98eeb64c6a62") },
  { name: "Navy Blue Cap",             category: "accessory", type: "hat",      color: "navy",      purchasePrice: 1499,  size: "Free size", brand: "Nike",              imageUrl: U("1534215754734-18e55d13e346") },
];

export const seedWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    // Read user gender from Firestore
    const userSnap = await getDoc(doc(db, "users", userId));
    const gender = userSnap.data()?.preferences?.gender || userSnap.data()?.gender || "female";
    const items = gender === "male" ? MALE_ITEMS : FEMALE_ITEMS;

    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const existing = await getDocs(wardrobeRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));
    await Promise.all(
      items.map(item =>
        addDoc(wardrobeRef, { ...item, wearCount: 0, lastWorn: null, purchaseDate: "2024-01-01", createdAt: serverTimestamp() })
      )
    );
    return { success: true, message: `Added ${items.length} ${gender} wardrobe items!` };
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

// Keep for backward compat
export const SEED_ITEMS = FEMALE_ITEMS;