import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { generateOutfitRecommendations } from '../services/analyticsLogic';
import RecommendationCard from '../components/RecommendationCard';
import { OCCASIONS, MOODS } from '../utils/constants';
import CustomDropdown from '../components/CustomDropdown';
import useUserProfile from '../services/useUserProfile';
import PageHeader from '../components/PageHeader';

const Recommendations = () => {
  const { firstName } = useUserProfile();
  const [wardrobe, setWardrobe] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mood, setMood] = useState('good');
  const [destination, setDestination] = useState('casual');
  const [outfitLogs, setOutfitLogs] = useState([]);
  const [weather, setWeather] = useState('moderate');
  const [formality, setFormality] = useState('casual');
  const [colorPreference, setColorPreference] = useState('any');
  const [style, setStyle] = useState('any');
  const [showResults, setShowResults] = useState(false);
  const [cacheKey, setCacheKey] = useState('');

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [wardrobeSnap, userSnap, logsSnap] = await Promise.all([
        getDocs(collection(db, 'users', userId, 'wardrobe')),
        getDoc(doc(db, 'users', userId)),
        getDocs(collection(db, 'users', userId, 'outfitLogs')),
      ]);
      const items = wardrobeSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const userData = userSnap.data() || {};
      setWardrobe(items);
      setPreferences(userData.preferences || {});
      const logs = logsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOutfitLogs(logs);
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleGetRecommendations = async () => {
    setShowResults(true);
    setGenerating(true);

    // Build a cache key from the context
    const key = `${destination}-${weather}-${formality}-${mood}-${style}`;
    setCacheKey(key);

    try {
      // Check Firestore cache first
      const cacheRef = doc(db, 'users', userId, 'recommendationCache', key);
      const cached = await getDoc(cacheRef);

      if (cached.exists()) {
        const data = cached.data();
        // Use cache if less than 1 hour old
        const age = Date.now() - (data.generatedAt?.toMillis?.() || 0);
        if (age < 60 * 60 * 1000) {
          setRecommendations(data.recommendations || []);
          setGenerating(false);
          return;
        }
      }

      // Generate fresh recommendations
      const base = generateOutfitRecommendations(wardrobe, preferences, {
        mood, destination, weather, formality, colorPreference, style
      });

      // Filter out exact repeat of last outfit for this occasion
      const lastForOccasion = outfitLogs
        .filter((l) => l.occasion === destination)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      const normalize = (ids) => [...ids].sort().join('|');
      const lastKey = lastForOccasion && Array.isArray(lastForOccasion.itemIds)
        ? normalize(lastForOccasion.itemIds) : null;

      const filtered = lastKey
        ? base.filter((rec) => {
            const ids = [rec.top?.id, rec.bottom?.id, rec.outerwear?.id].filter(Boolean);
            if (!ids.length) return true;
            return normalize(ids) !== lastKey;
          })
        : base;

      setRecommendations(filtered);

      // Save to Firestore cache (strip circular refs — only save serialisable fields)
      const serialisable = filtered.map(r => ({
        score: r.score || 0,
        outfitType: r.outfitType || 'top+bottom',
        explanation: r.explanation || '',
        top:         r.top         ? { id: r.top.id,         name: r.top.name,         color: r.top.color,         imageUrl: r.top.imageUrl || null }         : null,
        bottom:      r.bottom      ? { id: r.bottom.id,      name: r.bottom.name,      color: r.bottom.color,      imageUrl: r.bottom.imageUrl || null }      : null,
        dress:       r.dress       ? { id: r.dress.id,       name: r.dress.name,       color: r.dress.color,       imageUrl: r.dress.imageUrl || null }       : null,
        traditional: r.traditional ? { id: r.traditional.id, name: r.traditional.name, color: r.traditional.color, imageUrl: r.traditional.imageUrl || null } : null,
        outerwear:   r.outerwear   ? { id: r.outerwear.id,   name: r.outerwear.name,   color: r.outerwear.color,   imageUrl: r.outerwear.imageUrl || null }   : null,
      }));

      await setDoc(cacheRef, {
        recommendations: serialisable,
        context: { destination, weather, formality, mood },
        generatedAt: serverTimestamp(),
      }).catch(() => {}); // non-critical

    } catch (err) {
      console.error('Recommendation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="page-loading">Loading recommendations...</div>;

  return (
    <div className="recommendations-page">
      <div className="form-container">
        <div className="form-card">
          <PageHeader title="✨ {name}'s Outfit Recommendations" subtitle="Customize your preferences to get 5 smart, personalized outfit suggestions" />

          <div className="form-grid">
            {/* Occasion */}
            <div className="form-group">
              <label className="form-label">
                📍 Occasion
                <span className="label-hint">Where are you going?</span>
              </label>
              <CustomDropdown
                value={destination}
                onChange={setDestination}
                options={OCCASIONS}
                type="occasion"
                placeholder="Select occasion"
              />
            </div>

            {/* Mood */}
            <div className="form-group">
              <label className="form-label">
                😊 Mood
                <span className="label-hint">How are you feeling?</span>
              </label>
              <CustomDropdown
                value={mood}
                onChange={setMood}
                options={MOODS}
                type="mood"
                placeholder="Select mood"
              />
            </div>

            {/* Weather */}
            <div className="form-group">
              <label className="form-label">
                🌤️ Weather
                <span className="label-hint">What's the temperature?</span>
              </label>
              <select 
                value={weather} 
                onChange={(e) => setWeather(e.target.value)}
                className="form-input"
              >
                <option value="hot">Hot (30°C+)</option>
                <option value="warm">Warm (25-30°C)</option>
                <option value="moderate">Moderate (20-25°C)</option>
                <option value="cool">Cool (15-20°C)</option>
                <option value="cold">Cold (Below 15°C)</option>
              </select>
            </div>

            {/* Formality Level */}
            <div className="form-group">
              <label className="form-label">
                👔 Formality Level
                <span className="label-hint">How formal should it be?</span>
              </label>
              <select 
                value={formality} 
                onChange={(e) => setFormality(e.target.value)}
                className="form-input"
              >
                <option value="very-casual">Very Casual</option>
                <option value="casual">Casual</option>
                <option value="smart-casual">Smart Casual</option>
                <option value="business-casual">Business Casual</option>
                <option value="formal">Formal</option>
                <option value="black-tie">Black Tie</option>
              </select>
            </div>

            {/* Color Preference */}
            <div className="form-group">
              <label className="form-label">
                🎨 Color Preference
                <span className="label-hint">Any color preference?</span>
              </label>
              <select 
                value={colorPreference} 
                onChange={(e) => setColorPreference(e.target.value)}
                className="form-input"
              >
                <option value="any">Any Color</option>
                <option value="bright">Bright Colors</option>
                <option value="neutral">Neutral Tones</option>
                <option value="dark">Dark Colors</option>
                <option value="pastel">Pastel Shades</option>
                <option value="monochrome">Monochrome</option>
              </select>
            </div>

            {/* Style */}
            <div className="form-group">
              <label className="form-label">
                👗 Style Vibe
                <span className="label-hint">What style are you going for?</span>
              </label>
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
                className="form-input"
              >
                <option value="any">Any Style</option>
                <option value="classic">Classic</option>
                <option value="trendy">Trendy</option>
                <option value="bohemian">Bohemian</option>
                <option value="minimalist">Minimalist</option>
                <option value="sporty">Sporty</option>
                <option value="elegant">Elegant</option>
                <option value="edgy">Edgy</option>
                <option value="traditional">Traditional</option>
              </select>
            </div>
          </div>

          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.9rem' }}>
              💡 Tip: We'll suggest outfits based on underutilized items and avoid recent combinations
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGetRecommendations}
            className="form-submit"
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            {generating ? '⏳ Generating...' : '✨ Get My Outfit Recommendations'}
          </button>
        </div>
      </div>

      {/* Recommendations Display */}
      {showResults && (
        <div style={{ padding: '2rem' }}>
          <h2 style={{ 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: '2rem',
            fontSize: '1.8rem'
          }}>
            Your Personalized Outfits
          </h2>
          
          {recommendations.length === 0 ? (
            <div className="form-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '3rem', margin: 0 }}>✨</p>
              <h3 style={{ color: 'white', marginTop: '1rem' }}>No matching outfits found</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                Try changing the occasion, weather, or formality filters to see different combinations.
                {wardrobe.length < 5 && ' Adding more items to your wardrobe will also help.'}
              </p>
            </div>
          ) : (
            <div className="recommendations-grid">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={i} recommendation={rec} index={i + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
