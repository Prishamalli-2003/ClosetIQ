import { useState } from 'react';
import { seedWardrobe, clearWardrobe } from '../utils/seedWardrobe';

const SeedData = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    if (!window.confirm('⚠️ This will CLEAR your current wardrobe and add 50 fresh sample items. Continue?')) {
      return;
    }

    setLoading(true);
    setMessage('Clearing wardrobe and adding fresh items...');

    const result = await seedWardrobe();
    
    setMessage(result.message);
    setLoading(false);

    if (result.success) {
      setTimeout(() => {
        window.location.href = '/wardrobe';
      }, 2000);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('⚠️ WARNING: This will DELETE ALL items from your wardrobe! Are you sure?')) {
      return;
    }

    setLoading(true);
    setMessage('Clearing wardrobe...');

    const result = await clearWardrobe();
    
    setMessage(result.message);
    setLoading(false);
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h1 className="form-title">🎨 Seed Sample Data</h1>
        <p className="form-subtitle">Replace your wardrobe with 50 fresh sample clothing items for testing</p>

        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ 
            marginBottom: '2rem', 
            padding: '1rem', 
            background: 'rgba(251, 191, 36, 0.2)', 
            borderRadius: '12px',
            border: '2px solid rgba(251, 191, 36, 0.5)'
          }}>
            <p style={{ color: '#fbbf24', fontWeight: '600', margin: 0 }}>
              ⚠️ Warning: This will clear all existing items and add 50 new sample items
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Sample Items Include:</h3>
            <ul style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'left', maxWidth: '500px', margin: '0 auto', lineHeight: '1.8' }}>
              <li>👕 Tops: T-shirts, Shirts, Hoodies, Crop Tops</li>
              <li>👖 Bottoms: Jeans, Formal Pants, Palazzo, Skirts</li>
              <li>👗 Dresses: Casual, Evening Gowns, Maxi Dresses</li>
              <li>🥻 Traditional: Sarees, Lehengas, Kurtis</li>
              <li>🧥 Outerwear: Jackets, Blazers, Coats</li>
              <li>👟 Shoes: Sneakers, Boots, Heels</li>
              <li>👜 Accessories: Handbags, Belts, Jewelry</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleSeed}
              disabled={loading}
              className="form-submit"
              style={{ minWidth: '250px' }}
            >
              {loading ? '⏳ Replacing Items...' : '🔄 Replace with 50 Sample Items'}
            </button>

            <button 
              onClick={handleClear}
              disabled={loading}
              className="form-submit"
              style={{ 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                minWidth: '200px'
              }}
            >
              {loading ? '⏳ Clearing...' : '🗑️ Clear All Items Only'}
            </button>
          </div>

          {message && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '500'
            }}>
              {message}
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              💡 Note: Sample items use placeholder images with color-coded labels. You can replace them with real photos by editing items in your wardrobe. The main button will clear your wardrobe first, then add 50 fresh items with realistic market prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeedData;
