// Categories for clothing items (rule-based analytics)
export const CLOTHING_CATEGORIES = [
  'top',
  'bottom',
  'dress',
  'traditional',
  'outerwear',
  'shoes',
  'accessory',
];

// Common clothing types per category
export const CLOTHING_TYPES = {
  top: ['t-shirt', 'shirt', 'blouse', 'sweater', 'hoodie', 'tank', 'polo', 'crop-top', 'bodysuit', 'camisole', 'other'],
  bottom: ['jeans', 'trousers', 'shorts', 'skirt', 'leggings', 'chinos', 'palazzo', 'culottes', 'joggers', 'other'],
  dress: ['casual-dress', 'formal-dress', 'maxi-dress', 'midi-dress', 'mini-dress', 'cocktail-dress', 'evening-gown', 'sundress', 'other'],
  traditional: ['saree', 'lehenga', 'salwar-kameez', 'kurti', 'churidar', 'anarkali', 'sharara', 'gharara', 'dhoti', 'kurta', 'other'],
  outerwear: ['jacket', 'coat', 'blazer', 'vest', 'cardigan', 'shawl', 'cape', 'poncho', 'other'],
  shoes: ['sneakers', 'boots', 'sandals', 'loafers', 'heels', 'flats', 'wedges', 'stilettos', 'pumps', 'ballet-flats', 'other'],
  accessory: ['bag', 'belt', 'hat', 'scarf', 'watch', 'jewelry', 'sunglasses', 'handbag', 'clutch', 'backpack', 'other'],
};

// Colors for filtering and compatibility
export const COLORS = [
  'black', 'white', 'navy', 'gray', 'beige', 'brown',
  'red', 'blue', 'green', 'yellow', 'pink', 'orange', 'purple', 
  'maroon', 'teal', 'mint', 'coral', 'lavender', 'cream', 'gold', 
  'silver', 'rose-gold', 'olive', 'burgundy', 'turquoise', 'multi',
];

// Palette used for color picking UI – store `name` in Firestore, show `hex` in UI
export const COLOR_PALETTE = [
  { name: 'black', hex: '#111827' },
  { name: 'white', hex: '#ffffff' },
  { name: 'navy', hex: '#0b1f3a' },
  { name: 'gray', hex: '#6b7280' },
  { name: 'beige', hex: '#d6c6a8' },
  { name: 'brown', hex: '#7c4a2d' },
  { name: 'red', hex: '#ef4444' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'green', hex: '#22c55e' },
  { name: 'yellow', hex: '#f59e0b' },
  { name: 'pink', hex: '#ec4899' },
  { name: 'orange', hex: '#f97316' },
  { name: 'purple', hex: '#8b5cf6' },
  { name: 'maroon', hex: '#7f1d1d' },
  { name: 'teal', hex: '#14b8a6' },
  { name: 'mint', hex: '#6ee7b7' },
  { name: 'coral', hex: '#ff7875' },
  { name: 'lavender', hex: '#c4b5fd' },
  { name: 'cream', hex: '#fef3c7' },
  { name: 'gold', hex: '#fbbf24' },
  { name: 'silver', hex: '#d1d5db' },
  { name: 'rose-gold', hex: '#f9a8d4' },
  { name: 'olive', hex: '#84cc16' },
  { name: 'burgundy', hex: '#991b1b' },
  { name: 'turquoise', hex: '#06b6d4' },
  { name: 'multi', hex: '#a1a1aa' },
];

// Occasions for outfit logging
export const OCCASIONS = [
  'casual', 'work', 'party', 'sport', 'formal', 'wedding', 'date', 'travel', 
  'festival', 'religious', 'shopping', 'family-gathering', 'interview', 'graduation'
];

// Mood options for outfit logging
export const MOODS = [
  'excited', 'confident', 'happy', 'great', 'good', 'neutral', 'relaxed', 
  'tired', 'stressed', 'anxious', 'romantic', 'professional', 'playful', 'elegant'
];

// Style preferences (onboarding)
export const STYLE_PREFERENCES = ['casual', 'minimal', 'formal', 'bohemian', 'sporty', 'classic', 'trendy'];

// Comfort level (onboarding)
export const COMFORT_LEVELS = ['comfort-first', 'balanced', 'style-first'];

// Body types for onboarding
export const BODY_TYPES = [
  { value: 'petite', label: 'Petite', icon: '👗' },
  { value: 'athletic', label: 'Athletic', icon: '💪' },
  { value: 'curvy', label: 'Curvy', icon: '✨' },
  { value: 'tall', label: 'Tall', icon: '📏' },
  { value: 'average', label: 'Average', icon: '👔' },
  { value: 'plus-size', label: 'Plus Size', icon: '👘' },
];

// Favorite spots/occasions for onboarding
// Images chosen to feel clearly fashion/wardrobe related.
export const FAVORITE_SPOTS = [
  {
    value: 'casual',
    label: 'Casual Outings',
    icon: '☕',
    description: 'Coffee runs, brunch, everyday errands',
    // Relaxed street-style look
    image: 'https://images.pexels.com/photos/6311654/pexels-photo-6311654.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    value: 'work',
    label: 'Work/Office',
    icon: '💼',
    description: 'Smart looks for office and meetings',
    image: 'https://images.pexels.com/photos/3760852/pexels-photo-3760852.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    value: 'party',
    label: 'Parties & Events',
    icon: '🎉',
    description: 'Evening, parties, and celebrations',
    image: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    value: 'sport',
    label: 'Sports & Fitness',
    icon: '🏃',
    description: 'Athleisure and activewear',
    // Person in activewear (no mascot art)
    image: 'https://images.pexels.com/photos/7674482/pexels-photo-7674482.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    value: 'formal',
    label: 'Formal Events',
    icon: '🎩',
    description: 'Suits, sarees, gowns for big days',
    image: 'https://images.pexels.com/photos/2690323/pexels-photo-2690323.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    value: 'travel',
    label: 'Travel',
    icon: '✈️',
    description: 'Airport and vacation outfits',
    // Travel streetwear with suitcase / city
    image: 'https://images.pexels.com/photos/8236947/pexels-photo-8236947.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

// Outfit types for opinion survey
// Images chosen to look like clear outfit photos, similar to dressing apps.
export const OUTFIT_TYPES = [
  {
    id: 'minimal',
    name: 'Minimalist',
    description: 'Clean lines, neutral colors, simple elegance',
    image: 'https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=900',
    color: '#2c3e50',
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Free-spirited, flowy, eclectic patterns',
    image: 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&w=900',
    color: '#d4a574',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless, sophisticated, traditional',
    image: 'https://images.pexels.com/photos/7671175/pexels-photo-7671175.jpeg?auto=compress&cs=tinysrgb&w=900',
    color: '#34495e',
  },
];
