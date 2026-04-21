import { calculateAdjustedCostPerWear } from '../services/analyticsLogic';
import { formatINR } from '../utils/currency';
import { COLOR_PALETTE } from '../utils/constants';

const ColorDot = ({ color }) => {
  const found = COLOR_PALETTE.find(c => c.name === color);
  const hex = found?.hex || '#ccc';
  const label = color ? color.charAt(0).toUpperCase() + color.slice(1).replace('-', ' ') : '—';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{
        display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
        backgroundColor: hex, border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0,
      }} title={hex} />
      <span>{label}</span>
      <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>{hex.toUpperCase()}</span>
    </span>
  );
};

const ClothingItem = ({ item, id, onDelete }) => {
  const { name, category, type, color, imageUrl, wearCount, purchasePrice } = item || {};
  const cpw = calculateAdjustedCostPerWear(purchasePrice ?? 0, wearCount ?? 0);

  return (
    <div className="clothing-item-card">
      <div className="clothing-item-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || 'Clothing'}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
          {name || category}
        </div>
      </div>
      <div className="clothing-item-info">
        <h3>{name || 'Unnamed item'}</h3>
        <p><strong>Category:</strong> {category}</p>
        <p><strong>Type:</strong> {type?.replace('-', ' ')}</p>
        <p><strong>Color:</strong> <ColorDot color={color} /></p>
        {item?.description && <p style={{ fontSize: '0.72rem', color: '#6b7280', fontStyle: 'italic', lineHeight: 1.4, margin: '0.2rem 0' }}>{item.description}</p>}
        <p><strong>Worn:</strong> {wearCount ?? 0}×</p>
        <p><strong>CPW:</strong> {formatINR(cpw, { maximumFractionDigits: 0 })}</p>
        {onDelete && (
          <button type="button" className="btn-delete" onClick={() => onDelete(id)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default ClothingItem;
