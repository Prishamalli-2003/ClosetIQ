// Seed script to populate wardrobe with sample data
import { collection, addDoc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

const sampleItems = [
  { name: 'White Cotton T-Shirt', category: 'top', type: 't-shirt', color: 'white', purchasePrice: 1299, size: 'M', brand: 'H&M', purchaseDate: '2024-01-15', imageUrl: 'https://via.placeholder.com/400x400/FFFFFF/000000?text=White+T-Shirt', wearCount: 0, lastWorn: null },
  { name: 'Black V-Neck T-Shirt', category: 'top', type: 't-shirt', color: 'black', purchasePrice: 1499, size: 'L', brand: 'Uniqlo', purchaseDate: '2024-01-20', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+T-Shirt', wearCount: 0, lastWorn: null },
  { name: 'Navy Blue Polo Shirt', category: 'top', type: 'polo', color: 'navy', purchasePrice: 2499, size: 'M', brand: 'Ralph Lauren', purchaseDate: '2024-02-01', imageUrl: 'https://via.placeholder.com/400x400/000080/FFFFFF?text=Navy+Polo', wearCount: 0, lastWorn: null },
  { name: 'Gray Hoodie', category: 'top', type: 'hoodie', color: 'gray', purchasePrice: 2999, size: 'L', brand: 'Nike', purchaseDate: '2024-01-05', imageUrl: 'https://via.placeholder.com/400x400/808080/FFFFFF?text=Gray+Hoodie', wearCount: 0, lastWorn: null },
  { name: 'White Formal Shirt', category: 'top', type: 'shirt', color: 'white', purchasePrice: 2799, size: 'M', brand: 'Arrow', purchaseDate: '2024-01-25', imageUrl: 'https://via.placeholder.com/400x400/FFFFFF/000000?text=White+Shirt', wearCount: 0, lastWorn: null },
  { name: 'Blue Denim Shirt', category: 'top', type: 'shirt', color: 'blue', purchasePrice: 2199, size: 'M', brand: 'Wrangler', purchaseDate: '2024-03-01', imageUrl: 'https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Denim+Shirt', wearCount: 0, lastWorn: null },
  { name: 'Red Checked Shirt', category: 'top', type: 'shirt', color: 'red', purchasePrice: 1899, size: 'L', brand: 'Zara', purchaseDate: '2024-02-15', imageUrl: 'https://via.placeholder.com/400x400/DC143C/FFFFFF?text=Red+Shirt', wearCount: 0, lastWorn: null },
  { name: 'Green Sweater', category: 'top', type: 'sweater', color: 'green', purchasePrice: 3499, size: 'M', brand: 'H&M', purchaseDate: '2023-12-20', imageUrl: 'https://via.placeholder.com/400x400/228B22/FFFFFF?text=Green+Sweater', wearCount: 0, lastWorn: null },
  { name: 'Beige Cardigan', category: 'top', type: 'sweater', color: 'beige', purchasePrice: 3999, size: 'M', brand: 'Mango', purchaseDate: '2024-01-10', imageUrl: 'https://via.placeholder.com/400x400/F5F5DC/000000?text=Beige+Cardigan', wearCount: 0, lastWorn: null },
  { name: 'Yellow Crop Top', category: 'top', type: 'crop-top', color: 'yellow', purchasePrice: 1699, size: 'S', brand: 'Forever 21', purchaseDate: '2024-03-10', imageUrl: 'https://via.placeholder.com/400x400/FFD700/000000?text=Yellow+Crop+Top', wearCount: 0, lastWorn: null },
  { name: 'Pink Blouse', category: 'top', type: 'blouse', color: 'pink', purchasePrice: 2299, size: 'S', brand: 'Zara', purchaseDate: '2024-02-20', imageUrl: 'https://via.placeholder.com/400x400/FFC0CB/000000?text=Pink+Blouse', wearCount: 0, lastWorn: null },
  { name: 'Striped Tank Top', category: 'top', type: 'tank', color: 'multi', purchasePrice: 1299, size: 'S', brand: 'Gap', purchaseDate: '2024-03-05', imageUrl: 'https://via.placeholder.com/400x400/FFFFFF/000000?text=Striped+Tank', wearCount: 0, lastWorn: null },
  { name: 'Black Turtleneck', category: 'top', type: 'sweater', color: 'black', purchasePrice: 2799, size: 'M', brand: 'Uniqlo', purchaseDate: '2023-11-30', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+Turtleneck', wearCount: 0, lastWorn: null },
  { name: 'Maroon Henley Shirt', category: 'top', type: 'shirt', color: 'maroon', purchasePrice: 1999, size: 'L', brand: 'American Eagle', purchaseDate: '2024-01-18', imageUrl: 'https://via.placeholder.com/400x400/800000/FFFFFF?text=Maroon+Henley', wearCount: 0, lastWorn: null },
  { name: 'Olive Green T-Shirt', category: 'top', type: 't-shirt', color: 'olive', purchasePrice: 1399, size: 'M', brand: 'H&M', purchaseDate: '2024-02-28', imageUrl: 'https://via.placeholder.com/400x400/808000/FFFFFF?text=Olive+T-Shirt', wearCount: 0, lastWorn: null },
  { name: 'Blue Denim Jeans', category: 'bottom', type: 'jeans', color: 'blue', purchasePrice: 3999, size: 'L', brand: 'Levis', purchaseDate: '2024-01-20', imageUrl: 'https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Blue+Jeans', wearCount: 0, lastWorn: null },
  { name: 'Black Skinny Jeans', category: 'bottom', type: 'jeans', color: 'black', purchasePrice: 4299, size: 'M', brand: 'Levis', purchaseDate: '2024-02-05', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+Jeans', wearCount: 0, lastWorn: null },
  { name: 'Khaki Chinos', category: 'bottom', type: 'chinos', color: 'beige', purchasePrice: 2999, size: 'L', brand: 'Dockers', purchaseDate: '2024-01-12', imageUrl: 'https://via.placeholder.com/400x400/F0E68C/000000?text=Khaki+Chinos', wearCount: 0, lastWorn: null },
  { name: 'Black Formal Pants', category: 'bottom', type: 'trousers', color: 'black', purchasePrice: 3299, size: 'M', brand: 'Van Heusen', purchaseDate: '2024-02-10', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+Pants', wearCount: 0, lastWorn: null },
  { name: 'Navy Blue Shorts', category: 'bottom', type: 'shorts', color: 'navy', purchasePrice: 1899, size: 'L', brand: 'Nike', purchaseDate: '2024-03-15', imageUrl: 'https://via.placeholder.com/400x400/000080/FFFFFF?text=Navy+Shorts', wearCount: 0, lastWorn: null },
  { name: 'Gray Joggers', category: 'bottom', type: 'joggers', color: 'gray', purchasePrice: 2799, size: 'M', brand: 'Adidas', purchaseDate: '2024-01-08', imageUrl: 'https://via.placeholder.com/400x400/808080/FFFFFF?text=Gray+Joggers', wearCount: 0, lastWorn: null },
  { name: 'Black Palazzo Pants', category: 'bottom', type: 'palazzo', color: 'black', purchasePrice: 1899, size: 'M', brand: 'W', purchaseDate: '2024-02-25', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+Palazzo', wearCount: 0, lastWorn: null },
  { name: 'Blue Denim Skirt', category: 'bottom', type: 'skirt', color: 'blue', purchasePrice: 2499, size: 'S', brand: 'Zara', purchaseDate: '2024-03-01', imageUrl: 'https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Denim+Skirt', wearCount: 0, lastWorn: null },
  { name: 'Black Leggings', category: 'bottom', type: 'leggings', color: 'black', purchasePrice: 1599, size: 'M', brand: 'Puma', purchaseDate: '2024-01-22', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+Leggings', wearCount: 0, lastWorn: null },
  { name: 'White Culottes', category: 'bottom', type: 'culottes', color: 'white', purchasePrice: 2299, size: 'M', brand: 'Mango', purchaseDate: '2024-02-18', imageUrl: 'https://via.placeholder.com/400x400/FFFFFF/000000?text=White+Culottes', wearCount: 0, lastWorn: null },
  { name: 'Beige Cargo Pants', category: 'bottom', type: 'trousers', color: 'beige', purchasePrice: 3799, size: 'L', brand: 'Carhartt', purchaseDate: '2024-01-30', imageUrl: 'https://via.placeholder.com/400x400/F5F5DC/000000?text=Cargo+Pants', wearCount: 0, lastWorn: null },
  { name: 'Plaid Mini Skirt', category: 'bottom', type: 'skirt', color: 'multi', purchasePrice: 2199, size: 'S', brand: 'Forever 21', purchaseDate: '2024-03-08', imageUrl: 'https://via.placeholder.com/400x400/FF69B4/FFFFFF?text=Plaid+Skirt', wearCount: 0, lastWorn: null },
  { name: 'Black Little Dress', category: 'dress', type: 'casual-dress', color: 'black', purchasePrice: 3999, size: 'S', brand: 'Zara', purchaseDate: '2024-01-15', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+Dress', wearCount: 0, lastWorn: null },
  { name: 'Floral Summer Dress', category: 'dress', type: 'casual-dress', color: 'multi', purchasePrice: 3499, size: 'S', brand: 'Forever 21', purchaseDate: '2024-03-15', imageUrl: 'https://via.placeholder.com/400x400/FFB6C1/000000?text=Floral+Dress', wearCount: 0, lastWorn: null },
  { name: 'Navy Midi Dress', category: 'dress', type: 'midi-dress', color: 'navy', purchasePrice: 4599, size: 'M', brand: 'H&M', purchaseDate: '2024-02-08', imageUrl: 'https://via.placeholder.com/400x400/000080/FFFFFF?text=Navy+Midi+Dress', wearCount: 0, lastWorn: null },
  { name: 'Coral Maxi Dress', category: 'dress', type: 'maxi-dress', color: 'coral', purchasePrice: 4999, size: 'M', brand: 'AND', purchaseDate: '2024-02-15', imageUrl: 'https://via.placeholder.com/400x400/FF7F50/FFFFFF?text=Coral+Maxi', wearCount: 0, lastWorn: null },
  { name: 'White Sundress', category: 'dress', type: 'sundress', color: 'white', purchasePrice: 3299, size: 'S', brand: 'Gap', purchaseDate: '2024-03-20', imageUrl: 'https://via.placeholder.com/400x400/FFFFFF/000000?text=White+Sundress', wearCount: 0, lastWorn: null },
  { name: 'Red Cocktail Dress', category: 'dress', type: 'cocktail-dress', color: 'red', purchasePrice: 7999, size: 'S', brand: 'Mango', purchaseDate: '2023-12-28', imageUrl: 'https://via.placeholder.com/400x400/DC143C/FFFFFF?text=Red+Cocktail', wearCount: 0, lastWorn: null },
  { name: 'Pink Evening Gown', category: 'dress', type: 'evening-gown', color: 'pink', purchasePrice: 25000, size: 'S', brand: 'Designer', purchaseDate: '2023-10-20', imageUrl: 'https://via.placeholder.com/400x400/FFC0CB/000000?text=Pink+Gown', wearCount: 0, lastWorn: null },
  { name: 'Green Wrap Dress', category: 'dress', type: 'casual-dress', color: 'green', purchasePrice: 3799, size: 'M', brand: 'Zara', purchaseDate: '2024-02-22', imageUrl: 'https://via.placeholder.com/400x400/228B22/FFFFFF?text=Green+Wrap+Dress', wearCount: 0, lastWorn: null },
  { name: 'Red Silk Saree', category: 'traditional', type: 'saree', color: 'red', purchasePrice: 18500, size: 'Free size', brand: 'Fabindia', purchaseDate: '2023-11-25', imageUrl: 'https://via.placeholder.com/400x400/DC143C/FFFFFF?text=Red+Saree', wearCount: 0, lastWorn: null },
  { name: 'Purple Lehenga', category: 'traditional', type: 'lehenga', color: 'purple', purchasePrice: 35000, size: 'M', brand: 'Sabyasachi', purchaseDate: '2023-09-15', imageUrl: 'https://via.placeholder.com/400x400/800080/FFFFFF?text=Purple+Lehenga', wearCount: 0, lastWorn: null },
  { name: 'Green Kurti', category: 'traditional', type: 'kurti', color: 'green', purchasePrice: 2499, size: 'M', brand: 'Biba', purchaseDate: '2024-02-20', imageUrl: 'https://via.placeholder.com/400x400/228B22/FFFFFF?text=Green+Kurti', wearCount: 0, lastWorn: null },
  { name: 'Blue Anarkali Suit', category: 'traditional', type: 'anarkali', color: 'blue', purchasePrice: 6999, size: 'M', brand: 'W', purchaseDate: '2024-01-18', imageUrl: 'https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Blue+Anarkali', wearCount: 0, lastWorn: null },
  { name: 'Maroon Salwar Kameez', category: 'traditional', type: 'salwar-kameez', color: 'maroon', purchasePrice: 4999, size: 'L', brand: 'Biba', purchaseDate: '2023-12-05', imageUrl: 'https://via.placeholder.com/400x400/800000/FFFFFF?text=Maroon+Salwar', wearCount: 0, lastWorn: null },
  { name: 'Black Leather Jacket', category: 'outerwear', type: 'jacket', color: 'black', purchasePrice: 9999, size: 'L', brand: 'Zara', purchaseDate: '2023-12-10', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Leather+Jacket', wearCount: 0, lastWorn: null },
  { name: 'Navy Blue Blazer', category: 'outerwear', type: 'blazer', color: 'navy', purchasePrice: 6999, size: 'M', brand: 'Raymond', purchaseDate: '2024-02-01', imageUrl: 'https://via.placeholder.com/400x400/000080/FFFFFF?text=Navy+Blazer', wearCount: 0, lastWorn: null },
  { name: 'Beige Trench Coat', category: 'outerwear', type: 'coat', color: 'beige', purchasePrice: 11999, size: 'M', brand: 'Mango', purchaseDate: '2023-12-15', imageUrl: 'https://via.placeholder.com/400x400/F5F5DC/000000?text=Trench+Coat', wearCount: 0, lastWorn: null },
  { name: 'Gray Wool Coat', category: 'outerwear', type: 'coat', color: 'gray', purchasePrice: 13999, size: 'L', brand: 'Zara', purchaseDate: '2023-11-20', imageUrl: 'https://via.placeholder.com/400x400/808080/FFFFFF?text=Wool+Coat', wearCount: 0, lastWorn: null },
  { name: 'Denim Jacket', category: 'outerwear', type: 'jacket', color: 'blue', purchasePrice: 4999, size: 'M', brand: 'Levis', purchaseDate: '2024-01-28', imageUrl: 'https://via.placeholder.com/400x400/4169E1/FFFFFF?text=Denim+Jacket', wearCount: 0, lastWorn: null },
  { name: 'White Sneakers', category: 'shoes', type: 'sneakers', color: 'white', purchasePrice: 5999, size: 'L', brand: 'Adidas', purchaseDate: '2024-01-30', imageUrl: 'https://via.placeholder.com/400x400/FFFFFF/000000?text=White+Sneakers', wearCount: 0, lastWorn: null },
  { name: 'Brown Leather Boots', category: 'shoes', type: 'boots', color: 'brown', purchasePrice: 6999, size: 'L', brand: 'Clarks', purchaseDate: '2023-11-30', imageUrl: 'https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Brown+Boots', wearCount: 0, lastWorn: null },
  { name: 'Black Heels', category: 'shoes', type: 'heels', color: 'black', purchasePrice: 5599, size: 'M', brand: 'Steve Madden', purchaseDate: '2024-02-12', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+Heels', wearCount: 0, lastWorn: null },
  { name: 'Black Handbag', category: 'accessory', type: 'handbag', color: 'black', purchasePrice: 5999, size: 'Free size', brand: 'Michael Kors', purchaseDate: '2023-12-20', imageUrl: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+Handbag', wearCount: 0, lastWorn: null },
  { name: 'Brown Leather Belt', category: 'accessory', type: 'belt', color: 'brown', purchasePrice: 1799, size: 'Free size', brand: 'Tommy Hilfiger', purchaseDate: '2024-01-14', imageUrl: 'https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Brown+Belt', wearCount: 0, lastWorn: null },
];

export const seedWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: 'No user logged in' };
  try {
    const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
    const snapshot = await getDocs(wardrobeRef);
    await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    let addedCount = 0;
    for (const item of sampleItems) {
      await addDoc(wardrobeRef, { ...item, createdAt: serverTimestamp() });
      addedCount++;
    }
    return { success: true, message: `Cleared old items and added ${addedCount} new items!` };
  } catch (error) {
    return { success: false, message: `Error: ${error.message}` };
  }
};

export const clearWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: 'No user logged in' };
  try {
    const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
    const snapshot = await getDocs(wardrobeRef);
    await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
    return { success: true, message: `Cleared ${snapshot.docs.length} items` };
  } catch (error) {
    return { success: false, message: `Error: ${error.message}` };
  }
};
