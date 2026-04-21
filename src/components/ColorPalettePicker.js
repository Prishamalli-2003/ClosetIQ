import { COLOR_PALETTE } from '../utils/constants';

const labelFor = (name) =>
  name ? name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ') : '';

const ColorPalettePicker = ({ value, onChange, label = '🎨 Color' }) => {
  const selected = COLOR_PALETTE.find((c) => c.name === value);

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

      <div className="color-swatch-grid">
        {COLOR_PALETTE.map((color) => (
          <div key={color.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <button
              type="button"
              title={`${labelFor(color.name)} — ${color.hex.toUpperCase()}`}
              className={`color-swatch ${value === color.name ? 'color-swatch--selected' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => onChange?.(color.name)}
            >
              {value === color.name && (
                <span className="swatch-check">✓</span>
              )}
            </button>
            <span style={{
              fontSize: '0.55rem',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'monospace',
              letterSpacing: '0.02em',
              lineHeight: 1,
              textAlign: 'center',
            }}>
              {color.hex.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <span style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: selected.hex, border: '2px solid rgba(255,255,255,0.4)', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>
            {labelFor(selected.name)}
          </span>
          <code style={{ background: 'rgba(255,255,255,0.15)', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.8rem', color: 'white', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {selected.hex.toUpperCase()}
          </code>
        </div>
      )}
    </div>
  );
};

export default ColorPalettePicker;
