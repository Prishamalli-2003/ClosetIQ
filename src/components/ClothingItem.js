import { calculateAdjustedCostPerWear } from '../services/analyticsLogic';
import { formatINR } from '../utils/currency';

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
        <p><strong>Type:</strong> {type}</p>
        <p><strong>Color:</strong> {color}</p>
        <p><strong>Worn:</strong> {wearCount ?? 0} times</p>
        <p><strong>Cost per wear (type-adjusted):</strong> {formatINR(cpw, { maximumFractionDigits: 0 })}</p>
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
