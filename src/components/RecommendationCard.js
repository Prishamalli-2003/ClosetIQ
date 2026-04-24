const ItemTile = ({ label, item }) => {
  if (!item) return null;
  return (
    <div className="rec-item-tile">
      <span className="rec-item-label">{label}</span>
      <div className="rec-item-img-wrap">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="rec-item-fallback" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
          {item.name}
        </div>
      </div>
      <p className="rec-item-name">{item.name}</p>
      <p className="rec-item-meta">{item.color} · {item.brand || ''}</p>
    </div>
  );
};

const RecommendationCard = ({ recommendation, index }) => {
  const { top, bottom, dress, traditional, outerwear, accessory, shoes, explanation } = recommendation || {};

  return (
    <div className="recommendation-card">
      <div className="rec-card-header">
        <span className="rec-card-number">Outfit {index}</span>
      </div>

      <div className="rec-items-grid">
        <ItemTile label="👗 Dress"       item={dress} />
        <ItemTile label="🥻 Traditional" item={traditional} />
        <ItemTile label="👕 Top"         item={top} />
        <ItemTile label="👖 Bottom"      item={bottom} />
        <ItemTile label="🧥 Outerwear"   item={outerwear} />
        <ItemTile label="👜 Bag"         item={accessory} />
        <ItemTile label="👠 Shoes"       item={shoes} />
      </div>

      {explanation && (
        <div className="rec-explanation-box">
          💡 {explanation}
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
