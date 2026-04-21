import { useState } from 'react';
import { suggestItemsForDeletion } from '../services/analyticsLogic';

const DeletionSuggestions = ({ items, onDeleteItem, maxItems = 50 }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = suggestItemsForDeletion(items, maxItems);

  if (suggestions.length === 0) return null;

  return (
    <div className="deletion-suggestions">
      <div className="suggestion-header">
        <h3>🧹 Wardrobe Cleanup Suggestions</h3>
        <p>Your wardrobe has {items.length} items. Consider decluttering these underused pieces:</p>
        <button 
          className="btn-secondary"
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          {showSuggestions ? 'Hide' : 'Show'} Suggestions ({suggestions.length})
        </button>
      </div>

      {showSuggestions && (
        <div className="suggestions-list">
          {suggestions.map(item => (
            <div key={item.id} className="suggestion-item">
              <div className="suggestion-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} />
                ) : (
                  <div className="placeholder">No image</div>
                )}
              </div>
              <div className="suggestion-info">
                <h4>{item.name}</h4>
                <p className="suggestion-reason">{item.reason}</p>
                <div className="suggestion-stats">
                  <span>Worn: {item.wearCount || 0} times</span>
                  {item.purchasePrice && (
                    <span>Cost per wear: ₹{((item.purchasePrice || 0) / Math.max(item.wearCount || 1, 1)).toFixed(0)}</span>
                  )}
                </div>
              </div>
              <div className="suggestion-actions">
                <button 
                  className="btn-delete"
                  onClick={() => onDeleteItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletionSuggestions;