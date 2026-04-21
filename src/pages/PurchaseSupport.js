import { useState, useEffect, useRef } from 'react';
import { detectRedundancy, calculateSmartCostPerWear } from '../services/analyticsLogic';
import { db, auth } from '../services/firebase';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { prepareImageForUpload } from '../services/imageProcessor';
import { CLOTHING_CATEGORIES, COLORS } from '../utils/constants';
import ColorPalettePicker from '../components/ColorPalettePicker';
import DeletionSuggestions from '../components/DeletionSuggestions';
import { formatINR } from '../utils/currency';
import GhostMannequinPlaceholder from '../components/GhostMannequinPlaceholder';
import { savePurchaseDecision } from '../services/userDataService';

const PurchaseSupport = () => {
  const [newItem, setNewItem] = useState({
    name: '', category: CLOTHING_CATEGORIES[0] || 'top',
    color: COLORS[0] || 'black', price: 0, imageUrl: null,
  });
  const [analysis, setAnalysis] = useState(null);
  const [wardrobe, setWardrobe] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [showAddToWardrobe, setShowAddToWardrobe] = useState(false);
  const [addingToWardrobe, setAddingToWardrobe] = useState(false);
  const fileInputRef = useRef(null);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    getDocs(collection(db, 'users', userId, 'wardrobe')).then((snap) =>
      setWardrobe(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [userId]);

  // getImageUrl removed — using Base64 directly

  const handleImagePicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId) return;
    setUploading(true);
    try {
      const { base64, previewUrl } = await prepareImageForUpload(file, { maxWidth: 400, quality: 0.65 });
      setImagePreviewUrl(previewUrl);
      // Store Base64 directly — no Firebase Storage needed
      setNewItem((prev) => ({ ...prev, imageUrl: base64 }));
    } catch (err) {
      alert('Could not process image. Please try another photo.');
    } finally {
      setUploading(false);
    }
  };

  const analyzePurchase = () => {
    if (!newItem.imageUrl) {
      alert('Please add a photo first.');
      return;
    }
    const redundancyResult = detectRedundancy(wardrobe, newItem);
    const costPerWear = calculateSmartCostPerWear(newItem.price ?? 0, 0, newItem.category);
    let recommendation = 'BUY - This adds variety to your wardrobe';
    let reasoning = 'This item adds diversity and can match your style profile.';

    if (redundancyResult.similarCount >= 2) {
      recommendation = "DON'T BUY - You already own this";
      reasoning = `You have ${redundancyResult.similarCount} very similar items already. Buying this would be a duplicate purchase.`;
    } else if (redundancyResult.similarCount === 1) {
      recommendation = "MAYBE - You have something similar";
      const similar = redundancyResult.items[0];
      reasoning = `You already own "${similar?.name || 'a similar item'}" (${similar?.color || ''}, ₹${similar?.purchasePrice || 0}). Check if this adds enough difference to justify the purchase.`;
    }

    setAnalysis({ ...redundancyResult, costPerWear, recommendation, reasoning });
    setShowAddToWardrobe(recommendation.startsWith('BUY'));

    // Save decision to Firestore
    savePurchaseDecision({
      itemName: newItem.name,
      category: newItem.category,
      color: newItem.color,
      price: newItem.price,
      recommendation,
      similarCount: redundancyResult.similarCount,
      similarItems: redundancyResult.items,
      addedToWardrobe: false,
    }).catch(() => {});
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'wardrobe', itemId));
      setWardrobe((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const addToWardrobe = async () => {
    if (!userId || !newItem.imageUrl) return;
    setAddingToWardrobe(true);
    try {
      await addDoc(collection(db, 'users', userId, 'wardrobe'), {
        name: newItem.name.trim() || 'Unnamed',
        category: newItem.category, type: 'other', color: newItem.color,
        purchasePrice: newItem.price || 0, size: 'M', brand: null,
        purchaseDate: new Date().toISOString().split('T')[0],
        imageUrl: newItem.imageUrl, wearCount: 0, lastWorn: null, createdAt: new Date(),
      });
      const snap = await getDocs(collection(db, 'users', userId, 'wardrobe'));
      setWardrobe(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setShowAddToWardrobe(false);
      alert('✅ Item added to your wardrobe!');
    } catch (err) {
      alert(`Failed: ${err.message}`);
    } finally {
      setAddingToWardrobe(false);
    }
  };

  return (
    <div className="recommendations-page">
      <div className="form-container">
        <div className="form-card">
          <h1 className="form-title">🛒 Purchase Decision Support</h1>
          <p className="form-subtitle">Check if a potential purchase overlaps your wardrobe.</p>

          <DeletionSuggestions items={wardrobe} onDeleteItem={handleDeleteItem} maxItems={40} />

          <div className="form-group full-width" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">📷 Item photo <span className="label-hint">(required)</span></label>
            <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif"
              onChange={handleImagePicked} style={{ display: 'none' }} />
            <div className="ghost-upload-area"
              onClick={() => !uploading && fileInputRef.current?.click()}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}>
              {imagePreviewUrl ? (
                <>
                  <img src={imagePreviewUrl} alt="Preview" className="ghost-preview-img" />
                  <div className="ghost-upload-hint">{uploading ? '⏳ Processing...' : '📷 Tap to change'}</div>
                </>
              ) : (
                <>
                  <GhostMannequinPlaceholder caption="Lay flat or hang — like a catalog shot" />
                  <div className="ghost-upload-hint">{uploading ? '⏳ Processing...' : '📷 Tap to take photo or choose from gallery'}</div>
                </>
              )}
            </div>
          </div>

          <div className="form-grid single-column">
            <div className="form-group">
              <label className="form-label">🏷️ Item name</label>
              <input type="text" className="form-input" placeholder="e.g. Navy blue blazer"
                value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">📂 Category</label>
              <select className="form-select" value={newItem.category}
                onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}>
                {CLOTHING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <ColorPalettePicker value={newItem.color}
              onChange={(color) => setNewItem((p) => ({ ...p, color }))} label="🎨 Color" />
            <div className="form-group">
              <label className="form-label">💰 Price (₹)</label>
              <input type="number" className="form-input" min="0" placeholder="0"
                value={newItem.price || ''}
                onChange={(e) => setNewItem((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>

          <button type="button" className="form-submit" onClick={analyzePurchase}>
            🔍 Analyze purchase decision
          </button>
        </div>

        {analysis && (
          <div className="form-card">
            <div className={`recommendation-badge ${analysis.recommendation.includes("DON'T") ? 'dont-buy' : analysis.recommendation.includes('MAYBE') ? 'maybe-buy' : 'buy'}`}>
              {analysis.recommendation}
            </div>
            <div className="analysis-details">
              <div className="analysis-stat">
                <span className="stat-label">Similar items in wardrobe:</span>
                <span className="stat-value">{analysis.similarCount}</span>
              </div>
              <div className="analysis-stat">
                <span className="stat-label">Estimated cost-per-wear:</span>
                <span className="stat-value">
                  {typeof analysis.costPerWear === 'object' ? analysis.costPerWear.message : formatINR(analysis.costPerWear, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
            <p className="analysis-reasoning"><strong>💡 Reasoning:</strong> {analysis.reasoning}</p>

            {Array.isArray(analysis.items) && analysis.items.length > 0 && (
              <div className="similar-items">
                <h4>👕 Similar items in your wardrobe:</h4>
                <div className="similar-items-grid">
                  {analysis.items.slice(0, 5).map((item) => (
                    <div key={item.id} className="similar-item">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="similar-item-image" />}
                      <div className="similar-item-info">
                        <strong>{item.name || item.category}</strong>
                        <span>{item.color} · Worn {item.wearCount ?? 0}×</span>
                        <span>₹{item.purchasePrice || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showAddToWardrobe && (
              <div className="add-to-wardrobe-section">
                <h4>✨ Add this to your wardrobe?</h4>
                <p>Since this is a good purchase, add it directly to your digital wardrobe.</p>
                <button type="button" onClick={addToWardrobe} disabled={addingToWardrobe} className="btn-add-wardrobe">
                  {addingToWardrobe ? '✨ Adding...' : '➕ Add to Wardrobe'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseSupport;
