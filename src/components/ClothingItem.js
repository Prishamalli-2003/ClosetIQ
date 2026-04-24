import { useState, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { calculateAdjustedCostPerWear } from '../services/analyticsLogic';
import { formatINR } from '../utils/currency';
import { COLOR_PALETTE, CLOTHING_CATEGORIES, CLOTHING_TYPES } from '../utils/constants';
import { prepareImageForUpload } from '../services/imageProcessor';

const ColorDot = ({ color }) => {
  const found = COLOR_PALETTE.find(c => c.name === color);
  const hex = found?.hex || '#ccc';
  const label = color ? color.charAt(0).toUpperCase() + color.slice(1).replace('-', ' ') : '—';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: hex, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0, display: 'inline-block' }} />
      <span>{label}</span>
      <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontFamily: 'monospace' }}>{hex.toUpperCase()}</span>
    </span>
  );
};

const ClothingItem = ({ item, id, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingImg, setProcessingImg] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const userId = auth.currentUser?.uid;

  const { name, category, type, color, imageUrl, wearCount, purchasePrice } = item || {};
  const cpw = calculateAdjustedCostPerWear(purchasePrice ?? 0, wearCount ?? 0);
  const typesForCategory = CLOTHING_TYPES[editForm.category] || CLOTHING_TYPES.top || [];

  const startEdit = () => {
    setEditForm({
      name:          item.name || '',
      category:      item.category || 'top',
      type:          item.type || 'other',
      color:         item.color || 'black',
      size:          item.size || 'M',
      brand:         item.brand || '',
      purchasePrice: item.purchasePrice || '',
      purchaseDate:  item.purchaseDate || '',
      description:   item.description || '',
      imageBase64:   null, // only set if user picks a new photo
    });
    setPreviewUrl('');
    setEditing(true);
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProcessingImg(true);
    try {
      const { base64, previewUrl: pv } = await prepareImageForUpload(file, { maxWidth: 400, quality: 0.65 });
      setPreviewUrl(pv);
      setEditForm(f => ({ ...f, imageBase64: base64 }));
    } catch { alert('Could not process image.'); }
    finally { setProcessingImg(false); }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const updates = {
        name:          editForm.name.trim() || 'Unnamed',
        category:      editForm.category,
        type:          editForm.type,
        color:         editForm.color,
        size:          editForm.size,
        brand:         editForm.brand.trim() || null,
        purchasePrice: editForm.purchasePrice ? parseFloat(editForm.purchasePrice) : 0,
        purchaseDate:  editForm.purchaseDate || null,
        description:   editForm.description.trim() || null,
        updatedAt:     serverTimestamp(),
      };
      if (editForm.imageBase64) {
        updates.imageUrl = editForm.imageBase64;
      }
      await updateDoc(doc(db, 'users', userId, 'wardrobe', id), updates);
      onUpdate?.({ ...item, ...updates, imageUrl: editForm.imageBase64 || item.imageUrl });
      setEditing(false);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── EDIT MODE ──────────────────────────────────────────────────────────
  if (editing) {
    const currentImg = previewUrl || item.imageUrl;
    return (
      <div className="clothing-item-card clothing-item-card--editing">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />

        {/* Photo */}
        <div
          className="clothing-item-image"
          style={{ cursor: 'pointer', position: 'relative' }}
          onClick={() => !processingImg && fileInputRef.current?.click()}
          title="Tap to change photo"
        >
          {currentImg ? (
            <img src={currentImg} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="placeholder">{item.name}</div>
          )}
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.8rem', fontWeight: 600,
          }}>
            {processingImg ? '⏳' : '📷 Change Photo'}
          </div>
        </div>

        {/* Fields */}
        <div style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <input className="edit-field" placeholder="Name" value={editForm.name}
            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />

          <select className="edit-field" value={editForm.category}
            onChange={e => setEditForm(f => ({ ...f, category: e.target.value, type: (CLOTHING_TYPES[e.target.value] || ['other'])[0] }))}>
            {CLOTHING_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>

          <select className="edit-field" value={editForm.type}
            onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}>
            {typesForCategory.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}</option>)}
          </select>

          {/* Color swatches — compact */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {COLOR_PALETTE.map(c => (
              <button key={c.name} type="button"
                title={`${c.name} ${c.hex}`}
                onClick={() => setEditForm(f => ({ ...f, color: c.name }))}
                style={{
                  width: 20, height: 20, borderRadius: 4, border: editForm.color === c.name ? '2px solid #667eea' : '1px solid rgba(0,0,0,0.15)',
                  backgroundColor: c.hex, cursor: 'pointer', padding: 0,
                  transform: editForm.color === c.name ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          <input className="edit-field" placeholder="Brand" value={editForm.brand}
            onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))} />

          <input className="edit-field" type="number" placeholder="Price ₹" value={editForm.purchasePrice}
            onChange={e => setEditForm(f => ({ ...f, purchasePrice: e.target.value }))} />

          <textarea className="edit-field" placeholder="Description" rows={2} value={editForm.description}
            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
            style={{ resize: 'none', fontSize: '0.78rem' }} />

          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, padding: '0.45rem', background: '#667eea', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              {saving ? '...' : '✅ Save'}
            </button>
            <button onClick={() => setEditing(false)}
              style={{ flex: 1, padding: '0.45rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW MODE ──────────────────────────────────────────────────────────
  return (
    <div className="clothing-item-card">
      <div className="clothing-item-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name || 'Clothing'}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <div className="placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>{name || category}</div>
      </div>
      <div className="clothing-item-info">
        <h3>{name || 'Unnamed item'}</h3>
        <p><strong>Category:</strong> {category}</p>
        <p><strong>Type:</strong> {type?.replace('-', ' ')}</p>
        <p><strong>Color:</strong> <ColorDot color={color} /></p>
        {item?.description && <p style={{ fontSize: '0.72rem', color: '#6b7280', fontStyle: 'italic', lineHeight: 1.4, margin: '0.2rem 0' }}>{item.description}</p>}
        <p><strong>Worn:</strong> {wearCount ?? 0}×</p>
        <p><strong>CPW:</strong> {formatINR(cpw, { maximumFractionDigits: 0 })}</p>
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={startEdit}
            style={{ flex: 1, padding: '0.35rem', background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            ✏️ Edit
          </button>
          {onDelete && (
            <button type="button" className="btn-delete" style={{ flex: 1 }} onClick={() => onDelete(id)}>
              🗑️ Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClothingItem;
