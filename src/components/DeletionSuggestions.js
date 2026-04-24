import { useState } from 'react';
import { suggestItemsForDeletion } from '../services/analyticsLogic';
import { COLOR_PALETTE } from '../utils/constants';
import { formatINR } from '../utils/currency';
import { calculateAdjustedCostPerWear } from '../services/analyticsLogic';

const ColorDot = ({ color }) => {
  const found = COLOR_PALETTE.find(c => c.name === color);
  const hex = found?.hex || '#ccc';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: hex, border: '1px solid rgba(0,0,0,0.15)', display: 'inline-block', flexShrink: 0 }} />
      <span style={{ textTransform: 'capitalize' }}>{color}</span>
      <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontFamily: 'monospace' }}>{hex.toUpperCase()}</span>
    </span>
  );
};

const DeletionSuggestions = ({ items, onDeleteItem, maxItems = 50 }) => {
  const [show, setShow] = useState(false);
  const suggestions = suggestItemsForDeletion(items, maxItems);

  if (suggestions.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <p style={{ color: 'white', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>
            🧹 Wardrobe Cleanup — {suggestions.length} suggestions
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', margin: '0.15rem 0 0', fontSize: '0.8rem' }}>
            {items.length} items total · these haven't been worn recently
          </p>
        </div>
        <button
          onClick={() => setShow(!show)}
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
        >
          {show ? 'Hide' : 'Show'} ({suggestions.length})
        </button>
      </div>

      {show && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {suggestions.map(item => {
            const cpw = calculateAdjustedCostPerWear(item.purchasePrice ?? 0, item.wearCount ?? 0);
            const cpwText = cpw === null ? 'Not worn' : formatINR(cpw, { maximumFractionDigits: 0 });
            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(255,255,255,0.92)', borderRadius: 12,
                padding: '0.6rem 0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                {/* Thumbnail */}
                <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center', padding: 4 }}>{item.name}</div>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                    <ColorDot color={item.color} /> · {item.category}
                  </p>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: '#ef4444' }}>{item.reason}</p>
                </div>

                {/* Stats + action */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280' }}>Worn {item.wearCount ?? 0}×</p>
                  <p style={{ margin: '0.1rem 0 0.4rem', fontSize: '0.72rem', color: '#6b7280' }}>CPW {cpwText}</p>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeletionSuggestions;
