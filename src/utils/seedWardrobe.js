import { collection, addDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

const HEX = {
  white:"f8f8f8",black:"1a1a1a",navy:"0b1f3a",gray:"6b7280",beige:"d6c6a8",
  brown:"7c4a2d",red:"ef4444",blue:"3b82f6",green:"22c55e",yellow:"f59e0b",
  pink:"ec4899",orange:"f97316",purple:"8b5cf6",maroon:"7f1d1d",teal:"14b8a6",
  mint:"6ee7b7",coral:"ff7875",lavender:"c4b5fd",cream:"fef3c7",gold:"fbbf24",
  silver:"d1d5db","rose-gold":"f9a8d4",olive:"84cc16",burgundy:"991b1b",
  turquoise:"06b6d4",magenta:"d946ef",peach:"fdba74",mustard:"ca8a04",
  rust:"c2410c",emerald:"059669",
};
const fg = (c) => ["black","navy","maroon","burgundy","brown","purple","emerald","rust"].includes(c)?"ffffff":"1a1a1a";
// Unsplash source API — returns best matching photo for the search term
// Biased toward flat-lay/product shots with female clothing keywords
const img = (color, itemName, description) => {
  // Map item names to specific verified Unsplash photo IDs (no models)
  const PHOTO_MAP = {
    "Kanjivaram Silk Saree":       "1610030469983-98e550d6193c",
    "Banarasi Brocade Saree":      "1609357605129-26f69add5d6e",
    "Paithani Silk Saree":         "1583391733956-6c78276477e2",
    "Chanderi Silk Saree":         "1614252235316-8c857d38b5f4",
    "Mysore Silk Saree":           "1617627143750-d86bc21e42bb",
    "Baluchari Silk Saree":        "1609357605129-26f69add5d6e",
    "Tussar Silk Saree":           "1614252235316-8c857d38b5f4",
    "Patola Silk Saree":           "1610030469983-98e550d6193c",
    "Gadwal Silk Saree":           "1617627143750-d86bc21e42bb",
    "Pochampally Ikat Saree":      "1583391733956-6c78276477e2",
    "Cotton Printed Saree":        "1583391733956-6c78276477e2",
    "Chiffon Saree":               "1617627143750-d86bc21e42bb",
    "Georgette Saree":             "1614252235316-8c857d38b5f4",
    "Cotton Tant Saree":           "1610030469983-98e550d6193c",
    "Linen Saree":                 "1614252235316-8c857d38b5f4",
    "Synthetic Silk Saree":        "1609357605129-26f69add5d6e",
    "Khadi Cotton Saree":          "1610030469983-98e550d6193c",
    "Printed Crepe Saree":         "1617627143750-d86bc21e42bb",
    "Handloom Cotton Saree":       "1583391733956-6c78276477e2",
    "Poly Silk Saree":             "1609357605129-26f69add5d6e",
    "Gold Anarkali Gown":          "1617627143750-d86bc21e42bb",
    "Royal Blue Anarkali":         "1609357605129-26f69add5d6e",
    "Pink Sharara Gown":           "1583391733956-6c78276477e2",
    "Maroon Lehenga Gown":         "1609357605129-26f69add5d6e",
    "Teal Gharara Set":            "1614252235316-8c857d38b5f4",
    "Cream Lucknowi Gown":         "1614252235316-8c857d38b5f4",
    "Purple Silk Anarkali":        "1617627143750-d86bc21e42bb",
    "Emerald Green Gown":          "1583391733956-6c78276477e2",
    "Rust Orange Anarkali":        "1617627143750-d86bc21e42bb",
    "Lavender Palazzo Gown":       "1585487000160-6ebcfceb0d03",
    "Black Evening Gown":          "1595777457583-95e059d581b8",
    "Red Cocktail Gown":           "1502716119720-b23a93e5fe1b",
    "Navy Blue Ball Gown":         "1566174053879-31528523f8ae",
    "Rose Gold Sequin Gown":       "1518611012118-696072aa579a",
    "Emerald Satin Gown":          "1539008835657-9e8e9680c956",
    "White Maxi Gown":             "1515372039744-b8f02a3ae446",
    "Burgundy Velvet Gown":        "1550639525-c97d455acf70",
    "Gold Shimmer Gown":           "1612336307429-8a898d10e223",
    "Lavender Tulle Gown":         "1585487000160-6ebcfceb0d03",
    "Coral Off-Shoulder Gown":     "1572804013309-59a88b7e92f1",
    "White Cotton T-Shirt":        "1521572163474-6864f9cf17ab",
    "Black V-Neck T-Shirt":        "1583743814966-8936f5b7be1a",
    "Navy Striped T-Shirt":        "1562157873-818bc0726f68",
    "Blush Pink Crop Top":         "1618354691373-d851c5c3a990",
    "Yellow Crop Top":             "1554568218-0f1715e72254",
    "Lavender Crop Top":           "1620799140408-edc6dcb6d633",
    "White Linen Shirt":           "1596755094514-f87e34085b2c",
    "Light Blue Oxford Shirt":     "1602810318383-e386cc2a3ccf",
    "Beige Oversized Shirt":       "1598033129183-c4f50c736f10",
    "Olive Green Shirt":           "1598033129183-c4f50c736f10",
    "Striped Formal Shirt":        "1602810318383-e386cc2a3ccf",
    "Black Satin Blouse":          "1564257631407-4deb1f99d992",
    "Ivory Silk Blouse":           "1551163943-3f7253a97e52",
    "Coral Floral Blouse":         "1572804013309-59a88b7e92f1",
    "Teal Printed Blouse":         "1485462537746-965f33f7f6a7",
    "Pink Floral Blouse":          "1572804013309-59a88b7e92f1",
    "Mustard Peplum Blouse":       "1564257631407-4deb1f99d992",
    "White Embroidered Blouse":    "1551163943-3f7253a97e52",
    "Grey Marl Hoodie":            "1556821840-3a63f15732ce",
    "Black Zip Hoodie":            "1509942774463-acf339cf87d5",
    "Cream Knit Sweater":          "1576566588028-4147f3842f27",
    "Burgundy Turtleneck":         "1608744882201-52a7f7f3dd60",
    "Lavender Crop Sweater":       "1620799140408-edc6dcb6d633",
    "Brown Knit Sweater":          "1576566588028-4147f3842f27",
    "Mustard Knit Sweater":        "1576566588028-4147f3842f27",
    "White Camisole":              "1503342217505-b0a15ec3261c",
    "Black Camisole":              "1503342217505-b0a15ec3261c",
    "Nude Camisole":               "1503342217505-b0a15ec3261c",
    "Olive Green Tank Top":        "1503341504253-dff4815485f1",
    "White Tank Top":              "1503341504253-dff4815485f1",
    "Black Bodysuit":              "1618354691438-25bc04584c23",
    "White Bodysuit":              "1618354691438-25bc04584c23",
    "Red Polo Shirt":              "1571945153237-4929e783af4a",
    "Navy Polo Shirt":             "1571945153237-4929e783af4a",
    "Blue Skinny Jeans":           "1542272604-787c3835535d",
    "Black Slim Jeans":            "1541099649105-f69ad21f3246",
    "White Wide Leg Jeans":        "1594938298603-c8148c4b4357",
    "Denim Mini Skirt":            "1583496661160-fb5886a0aaaa",
    "Black Midi Skirt":            "1577900232427-18219b9166a0",
    "Pink Pleated Skirt":          "1572804013427-4d7ca7268217",
    "Mustard Midi Skirt":          "1572804013427-4d7ca7268217",
    "Emerald Satin Skirt":         "1577900232427-18219b9166a0",
    "Beige Chinos":                "1473966968600-fa801b869a1a",
    "Black Leggings":              "1506629082955-511b1aa562c8",
    "Navy Palazzo Pants":          "1509631179647-0177331693ae",
    "Teal Palazzo":                "1509631179647-0177331693ae",
    "Grey Joggers":                "1552902865-b72c031ac5ea",
    "Navy Formal Trousers":        "1560243563-062bfc001d68",
    "Black Formal Trousers":       "1624378439575-d8705ad7ae80",
    "Cream Linen Trousers":        "1594938298603-c8148c4b4357",
    "Burgundy Culottes":           "1509631179647-0177331693ae",
    "Rust Flared Trousers":        "1594938298603-c8148c4b4357",
    "Olive Cargo Pants":           "1517445312882-bc9910d016b7",
    "White Shorts":                "1594938298603-c8148c4b4357",
    "Black Leather Jacket":        "1551028719-00167b16eac5",
    "Camel Trench Coat":           "1539533018447-63fcce2678e3",
    "Navy Blazer":                 "1507679799987-c73779587ccf",
    "White Blazer":                "1593030761757-71fae45fa0e7",
    "Denim Jacket":                "1523205771623-e0faa4d2813d",
    "Burgundy Cardigan":           "1434389677669-e08b4cac3105",
    "Cream Shawl":                 "1434389677669-e08b4cac3105",
    "Gold Dupatta Shawl":          "1434389677669-e08b4cac3105",
    "White Sneakers":              "1542291026-7eec264c27ff",
    "Black Ankle Boots":           "1543163521-1bf539c55dd2",
    "Nude Block Heels":            "1515347619252-60a4bf4fff4f",
    "Gold Strappy Sandals":        "1603487742131-4160ec999306",
    "Black Ballet Flats":          "1560343090-f0409e92791a",
    "Red Stilettos":               "1518049362265-d5b2a6467637",
    "Black Leather Handbag":       "1548036328-c9fa89d128fa",
    "Tan Tote Bag":                "1590874103328-eac38a683ce7",
    "Gold Statement Necklace":     "1599643478518-a784e5dc4c8f",
    "Rose Gold Watch":             "1523275335684-37898b6baf30",
    "Silver Hoop Earrings":        "1535632066927-ab7c9ab60908",
    "Beige Clutch Bag":            "1566150905458-1bf1fc113f0d",
  };
  const photoId = PHOTO_MAP[itemName];
  if (photoId) {
    return `https://images.unsplash.com/photo-${photoId}?w=400&h=500&fit=crop&q=80`;
  }
  // Fallback: color placeholder
  const bg = HEX[color] || "e5e7eb";
  return `https://placehold.co/400x500/${bg}/${fg(color)}?text=${encodeURIComponent(itemName)}`;
};

// ── 10 PREMIUM SAREES (₹5,000 – ₹1,50,000) ──────────────────────────────
const PREMIUM_SAREES = [
  { name:"Kanjivaram Silk Saree",      color:"red",      purchasePrice:45000, brand:"Nalli",       description:"Heavy Kanjivaram silk with gold zari border. For weddings & grand occasions." },
  { name:"Banarasi Brocade Saree",     color:"maroon",   purchasePrice:35000, brand:"Fabindia",    description:"Rich Banarasi brocade with intricate weave. Perfect for festive celebrations." },
  { name:"Paithani Silk Saree",        color:"green",    purchasePrice:28000, brand:"Paithani Art",description:"Traditional Paithani with peacock motifs. Ideal for Maharashtrian weddings." },
  { name:"Chanderi Silk Saree",        color:"gold",     purchasePrice:18000, brand:"Fabindia",    description:"Lightweight Chanderi silk with delicate zari. Great for formal events." },
  { name:"Mysore Silk Saree",          color:"purple",   purchasePrice:22000, brand:"Karnataka Silk",description:"Pure Mysore silk with golden border. Elegant for cultural events." },
  { name:"Baluchari Silk Saree",       color:"navy",     purchasePrice:32000, brand:"Biswa Bangla",description:"Intricate Baluchari weave with mythological motifs. For special occasions." },
  { name:"Tussar Silk Saree",          color:"beige",    purchasePrice:12000, brand:"Fabindia",    description:"Natural Tussar silk with tribal embroidery. Versatile for parties & events." },
  { name:"Patola Silk Saree",          color:"teal",     purchasePrice:55000, brand:"Patan Patola",description:"Double ikat Patola weave. Heirloom quality for weddings." },
  { name:"Gadwal Silk Saree",          color:"coral",    purchasePrice:15000, brand:"Gadwal Weavers",description:"Gadwal cotton-silk blend with zari border. For formal occasions." },
  { name:"Pochampally Ikat Saree",     color:"burgundy", purchasePrice:8500,  brand:"Pochampally",  description:"Geometric ikat pattern. Suitable for office & semi-formal events." },
];

// ── 10 EVERYDAY SAREES (under ₹2,000) ────────────────────────────────────
const EVERYDAY_SAREES = [
  { name:"Cotton Printed Saree",       color:"pink",     purchasePrice:799,  brand:"Fabindia",    description:"Soft cotton with floral print. Comfortable for daily wear & casual outings." },
  { name:"Chiffon Saree",              color:"lavender", purchasePrice:999,  brand:"Meena Bazaar",description:"Lightweight chiffon. Easy to drape for office & casual occasions." },
  { name:"Georgette Saree",            color:"teal",     purchasePrice:1299, brand:"Biba",        description:"Flowy georgette with simple border. Everyday office wear." },
  { name:"Cotton Tant Saree",          color:"white",    purchasePrice:650,  brand:"Handloom",    description:"Breathable cotton tant. Perfect for summer daily wear." },
  { name:"Linen Saree",                color:"beige",    purchasePrice:1499, brand:"Fabindia",    description:"Crisp linen saree. Ideal for office & casual meetings." },
  { name:"Synthetic Silk Saree",       color:"blue",     purchasePrice:599,  brand:"Meena Bazaar",description:"Affordable silk-like finish. Good for casual functions." },
  { name:"Khadi Cotton Saree",         color:"cream",    purchasePrice:899,  brand:"Khadi India", description:"Handspun khadi cotton. Comfortable for everyday use." },
  { name:"Printed Crepe Saree",        color:"coral",    purchasePrice:1199, brand:"Biba",        description:"Vibrant crepe with digital print. Casual parties & outings." },
  { name:"Handloom Cotton Saree",      color:"mustard",  purchasePrice:1099, brand:"Handloom",    description:"Traditional handloom weave. Daily wear & casual occasions." },
  { name:"Poly Silk Saree",            color:"maroon",   purchasePrice:749,  brand:"Meena Bazaar",description:"Budget-friendly poly silk. Festive casual occasions." },
];

// ── 20 GOWNS (Traditional + Party) ──────────────────────────────────────
const GOWNS = [
  // Traditional gowns / anarkalis
  { name:"Gold Anarkali Gown",         category:"traditional", type:"anarkali",    color:"gold",     purchasePrice:12000, brand:"Biba",        description:"Floor-length Anarkali with gold embroidery. For weddings & sangeet." },
  { name:"Royal Blue Anarkali",        category:"traditional", type:"anarkali",    color:"navy",     purchasePrice:8999,  brand:"W",           description:"Regal blue Anarkali with silver work. Festive & formal occasions." },
  { name:"Pink Sharara Gown",          category:"traditional", type:"sharara",     color:"pink",     purchasePrice:15000, brand:"Ritu Kumar",  description:"Flared sharara with embroidered top. Perfect for mehndi & sangeet." },
  { name:"Maroon Lehenga Gown",        category:"traditional", type:"lehenga",     color:"maroon",   purchasePrice:22000, brand:"Sabyasachi",  description:"Lehenga-style gown with heavy embroidery. Wedding & reception wear." },
  { name:"Teal Gharara Set",           category:"traditional", type:"gharara",     color:"teal",     purchasePrice:18000, brand:"Ritu Kumar",  description:"Traditional gharara with mirror work. Festive & cultural events." },
  { name:"Cream Lucknowi Gown",        category:"traditional", type:"anarkali",    color:"cream",    purchasePrice:9500,  brand:"Fabindia",    description:"Chikankari embroidered gown. Elegant for Eid & formal occasions." },
  { name:"Purple Silk Anarkali",       category:"traditional", type:"anarkali",    color:"purple",   purchasePrice:11000, brand:"Biba",        description:"Silk Anarkali with sequin work. Diwali & festive celebrations." },
  { name:"Emerald Green Gown",         category:"traditional", type:"anarkali",    color:"emerald",  purchasePrice:16000, brand:"Ritu Kumar",  description:"Emerald silk gown with zardozi work. Grand occasions & weddings." },
  { name:"Rust Orange Anarkali",       category:"traditional", type:"anarkali",    color:"rust",     purchasePrice:7500,  brand:"W",           description:"Earthy rust Anarkali with block print. Casual festive occasions." },
  { name:"Lavender Palazzo Gown",      category:"traditional", type:"anarkali",    color:"lavender", purchasePrice:6999,  brand:"Biba",        description:"Flowy palazzo-style gown. Comfortable for family gatherings." },
  // Party / Western gowns
  { name:"Black Evening Gown",         category:"dress",       type:"evening-gown",color:"black",    purchasePrice:18999, brand:"Ritu Kumar",  description:"Sleek black evening gown. Perfect for galas & formal parties." },
  { name:"Red Cocktail Gown",          category:"dress",       type:"cocktail-dress",color:"red",    purchasePrice:9999,  brand:"AND",         description:"Bold red cocktail dress. For parties & date nights." },
  { name:"Navy Blue Ball Gown",        category:"dress",       type:"evening-gown",color:"navy",     purchasePrice:25000, brand:"Ritu Kumar",  description:"Voluminous ball gown. For proms, galas & grand events." },
  { name:"Rose Gold Sequin Gown",      category:"dress",       type:"evening-gown",color:"rose-gold",purchasePrice:14999, brand:"AND",         description:"Shimmering sequin gown. New Year parties & celebrations." },
  { name:"Emerald Satin Gown",         category:"dress",       type:"evening-gown",color:"emerald",  purchasePrice:12000, brand:"Mango",       description:"Satin finish gown with slit. Cocktail parties & events." },
  { name:"White Maxi Gown",            category:"dress",       type:"maxi-dress",  color:"white",    purchasePrice:7999,  brand:"Zara",        description:"Flowy white maxi gown. Beach weddings & summer parties." },
  { name:"Burgundy Velvet Gown",       category:"dress",       type:"formal-dress",color:"burgundy", purchasePrice:16000, brand:"Ritu Kumar",  description:"Rich velvet gown. Winter parties & formal dinners." },
  { name:"Gold Shimmer Gown",          category:"dress",       type:"evening-gown",color:"gold",     purchasePrice:11000, brand:"AND",         description:"Gold shimmer fabric. Award nights & grand celebrations." },
  { name:"Lavender Tulle Gown",        category:"dress",       type:"evening-gown",color:"lavender", purchasePrice:8500,  brand:"Zara",        description:"Dreamy tulle gown. Engagement parties & romantic occasions." },
  { name:"Coral Off-Shoulder Gown",    category:"dress",       type:"cocktail-dress",color:"coral",  purchasePrice:6999,  brand:"H&M",         description:"Off-shoulder coral gown. Casual parties & beach events." },
];

// ── 50 TOPS (all female, no models) ──────────────────────────────────────
const TOPS = [
  { name:"White Cotton T-Shirt",       type:"t-shirt",  color:"white",    purchasePrice:1299,  brand:"H&M",         description:"Classic white tee. Everyday casual wear." },
  { name:"Black V-Neck T-Shirt",       type:"t-shirt",  color:"black",    purchasePrice:1499,  brand:"Zara",        description:"Versatile black V-neck. Casual & smart casual." },
  { name:"Navy Striped T-Shirt",       type:"t-shirt",  color:"navy",     purchasePrice:1599,  brand:"M&S",         description:"Classic stripes. Casual outings & brunch." },
  { name:"Blush Pink Crop Top",        type:"crop-top", color:"pink",     purchasePrice:1899,  brand:"Zara",        description:"Trendy crop top. Casual & party wear." },
  { name:"Yellow Crop Top",            type:"crop-top", color:"yellow",   purchasePrice:1599,  brand:"H&M",         description:"Bright yellow crop. Summer casual wear." },
  { name:"Lavender Crop Top",          type:"crop-top", color:"lavender", purchasePrice:1799,  brand:"Zara",        description:"Soft lavender crop. Casual & brunch." },
  { name:"White Linen Shirt",          type:"shirt",    color:"white",    purchasePrice:2499,  brand:"Fabindia",    description:"Breathable linen. Office & smart casual." },
  { name:"Light Blue Oxford Shirt",    type:"shirt",    color:"blue",     purchasePrice:2999,  brand:"Arrow",       description:"Classic Oxford. Office & formal occasions." },
  { name:"Beige Oversized Shirt",      type:"shirt",    color:"beige",    purchasePrice:2199,  brand:"H&M",         description:"Relaxed oversized fit. Casual & travel." },
  { name:"Olive Green Shirt",          type:"shirt",    color:"olive",    purchasePrice:2299,  brand:"H&M",         description:"Earthy olive. Casual & outdoor wear." },
  { name:"Striped Formal Shirt",       type:"shirt",    color:"navy",     purchasePrice:2799,  brand:"Van Heusen",  description:"Pinstripe formal shirt. Office wear." },
  { name:"Black Satin Blouse",         type:"blouse",   color:"black",    purchasePrice:3499,  brand:"Zara",        description:"Elegant satin. Parties & formal dinners." },
  { name:"Ivory Silk Blouse",          type:"blouse",   color:"cream",    purchasePrice:4999,  brand:"AND",         description:"Luxe silk blouse. Office & formal events." },
  { name:"Coral Floral Blouse",        type:"blouse",   color:"coral",    purchasePrice:2799,  brand:"Global Desi", description:"Floral print. Casual & festive occasions." },
  { name:"Teal Printed Blouse",        type:"blouse",   color:"teal",     purchasePrice:2599,  brand:"W",           description:"Vibrant teal print. Office & casual." },
  { name:"Pink Floral Blouse",         type:"blouse",   color:"pink",     purchasePrice:2199,  brand:"Global Desi", description:"Feminine floral. Casual & brunch." },
  { name:"Mustard Peplum Blouse",      type:"blouse",   color:"mustard",  purchasePrice:2999,  brand:"AND",         description:"Peplum silhouette. Office & parties." },
  { name:"White Embroidered Blouse",   type:"blouse",   color:"white",    purchasePrice:3299,  brand:"Fabindia",    description:"Chikankari embroidery. Festive & casual." },
  { name:"Grey Marl Hoodie",           type:"hoodie",   color:"gray",     purchasePrice:3999,  brand:"Nike",        description:"Cosy hoodie. Casual & gym wear." },
  { name:"Black Zip Hoodie",           type:"hoodie",   color:"black",    purchasePrice:4499,  brand:"Adidas",      description:"Zip-up hoodie. Casual & sporty." },
  { name:"Cream Knit Sweater",         type:"sweater",  color:"cream",    purchasePrice:5999,  brand:"Mango",       description:"Soft knit. Casual & winter wear." },
  { name:"Burgundy Turtleneck",        type:"sweater",  color:"burgundy", purchasePrice:4999,  brand:"Zara",        description:"Classic turtleneck. Winter & smart casual." },
  { name:"Lavender Crop Sweater",      type:"sweater",  color:"lavender", purchasePrice:3499,  brand:"Mango",       description:"Cropped knit. Casual & trendy." },
  { name:"Brown Knit Sweater",         type:"sweater",  color:"brown",    purchasePrice:4499,  brand:"Mango",       description:"Earthy brown knit. Casual & cosy." },
  { name:"Mustard Knit Sweater",       type:"sweater",  color:"mustard",  purchasePrice:3999,  brand:"H&M",         description:"Bold mustard. Casual & autumn wear." },
  { name:"White Camisole",             type:"camisole", color:"white",    purchasePrice:999,   brand:"H&M",         description:"Basic camisole. Layering & casual." },
  { name:"Black Camisole",             type:"camisole", color:"black",    purchasePrice:999,   brand:"H&M",         description:"Versatile black cami. Layering & casual." },
  { name:"Nude Camisole",              type:"camisole", color:"beige",    purchasePrice:1099,  brand:"Zara",        description:"Nude cami. Layering under blazers." },
  { name:"Olive Green Tank Top",       type:"tank",     color:"olive",    purchasePrice:1199,  brand:"H&M",         description:"Casual tank. Gym & outdoor wear." },
  { name:"White Tank Top",             type:"tank",     color:"white",    purchasePrice:999,   brand:"H&M",         description:"Basic white tank. Gym & casual." },
  { name:"Black Bodysuit",             type:"bodysuit", color:"black",    purchasePrice:2499,  brand:"Zara",        description:"Sleek bodysuit. Parties & smart casual." },
  { name:"White Bodysuit",             type:"bodysuit", color:"white",    purchasePrice:2299,  brand:"Zara",        description:"Clean white bodysuit. Smart casual & office." },
  { name:"Red Polo Shirt",             type:"polo",     color:"red",      purchasePrice:2299,  brand:"Lacoste",     description:"Classic polo. Casual & sporty." },
  { name:"Navy Polo Shirt",            type:"polo",     color:"navy",     purchasePrice:2499,  brand:"Lacoste",     description:"Navy polo. Smart casual & sports." },
  { name:"Peach Puff Sleeve Top",      type:"blouse",   color:"peach",    purchasePrice:2799,  brand:"Zara",        description:"Trendy puff sleeves. Casual & parties." },
  { name:"Rust Wrap Top",              type:"blouse",   color:"rust",     purchasePrice:2599,  brand:"AND",         description:"Wrap style. Casual & smart casual." },
  { name:"Emerald Silk Top",           type:"blouse",   color:"emerald",  purchasePrice:3999,  brand:"Mango",       description:"Luxe silk. Parties & formal dinners." },
  { name:"Magenta Printed Top",        type:"blouse",   color:"magenta",  purchasePrice:1999,  brand:"Global Desi", description:"Bold magenta print. Casual & festive." },
  { name:"Turquoise Embroidered Top",  type:"blouse",   color:"turquoise",purchasePrice:2799,  brand:"Fabindia",    description:"Embroidered detail. Festive & casual." },
  { name:"Gold Sequin Top",            type:"blouse",   color:"gold",     purchasePrice:3499,  brand:"AND",         description:"Sequin party top. New Year & celebrations." },
  { name:"Silver Metallic Top",        type:"blouse",   color:"silver",   purchasePrice:3299,  brand:"Zara",        description:"Metallic finish. Parties & events." },
  { name:"Beige Linen Top",            type:"shirt",    color:"beige",    purchasePrice:1999,  brand:"Fabindia",    description:"Breathable linen. Summer casual." },
  { name:"Pink Ruffle Blouse",         type:"blouse",   color:"pink",     purchasePrice:2999,  brand:"Zara",        description:"Ruffle detail. Romantic & casual occasions." },
  { name:"Black Lace Top",             type:"blouse",   color:"black",    purchasePrice:3199,  brand:"Mango",       description:"Delicate lace. Parties & date nights." },
  { name:"White Broderie Top",         type:"blouse",   color:"white",    purchasePrice:2799,  brand:"H&M",         description:"Broderie anglaise. Summer & casual." },
  { name:"Coral Smocked Top",          type:"blouse",   color:"coral",    purchasePrice:2299,  brand:"Zara",        description:"Smocked waist. Casual & beach wear." },
  { name:"Navy Striped Blouse",        type:"blouse",   color:"navy",     purchasePrice:2499,  brand:"M&S",         description:"Classic stripes. Office & casual." },
  { name:"Lavender Tie-Front Top",     type:"blouse",   color:"lavender", purchasePrice:2199,  brand:"H&M",         description:"Tie-front detail. Casual & brunch." },
  { name:"Cream Peasant Top",          type:"blouse",   color:"cream",    purchasePrice:1999,  brand:"Fabindia",    description:"Boho peasant style. Casual & festive." },
  { name:"Teal Cold Shoulder Top",     type:"blouse",   color:"teal",     purchasePrice:2599,  brand:"AND",         description:"Cold shoulder cut. Parties & casual." },
];

// ── 20 BOTTOMS ────────────────────────────────────────────────────────────
const BOTTOMS = [
  { name:"Blue Skinny Jeans",          type:"jeans",    color:"blue",     purchasePrice:3999,  brand:"Levis",       description:"Classic skinny jeans. Everyday casual wear." },
  { name:"Black Slim Jeans",           type:"jeans",    color:"black",    purchasePrice:4499,  brand:"Zara",        description:"Versatile black jeans. Casual & smart casual." },
  { name:"White Wide Leg Jeans",       type:"jeans",    color:"white",    purchasePrice:3999,  brand:"H&M",         description:"Trendy wide leg. Casual & brunch." },
  { name:"Denim Mini Skirt",           type:"skirt",    color:"blue",     purchasePrice:2999,  brand:"Zara",        description:"Classic denim mini. Casual & parties." },
  { name:"Black Midi Skirt",           type:"skirt",    color:"black",    purchasePrice:3499,  brand:"Mango",       description:"Elegant midi length. Office & smart casual." },
  { name:"Pink Pleated Skirt",         type:"skirt",    color:"pink",     purchasePrice:2999,  brand:"Zara",        description:"Flirty pleated skirt. Casual & parties." },
  { name:"Mustard Midi Skirt",         type:"skirt",    color:"mustard",  purchasePrice:3299,  brand:"H&M",         description:"Bold mustard midi. Casual & autumn." },
  { name:"Emerald Satin Skirt",        type:"skirt",    color:"emerald",  purchasePrice:4499,  brand:"Mango",       description:"Luxe satin midi. Parties & events." },
  { name:"Beige Chinos",               type:"chinos",   color:"beige",    purchasePrice:3299,  brand:"M&S",         description:"Smart chinos. Office & smart casual." },
  { name:"Black Leggings",             type:"leggings", color:"black",    purchasePrice:1499,  brand:"Nike",        description:"Comfortable leggings. Gym & casual." },
  { name:"Navy Palazzo Pants",         type:"palazzo",  color:"navy",     purchasePrice:2499,  brand:"W",           description:"Flowy palazzo. Casual & festive." },
  { name:"Teal Palazzo",               type:"palazzo",  color:"teal",     purchasePrice:2299,  brand:"W",           description:"Vibrant teal palazzo. Casual & festive." },
  { name:"Grey Joggers",               type:"joggers",  color:"gray",     purchasePrice:2499,  brand:"Adidas",      description:"Comfortable joggers. Gym & casual." },
  { name:"Navy Formal Trousers",       type:"trousers", color:"navy",     purchasePrice:4999,  brand:"Van Heusen",  description:"Tailored trousers. Office & formal." },
  { name:"Black Formal Trousers",      type:"trousers", color:"black",    purchasePrice:4499,  brand:"Arrow",       description:"Classic black trousers. Office & formal." },
  { name:"Cream Linen Trousers",       type:"trousers", color:"cream",    purchasePrice:3499,  brand:"Fabindia",    description:"Breathable linen. Summer office wear." },
  { name:"Burgundy Culottes",          type:"culottes", color:"burgundy", purchasePrice:2799,  brand:"AND",         description:"Trendy culottes. Smart casual & office." },
  { name:"Rust Flared Trousers",       type:"trousers", color:"rust",     purchasePrice:3299,  brand:"Zara",        description:"Flared silhouette. Casual & parties." },
  { name:"Olive Cargo Pants",          type:"trousers", color:"olive",    purchasePrice:3999,  brand:"H&M",         description:"Utility cargo. Casual & outdoor." },
  { name:"White Shorts",               type:"shorts",   color:"white",    purchasePrice:1999,  brand:"Zara",        description:"Classic white shorts. Summer casual." },
];

// ── OUTERWEAR ─────────────────────────────────────────────────────────────
const OUTERWEAR = [
  { name:"Black Leather Jacket",  type:"jacket",   color:"black",    purchasePrice:12999, brand:"Zara",       description:"Classic leather jacket. Casual & party wear." },
  { name:"Camel Trench Coat",     type:"coat",     color:"beige",    purchasePrice:15999, brand:"Mango",      description:"Timeless trench. Office & smart casual." },
  { name:"Navy Blazer",           type:"blazer",   color:"navy",     purchasePrice:8999,  brand:"Van Heusen", description:"Structured blazer. Office & formal events." },
  { name:"White Blazer",          type:"blazer",   color:"white",    purchasePrice:7999,  brand:"Zara",       description:"Crisp white blazer. Smart casual & parties." },
  { name:"Denim Jacket",          type:"jacket",   color:"blue",     purchasePrice:5999,  brand:"Levis",      description:"Classic denim. Casual & everyday." },
  { name:"Burgundy Cardigan",     type:"cardigan", color:"burgundy", purchasePrice:4999,  brand:"Mango",      description:"Cosy cardigan. Casual & winter layering." },
  { name:"Cream Shawl",           type:"shawl",    color:"cream",    purchasePrice:2999,  brand:"Fabindia",   description:"Elegant shawl. Traditional & formal layering." },
  { name:"Gold Dupatta Shawl",    type:"shawl",    color:"gold",     purchasePrice:3499,  brand:"Fabindia",   description:"Embroidered shawl. Traditional outfit layering." },
];

// ── SHOES ─────────────────────────────────────────────────────────────────
const SHOES = [
  { name:"White Sneakers",        type:"sneakers",     color:"white", purchasePrice:7999,  brand:"Nike",         description:"Classic white sneakers. Casual & everyday." },
  { name:"Black Ankle Boots",     type:"boots",        color:"black", purchasePrice:9999,  brand:"Zara",         description:"Versatile ankle boots. Casual & smart casual." },
  { name:"Nude Block Heels",      type:"heels",        color:"beige", purchasePrice:5999,  brand:"Steve Madden", description:"Comfortable block heels. Office & parties." },
  { name:"Gold Strappy Sandals",  type:"sandals",      color:"gold",  purchasePrice:4999,  brand:"Aldo",         description:"Elegant strappy sandals. Parties & events." },
  { name:"Black Ballet Flats",    type:"ballet-flats", color:"black", purchasePrice:3999,  brand:"Mango",        description:"Classic flats. Office & casual." },
  { name:"Red Stilettos",         type:"stilettos",    color:"red",   purchasePrice:8999,  brand:"Steve Madden", description:"Bold red heels. Parties & date nights." },
];

// ── ACCESSORIES ───────────────────────────────────────────────────────────
const ACCESSORIES = [
  { name:"Black Leather Handbag",   type:"handbag",  color:"black",     purchasePrice:8999,  brand:"Zara",              description:"Classic handbag. Everyday & office." },
  { name:"Tan Tote Bag",            type:"bag",      color:"brown",     purchasePrice:6999,  brand:"Mango",             description:"Spacious tote. Office & casual." },
  { name:"Gold Statement Necklace", type:"jewelry",  color:"gold",      purchasePrice:3999,  brand:"Accessorize",       description:"Bold necklace. Parties & festive occasions." },
  { name:"Rose Gold Watch",         type:"watch",    color:"rose-gold", purchasePrice:12999, brand:"Daniel Wellington", description:"Elegant watch. Everyday & formal." },
  { name:"Silver Hoop Earrings",    type:"jewelry",  color:"silver",    purchasePrice:1999,  brand:"Accessorize",       description:"Classic hoops. Everyday & casual." },
  { name:"Beige Clutch Bag",        type:"clutch",   color:"beige",     purchasePrice:4999,  brand:"Aldo",              description:"Evening clutch. Parties & formal events." },
];

// ── BUILD SEED_ITEMS from all arrays ─────────────────────────────────────
const buildItem = (item, category, type, size = "M") => ({
  name:          item.name,
  category:      item.category || category,
  type:          item.type || type,
  color:         item.color,
  purchasePrice: item.purchasePrice,
  size:          item.size || size,
  brand:         item.brand || null,
  description:   item.description || "",
  imageUrl:      img(item.color, item.name, item.description ? item.description.split(".")[0] : ""),
  wearCount:     0,
  lastWorn:      null,
});

export const FEMALE_ITEMS = [
  ...PREMIUM_SAREES.map(i => buildItem(i, "traditional", "saree", "Free size")),
  ...EVERYDAY_SAREES.map(i => buildItem(i, "traditional", "saree", "Free size")),
  ...GOWNS.map(i => buildItem(i, i.category || "dress", i.type || "evening-gown")),
  ...TOPS.map(i => buildItem(i, "top", i.type)),
  ...BOTTOMS.map(i => buildItem(i, "bottom", i.type)),
  ...OUTERWEAR.map(i => buildItem(i, "outerwear", i.type)),
  ...SHOES.map(i => buildItem(i, "shoes", i.type)),
  ...ACCESSORIES.map(i => buildItem(i, "accessory", i.type, "Free size")),
];

export const seedWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const existing = await getDocs(wardrobeRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));
    await Promise.all(
      FEMALE_ITEMS.map(item =>
        addDoc(wardrobeRef, { ...item, purchaseDate: "2024-01-01", createdAt: serverTimestamp() })
      )
    );
    return { success: true, message: `Added ${FEMALE_ITEMS.length} items to your wardrobe!` };
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
