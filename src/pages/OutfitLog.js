import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { OCCASIONS, MOODS } from '../utils/constants';
import { getUserCustomOptions, addCustomMood, addCustomOccasion } from '../services/dynamicOptions';
import CustomDropdown from '../components/CustomDropdown';
import { format } from 'date-fns';
import { prepareImageForUpload } from '../services/imageProcessor';
import GhostMannequinPlaceholder from '../components/GhostMannequinPlaceholder';

const OutfitLog = () => {
  const [wardrobe, setWardrobe] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [occasion, setOccasion] = useState('casual');
  const [mood, setMood] = useState('good');
  const [submitting, setSubmitting] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [photoPicking, setPhotoPicking] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [outfitType, setOutfitType] = useState('top');
  const [repeatInfo, setRepeatInfo] = useState(null);
  const [customOptions, setCustomOptions] = useState({ customMoods: [], customOccasions: [] });
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const OUTFIT_TYPES = ['top', 'tee', 'shirt', 'jeans', 'pants', 'formal-pants', 'gown', 'dress', 'saree', 'lehenga', 'skirt', 'other'];

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
      const snap = await getDocs(wardrobeRef);
      setWardrobe(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const options = await getUserCustomOptions();
      setCustomOptions(options);
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const logsRef = collection(db, 'users', userId, 'outfitLogs');
      const snap = await getDocs(logsRef);
      const logs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentLogs(logs.slice(0, 10));
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!selectedIds.length || !recentLogs.length) {
      setRepeatInfo(null);
      return;
    }
    const normalize = (arr) => [...arr].sort().join('|');
    const currentKey = normalize(selectedIds);
    const match = recentLogs.find((log) => Array.isArray(log.itemIds) && normalize(log.itemIds) === currentKey);
    setRepeatInfo(match || null);
  }, [selectedIds, recentLogs]);

  const handleCustomMood = async (newMood) => {
    const success = await addCustomMood(newMood);
    if (success) {
      setCustomOptions((prev) => ({
        ...prev,
        customMoods: [...prev.customMoods, newMood],
      }));
    }
    return success;
  };

  const handleCustomOccasion = async (newOccasion) => {
    const success = await addCustomOccasion(newOccasion);
    if (success) {
      setCustomOptions((prev) => ({
        ...prev,
        customOccasions: [...prev.customOccasions, newOccasion],
      }));
    }
    return success;
  };

  const toggleItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePhotoPicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoPicking(true);
    try {
      const { base64, previewUrl } = await prepareImageForUpload(file, {
        maxWidth: 400,
        quality: 0.65,
      });
      setPhotoPreviewUrl(previewUrl);
      setPhotoFile(base64); // store base64 string directly
    } catch (err) {
      alert('Could not use this photo. Try another image.');
    } finally {
      setPhotoPicking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || selectedIds.length === 0) {
      alert('Select at least one clothing item.');
      return;
    }
    setSubmitting(true);
    try {
      const logsRef = collection(db, 'users', userId, 'outfitLogs');
      let outfitImageUrl = '';
      if (photoFile) {
        // photoFile is now a Base64 string — no Storage upload needed
        outfitImageUrl = photoFile;
      }
      await addDoc(logsRef, {
        date,
        occasion,
        mood,
        itemIds: selectedIds,
        description: description.trim() || null,
        brand: brand.trim() || null,
        price: price ? parseFloat(price) : 0,
        outfitType,
        imageUrl: outfitImageUrl || null,
        createdAt: serverTimestamp(),
      });
      for (const itemId of selectedIds) {
        const item = wardrobe.find((w) => w.id === itemId);
        const wearCount = (item?.wearCount ?? 0) + 1;
        await updateDoc(doc(db, 'users', userId, 'wardrobe', itemId), {
          wearCount,
          lastWorn: date,
        });
      }
      setSelectedIds([]);
      setPhotoFile(null);
      setPhotoPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
      setDescription('');
      setPrice('');
      setBrand('');
      setOutfitType('top');
      setRecentLogs((prev) => [
        { date, occasion, mood, itemIds: selectedIds },
        ...prev.slice(0, 9),
      ]);
      const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
      const snap = await getDocs(wardrobeRef);
      setWardrobe(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to log outfit');
    } finally {
      setSubmitting(false);
      setPhotoUploading(false);
    }
  };

  return (
    <div className="recommendations-page">
      <div className="form-container">
        <div className="form-card">
          <h1 className="form-title">📝 Log Today&apos;s Outfit</h1>
          <p className="form-subtitle">
            Capture what you wore so ClosetIQ can help you avoid repeats and suggest new combos
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-grid single-column">
              <div className="form-group">
                <label className="form-label">📅 Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  📸 Outfit photo <span className="label-hint">(optional)</span>
                </label>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoPicked}
                  className="visually-hidden-file"
                  aria-hidden
                  tabIndex={-1}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handlePhotoPicked}
                  className="visually-hidden-file"
                  aria-hidden
                  tabIndex={-1}
                />
                <div className="ghost-upload-area">
                  {photoPreviewUrl ? (
                    <div className="ghost-upload-preview-wrap">
                      <img src={photoPreviewUrl} alt="Outfit preview" className="ghost-upload-preview" />
                      <div className="ghost-upload-actions">
                        <button
                          type="button"
                          className="camera-button ghost-retake-btn"
                          onClick={() => cameraInputRef.current?.click()}
                          disabled={photoPicking}
                        >
                          {photoPicking ? '⏳ …' : '📷 Retake'}
                        </button>
                        <button
                          type="button"
                          className="camera-button ghost-gallery-btn"
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={photoPicking}
                        >
                          🖼️ Gallery
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <GhostMannequinPlaceholder caption="Your outfit photo appears on this mannequin frame" />
                      <div className="ghost-upload-actions">
                        <button
                          type="button"
                          className="camera-button"
                          onClick={() => cameraInputRef.current?.click()}
                          disabled={photoPicking}
                        >
                          {photoPicking ? '⏳ Processing...' : '📷 Take photo'}
                        </button>
                        <button
                          type="button"
                          className="camera-button ghost-gallery-btn"
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={photoPicking}
                        >
                          🖼️ Choose from gallery
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {photoUploading && (
                  <p className="label-hint" style={{ marginTop: '0.5rem' }}>✨ Uploading photo…</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">📝 Description</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Casual Friday office outfit, Wedding guest look, Date night ensemble"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">🏷️ Brand <span className="label-hint">(optional)</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. H&M, Zara, Fabindia, Sabyasachi"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">👗 Outfit type</label>
                <select
                  value={outfitType}
                  onChange={(e) => setOutfitType(e.target.value)}
                  className="form-select"
                >
                  {OUTFIT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <CustomDropdown
                label="🎉 Occasion"
                value={occasion}
                onChange={setOccasion}
                options={OCCASIONS}
                customOptions={customOptions.customOccasions}
                onAddCustom={handleCustomOccasion}
                placeholder="Select occasion"
              />

              <CustomDropdown
                label="😊 Mood"
                value={mood}
                onChange={setMood}
                options={MOODS}
                customOptions={customOptions.customMoods}
                onAddCustom={handleCustomMood}
                placeholder="How are you feeling?"
              />
            </div>

            <div className="wardrobe-selection">
              <label className="form-label">👕 Select items worn</label>
              <div className="wardrobe-picker">
                {wardrobe.length === 0 ? (
                  <div className="empty-hint" style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
                    <p>📦 Add items in My Wardrobe first to start logging outfits!</p>
                  </div>
                ) : (
                  wardrobe.map((item) => (
                    <label key={item.id} className={`outfit-item-tile ${selectedIds.includes(item.id) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        style={{ display: 'none' }}
                      />
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="placeholder">{item.name || item.category}</div>
                      )}
                      <span>{item.name || item.category}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <button type="submit" className="form-submit" disabled={submitting || selectedIds.length === 0}>
              {submitting ? '✨ Saving outfit...' : '✨ Log Outfit'}
            </button>

            {repeatInfo && (
              <div className="repeat-warning">
                🔄 <strong>Repeat Alert:</strong> You wore this exact combination on <strong>{repeatInfo.date}</strong>.
                Try mixing in different pieces to keep your style fresh and exciting!
              </div>
            )}
          </form>

          {recentLogs.length > 0 && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>📖 Recent Outfit Diary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentLogs.slice(0, 5).map((log, i) => (
                  <div key={log.id || i} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                    {log.date} – {log.occasion} – {log.mood} ({log.itemIds?.length ?? 0} items)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitLog;
