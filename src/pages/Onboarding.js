import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { saveOnboardingData } from '../services/userDataService';
import {
  COLORS,
  COLOR_PALETTE,
  STYLE_PREFERENCES,
  COMFORT_LEVELS,
  BODY_TYPES,
  FAVORITE_SPOTS,
  OUTFIT_TYPES,
} from '../utils/constants';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    gender: '',
    favoriteColors: [],
    stylePreferences: [],
    comfortLevel: '',
    bodyType: '',
    favoriteSpots: [],
    outfitOpinions: {},
  });

  const totalSteps = 6;

  const toggleArray = (key, value) => {
    setPreferences((prev) => {
      const arr = prev[key] || [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

  const setOutfitOpinion = (outfitId, rating) => {
    setPreferences((prev) => ({
      ...prev,
      outfitOpinions: { ...prev.outfitOpinions, [outfitId]: rating },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!auth.currentUser?.uid) return;
      await saveOnboardingData(preferences);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to save preferences');
    }
  };

  const getColorStyle = (color) => {
    if (color === 'multi') {
      return { background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #ffe66d)' };
    }
    const found = COLOR_PALETTE.find(c => c.name === color);
    return { backgroundColor: found?.hex || '#ccc' };
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1>Welcome to ClosetIQ</h1>
        <p className="onboarding-subtitle">Let's personalize your style journey</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
        <p className="step-indicator">Step {step} of {totalSteps}</p>
      </div>

      <form onSubmit={handleSubmit} className="onboarding-form">
        {/* Step 1: Gender */}
        {step === 1 && (
          <div className="onboarding-step">
            <h2>How do you identify?</h2>
            <p className="step-description">This helps us tailor clothing categories and recommendations for you</p>
            <div className="gender-grid">
              {[
                { value: 'female', label: 'Female', icon: '👩' },
                { value: 'male',   label: 'Male',   icon: '👨' },
                { value: 'other',  label: 'Non-binary / Other', icon: '🧑' },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  className={`gender-card ${preferences.gender === g.value ? 'selected' : ''}`}
                  onClick={() => setPreferences((p) => ({ ...p, gender: g.value }))}
                >
                  <div className="gender-icon">{g.icon}</div>
                  <div className="gender-label">{g.label}</div>
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              <button type="button" className="btn-primary" onClick={() => setStep(2)} disabled={!preferences.gender}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Body Type */}
        {step === 2 && (
          <div className="onboarding-step">
            <h2>What's your body type?</h2>
            <p className="step-description">This helps us recommend styles that flatter you</p>
            <div className="body-type-grid">
              {BODY_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`body-type-card ${preferences.bodyType === type.value ? 'selected' : ''}`}
                  onClick={() => setPreferences((p) => ({ ...p, bodyType: type.value }))}
                >
                  <div className="body-type-icon">{type.icon}</div>
                  <div className="body-type-label">{type.label}</div>
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button type="button" className="btn-primary" onClick={() => setStep(3)} disabled={!preferences.bodyType}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Favorite Colors */}
        {step === 3 && (
          <div className="onboarding-step">
            <h2>What colors do you love?</h2>
            <p className="step-description">Select all that resonate with you</p>
            <div className="color-grid">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-card ${preferences.favoriteColors.includes(color) ? 'selected' : ''}`}
                  onClick={() => toggleArray('favoriteColors', color)}
                  style={getColorStyle(color)}
                >
                  <span className="color-label">{color}</span>
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button type="button" className="btn-primary" onClick={() => setStep(4)} disabled={preferences.favoriteColors.length === 0}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Favorite Spots */}
        {step === 4 && (
          <div className="onboarding-step">
            <h2>Where do you love to dress up?</h2>
            <p className="step-description">Select your favorite occasions and spots</p>
            <div className="spots-grid">
              {FAVORITE_SPOTS.map((spot) => (
                <button
                  key={spot.value}
                  type="button"
                  className={`spot-card ${preferences.favoriteSpots.includes(spot.value) ? 'selected' : ''}`}
                  onClick={() => toggleArray('favoriteSpots', spot.value)}
                >
                  <div className="spot-image-wrap">
                    {spot.image ? (
                      <img className="spot-image" src={spot.image} alt={spot.label} loading="lazy" />
                    ) : (
                      <div className="spot-image-fallback" />
                    )}
                    <div className="spot-badge">{spot.icon}</div>
                  </div>
                  <div className="spot-label">{spot.label}</div>
                  <div className="spot-description">{spot.description}</div>
                </button>
              ))}
            </div>
            <div className="onboarding-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(3)}>Back</button>
              <button type="button" className="btn-primary" onClick={() => setStep(5)} disabled={preferences.favoriteSpots.length === 0}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Outfit Opinions */}
        {step === 5 && (
          <div className="onboarding-step">
            <h2>What do you think about these styles?</h2>
            <p className="step-description">Rate each outfit type to help us understand your preferences</p>
            <div className="outfit-opinions">
              {OUTFIT_TYPES.map((outfit) => (
                <div key={outfit.id} className="outfit-opinion-card">
                  <div className="outfit-image-container">
                    {outfit.image ? (
                      <img className="outfit-image" src={outfit.image} alt={outfit.name} loading="lazy" />
                    ) : (
                      <div className="outfit-image-placeholder" style={{ backgroundColor: outfit.color }}>
                        <span className="outfit-emoji">{outfit.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="outfit-info">
                    <h3>{outfit.name}</h3>
                    <p className="outfit-description">{outfit.description}</p>
                    <div className="rating-buttons">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          className={`rating-btn ${preferences.outfitOpinions[outfit.id] === rating ? 'selected' : ''}`}
                          onClick={() => setOutfitOpinion(outfit.id, rating)}
                        >
                          {rating === 1 ? '😕' : rating === 2 ? '🙁' : rating === 3 ? '😐' : rating === 4 ? '🙂' : '😍'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="onboarding-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(4)}>Back</button>
              <button type="button" className="btn-primary" onClick={() => setStep(6)}>Next</button>
            </div>
          </div>
        )}

        {/* Step 6: Style Preferences & Comfort */}
        {step === 6 && (
          <div className="onboarding-step">
            <h2>Final touches</h2>
            <p className="step-description">Tell us about your style philosophy</p>
            
            <div className="style-section">
              <h3>Style Preferences</h3>
              <div className="chips">
                {STYLE_PREFERENCES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={`chip ${preferences.stylePreferences.includes(style) ? 'active' : ''}`}
                    onClick={() => toggleArray('stylePreferences', style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="comfort-section">
              <h3>Comfort vs Style</h3>
              <p className="section-hint">How do you prioritize comfort vs style?</p>
              <div className="comfort-options">
                {COMFORT_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`comfort-card ${preferences.comfortLevel === level ? 'selected' : ''}`}
                    onClick={() => setPreferences((p) => ({ ...p, comfortLevel: level }))}
                  >
                    <div className="comfort-icon">
                      {level === 'comfort-first' ? '🛋️' : level === 'balanced' ? '⚖️' : '✨'}
                    </div>
                    <div className="comfort-label">{level.replace('-', ' ')}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(5)}>Back</button>
              <button type="submit" className="btn-primary">
                Complete Setup 🎉
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Onboarding;
