const RecommendationCard = ({ recommendation, index }) => {
  const { top, bottom, dress, traditional, outerwear, explanation } = recommendation || {};

  return (
    <div className="recommendation-card">
      {index && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {index}
        </div>
      )}
      <div className="rec-items">
        {/* Dress (standalone outfit) */}
        {dress && (
          <div className="rec-item">
            <span className="rec-label">👗 Dress</span>
            {dress.imageUrl ? (
              <img src={dress.imageUrl} alt={dress.name} />
            ) : (
              <div className="placeholder">{dress.name}</div>
            )}
            <p><strong>{dress.name}</strong></p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {dress.color} • {dress.brand || 'No brand'}
            </p>
          </div>
        )}

        {/* Traditional wear (standalone outfit) */}
        {traditional && (
          <div className="rec-item">
            <span className="rec-label">🥻 Traditional</span>
            {traditional.imageUrl ? (
              <img src={traditional.imageUrl} alt={traditional.name} />
            ) : (
              <div className="placeholder">{traditional.name}</div>
            )}
            <p><strong>{traditional.name}</strong></p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {traditional.color} • {traditional.brand || 'No brand'}
            </p>
          </div>
        )}

        {/* Top + Bottom combination */}
        {top && (
          <div className="rec-item">
            <span className="rec-label">👕 Top</span>
            {top.imageUrl ? (
              <img src={top.imageUrl} alt={top.name} />
            ) : (
              <div className="placeholder">{top.name}</div>
            )}
            <p><strong>{top.name}</strong></p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {top.color} • {top.brand || 'No brand'}
            </p>
          </div>
        )}
        {bottom && (
          <div className="rec-item">
            <span className="rec-label">👖 Bottom</span>
            {bottom.imageUrl ? (
              <img src={bottom.imageUrl} alt={bottom.name} />
            ) : (
              <div className="placeholder">{bottom.name}</div>
            )}
            <p><strong>{bottom.name}</strong></p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {bottom.color} • {bottom.brand || 'No brand'}
            </p>
          </div>
        )}

        {/* Outerwear (optional for all outfit types) */}
        {outerwear && (
          <div className="rec-item">
            <span className="rec-label">🧥 Outerwear</span>
            {outerwear.imageUrl ? (
              <img src={outerwear.imageUrl} alt={outerwear.name} />
            ) : (
              <div className="placeholder">{outerwear.name}</div>
            )}
            <p><strong>{outerwear.name}</strong></p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {outerwear.color} • {outerwear.brand || 'No brand'}
            </p>
          </div>
        )}
      </div>
      {explanation && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          borderLeft: '3px solid #667eea'
        }}>
          <p className="rec-explanation" style={{ margin: 0, fontSize: '0.9rem' }}>
            💡 {explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
