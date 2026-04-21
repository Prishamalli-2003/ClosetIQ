import { useState } from 'react';
import { COLOR_PALETTE } from '../utils/constants';

const labelFor = (name) =>
  name ? name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ') : '';

// Derive a readable name from a hex code
const nameFromHex = (hex) => {
  const clean = hex.replace('#', '').toLowerCase();
  return `custom-${clean.slice(0, 6)}`;
};

// Check if hex is valid
const isValidHex = (hex) => /^#?[0-9a-fA-F]{6}$/.test(hex.trim());

// Normalise to #RRGGBB
const normaliseHex = (hex) => {
  const clean = hex.trim().replace('#', '');
  return `#${clean.toUpperCase()}`;
};

// Decide white or black text for contrast
const contrastText = (hex) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1a1a1a' : '#ffffff';
};

const ColorPalettePicker = ({ value, onChange, label = '🎨 Color' }) => {
  const [customColors, setCustomColors] = useState([]); // { name, hex }[]
  const [hexInput, setHexInput] = useState('');
  const [hexError, setHexError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const allColors = [...COLOR_PALETTE, ...customColors];
  const selected = allColors.find((c) => c.name === value);

  const handleAddColor = () => {
    const raw = hexInput.trim();
    if (!isValidHex(raw)) {
      setHexError('Enter a valid 6-digit hex code, e.g. #FF5733');
      return;
    }
    const hex = normaliseHex(raw);
    // Check not already in palette
    if (allColors.find(c => c.hex.toUpperCase() === hex)) {
      const existing = allColors.find(c => c.hex.toUpperCase() === hex);
      onChange?.(existing.name);
      setHexInput('');
      setHexError('');
      setShowAdd(false);
      return;
    }
    const name = nameFromHex(hex);
    const newColor = { name, hex };
    setCustomColors(prev => [...prev, newColor]);
    onChange?.(name);
    setHexInput('');
    setHexError('');
    setShowAdd(false);
  };

  const previewHex = isValidHex(hexInput) ? normaliseHex(hexInput) : null;

  return (
    <div className="form-group color-palette-picker">
      <label className="form-label">
        {label}
        {selected && (
          <span className="label-hint" style={{ fontFamily: 'monospace', letterSpacing: '0.03em' }}>
            {labelFor(selected.name)} · {selected.hex.toUpperCase()}
          </span>
        )}
      </label>

      {/* Swatch grid */}
      <div className="color-swatch-grid">
        {allColors.map((color) => (
          <div key={color.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <button
              type="button"
              title={`${labelFor(color.name)} — ${color.hex.toUpperCase()}`}
              className={`color-swatch ${value === color.name ? 'color-swatch--selected' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => onChange?.(color.name)}
            >
              {value === color.name && (
                <span className="swatch-check" style={{ color: contrastText(color.hex) }}>✓</span>
              )}
            </button>
            <span style={{
              fontSize: '0.52rem', color: 'rgba(255,255,255,0.65)',
              fontFamily: 'monospace', letterSpacing: '0.01em', lineHeight: 1, textAlign: 'center',
            }}>
              {color.hex.toUpperCase()}
            </span>
          </div>
        ))}

        {/* + Add custom color button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <button
            type="button"
            title="Add custom color"
            className="color-swatch"
            style={{ backgroundColor: previewHex || 'rgba(255,255,255,0.15)', border: '2px dashed rgba(255,255,255,0.5)' }}
            onClick={() => setShowAdd(!showAdd)}
          >
            <span style={{ color: 'white', fontSize: '1.1rem', lineHeight: 1 }}>+</span>
          </button>
          <span style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>
            ADD
          </span>
        </div>
      </div>

      {/* Add custom color panel */}
      {showAdd && (
        <div style={{
          marginTop: '0.75rem', padding: '1rem',
          background: 'rgba(255,255,255,0.12)', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '0.88rem', margin: '0 0 0.6rem' }}>
            Add a custom colour
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Native colour picker */}
            <input
              type="color"
              value={previewHex || '#667eea'}
              onChange={(e) => { setHexInput(e.target.value); setHexError(''); }}
              style={{ width: 44, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'none' }}
              title="Pick a colour"
            />
            {/* Hex text input */}
            <input
              type="text"
              className="form-input"
              placeholder="#FF5733"
              value={hexInput}
              maxLength={7}
              onChange={(e) => { setHexInput(e.target.value); setHexError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddColor()}
              style={{ flex: 1, minWidth: 100, maxWidth: 140, fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '0.05em' }}
            />
            {/* Preview swatch */}
            {previewHex && (
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                backgroundColor: previewHex,
                border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '0.6rem', color: contrastText(previewHex), fontFamily: 'monospace', fontWeight: 700 }}>
                  {previewHex}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleAddColor}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', border: 'none', borderRadius: 8,
                padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setHexInput(''); setHexError(''); }}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.88rem' }}
            >
              Cancel
            </button>
          </div>
          {hexError && (
            <p style={{ color: '#fca5a5', fontSize: '0.8rem', margin: '0.4rem 0 0' }}>{hexError}</p>
          )}
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
            Tip: Use the colour picker or type a hex code like #FF5733. The colour will be added to your palette.
          </p>
        </div>
      )}

      {/* Selected colour display */}
      {selected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            backgroundColor: selected.hex,
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'inline-block', flexShrink: 0,
          }} />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.88rem', fontWeight: 500 }}>
            {labelFor(selected.name)}
          </span>
          <code style={{
            background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.5rem',
            borderRadius: 5, fontSize: '0.82rem', color: 'white',
            fontFamily: 'monospace', letterSpacing: '0.05em',
          }}>
            {selected.hex.toUpperCase()}
          </code>
        </div>
      )}
    </div>
  );
};

export default ColorPalettePicker;
