import { useState, useEffect, useRef } from "react";
import { db, auth } from "../services/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { prepareImageForUpload } from "../services/imageProcessor";
import ClothingItem from "../components/ClothingItem";
import DeletionSuggestions from "../components/DeletionSuggestions";
import { CLOTHING_CATEGORIES, CLOTHING_TYPES } from "../utils/constants";
import ColorPalettePicker from "../components/ColorPalettePicker";
import GhostMannequinPlaceholder from "../components/GhostMannequinPlaceholder";

const Wardrobe = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [form, setForm] = useState({ name: "", category: "top", type: "t-shirt", color: "black", purchasePrice: "", size: "M", brand: "", purchaseDate: "", imageBase64: null });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    getDocs(collection(db, "users", userId, "wardrobe")).then((snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [userId]);

  const typesForCategory = CLOTHING_TYPES[form.category] || CLOTHING_TYPES.top;

  const handleImagePicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProcessing(true);
    try {
      const { base64, previewUrl } = await prepareImageForUpload(file, { maxWidth: 400, quality: 0.65 });
      setImagePreviewUrl(previewUrl);
      setForm((f) => ({ ...f, imageBase64: base64 }));
    } catch { alert("Could not process image."); }
    finally { setProcessing(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) { alert("Please log in first."); return; }
    if (!form.imageBase64) { alert("Please add a photo first."); return; }
    setSaving(true);
    try {
      const data = { name: form.name.trim() || "Unnamed", category: form.category, type: form.type, color: form.color, purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : 0, size: form.size, brand: form.brand.trim() || null, purchaseDate: form.purchaseDate || null, imageUrl: form.imageBase64, wearCount: 0, lastWorn: null, createdAt: serverTimestamp() };
      const docRef = await addDoc(collection(db, "users", userId, "wardrobe"), data);
      setItems((prev) => [...prev, { id: docRef.id, ...data, createdAt: new Date() }]);
      setForm({ name: "", category: "top", type: "t-shirt", color: "black", purchasePrice: "", size: "M", brand: "", purchaseDate: "", imageBase64: null });
      setImagePreviewUrl("");
      setShowAdd(false);
    } catch (err) { alert("Failed: " + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this item?")) return;
    try {
      await deleteDoc(doc(db, "users", userId, "wardrobe", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) { alert(err.message); }
  };

  const filteredItems = items.filter(item => {
    const q = search.toLowerCase();
    const ms = !q || [(item.name||""),(item.color||""),(item.brand||""),(item.type||"")].some(v => v.toLowerCase().includes(q));
    const mc = filterCategory === "all" || item.category === filterCategory;
    const mco = filterColor === "all" || item.color === filterColor;
    return ms && mc && mco;
  });

  if (loading) return <div className="page-loading">Loading wardrobe...</div>;

  return (
    <div className="page-wrapper">
      {saving && <div className="upload-overlay"><div className="upload-spinner" /><p>Saving...</p></div>}
      <div className="page-card">
        <div className="page-card-header">
          <h1 className="page-title">My Wardrobe <span style={{fontSize:"0.85rem",opacity:0.7,fontWeight:400}}>({items.length} items)</span></h1>
          <button type="button" className={showAdd ? "btn-pill btn-pill--cancel" : "btn-pill btn-pill--primary"} onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? "Cancel" : "+ Add Item"}
          </button>
        </div>

        {showAdd && (
          <form className="iq-form" onSubmit={handleSubmit}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePicked} style={{ display: "none" }} />
            <div className="iq-form-group iq-form-group--full">
              <label className="iq-label">Item Photo</label>
              <div className="ghost-upload-area" onClick={() => !processing && fileInputRef.current && fileInputRef.current.click()} role="button" tabIndex={0}>
                {imagePreviewUrl ? <img src={imagePreviewUrl} alt="Preview" className="ghost-preview-img" /> : <GhostMannequinPlaceholder />}
                <div className="ghost-upload-hint">{processing ? "Processing..." : imagePreviewUrl ? "Tap to change" : "Tap to take photo or choose from gallery"}</div>
              </div>
            </div>
            <div className="iq-form-grid">
              <div className="iq-form-group"><label className="iq-label">Item Name</label><input type="text" className="iq-input" placeholder="e.g. Blue denim jacket" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="iq-form-group"><label className="iq-label">Category</label><select className="iq-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, type: (CLOTHING_TYPES[e.target.value] || ["other"])[0] }))}>{CLOTHING_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
              <div className="iq-form-group"><label className="iq-label">Type</label><select className="iq-input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>{typesForCategory.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}</option>)}</select></div>
              <ColorPalettePicker value={form.color} onChange={(color) => setForm((f) => ({ ...f, color }))} label="Color" />
              <div className="iq-form-group"><label className="iq-label">Size</label><select className="iq-input" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}>{["XS","S","M","L","XL","XXL","Free size"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="iq-form-group"><label className="iq-label">Brand (optional)</label><input type="text" className="iq-input" placeholder="e.g. Zara, H&M" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} /></div>
              <div className="iq-form-group"><label className="iq-label">Price (optional)</label><input type="number" className="iq-input" min="0" placeholder="0" value={form.purchasePrice} onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value }))} /></div>
              <div className="iq-form-group"><label className="iq-label">Purchase Date (optional)</label><input type="date" className="iq-input" value={form.purchaseDate} onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))} /></div>
            </div>
            <button type="submit" className="iq-submit" disabled={saving || processing}>{saving ? "Saving..." : "Add to Wardrobe"}</button>
          </form>
        )}

        {!showAdd && (
          <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <input type="text" className="iq-input" placeholder="Search name, color, brand..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 2, minWidth: "150px" }} />
              <select className="iq-input" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ flex: 1, minWidth: "110px" }}>
                <option value="all">All Categories</option>
                {CLOTHING_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <select className="iq-input" value={filterColor} onChange={e => setFilterColor(e.target.value)} style={{ flex: 1, minWidth: "100px" }}>
                <option value="all">All Colors</option>
                {["black","white","navy","gray","beige","brown","red","blue","green","yellow","pink","orange","purple","maroon","teal","coral","lavender","cream","gold","silver","olive","burgundy"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <DeletionSuggestions items={items} onDeleteItem={handleDelete} maxItems={50} />
            <div className="wardrobe-grid">
              {filteredItems.length === 0
                ? <div className="empty-state"><span>{items.length === 0 ? "👗" : "🔍"}</span><p>{items.length === 0 ? "Your wardrobe is empty" : "No items match your search"}</p></div>
                : filteredItems.map(item => <ClothingItem key={item.id} id={item.id} item={item} onDelete={handleDelete} />)
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wardrobe;