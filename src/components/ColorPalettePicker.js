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
          <span className="label-hint">
            {labelFor(selected.name)} — <code>{selected.hex.toUpperCase()}</code>
          </span>
        )}
      </label>

      <div className="color-swatch-grid">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color.name}
            type="button"
            title={`${labelFor(color.name)} ${color.hex.toUpperCase()}`}
            className={`color-swatch ${value === color.name ? 'color-swatch--selected' : ''}`}
            style={{ backgroundColor: color.name === 'multi'
              ? 'linear-gradient(135deg,#ff6b6b,#4ecdc4,#ffe66d)'
              : color.hex
            }}
            onClick={() => onChange?.(color.name)}
          >
            {color.name === 'multi' && (
              <span className="swatch-multi">🌈</span>
            )}
            {value === color.name && color.name !== 'multi' && (
              <span className="swatch-check">✓</span>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <p className="color-hex-display">
          <span
            className="color-hex-dot"
            style={{ backgroundColor: selected.hex }}
          />
          {labelFor(selected.name)} &nbsp;·&nbsp; <code>{selected.hex.toUpperCase()}</code>
        </p>
      )}
    </div>
  );
};

export default ColorPalettePicker;
