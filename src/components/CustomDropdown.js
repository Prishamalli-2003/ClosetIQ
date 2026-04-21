import { useState } from 'react';

const CustomDropdown = ({ 
  label = '', 
  value, 
  onChange, 
  options = [], 
  customOptions = [], 
  onAddCustom,
  placeholder = "Select an option"
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const allOptions = [...(options || []), ...(customOptions || [])];

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'other') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      onChange(selectedValue);
    }
  };

  const handleCustomSubmit = async () => {
    if (customValue.trim() && onAddCustom) {
      const success = await onAddCustom(customValue.trim());
      if (success) {
        onChange(customValue.trim());
        setCustomValue('');
        setShowCustomInput(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="form-input-wrapper">
        <select 
          value={showCustomInput ? 'other' : value} 
          onChange={handleSelectChange}
          className="form-select"
        >
          <option value="">{placeholder}</option>
          {allOptions.map(option => (
            <option key={option} value={option}>
              {option ? option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ') : ''}
            </option>
          ))}
          <option value="other">Other (specify)</option>
        </select>
      </div>
      
      {showCustomInput && (
        <div className="custom-input-section">
          <div className="custom-input-wrapper">
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Enter custom ${label ? label.toLowerCase() : 'value'}`}
              className="form-input custom-input"
              autoFocus
            />
            <div className="custom-input-buttons">
              <button type="button" onClick={handleCustomSubmit} className="btn-custom-add">
                Add
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomValue('');
                }}
                className="btn-custom-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;