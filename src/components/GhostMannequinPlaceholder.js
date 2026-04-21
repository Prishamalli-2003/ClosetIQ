/**
 * Ghost mannequin–style frame for clothing photo uploads (flat silhouette, no photo of a person).
 */
const GhostMannequinPlaceholder = ({ caption = 'Lay your garment flat or hang it — like a catalog shot' }) => (
  <div className="ghost-mannequin-frame" aria-hidden="true">
    <svg
      className="ghost-mannequin-svg"
      viewBox="0 0 200 260"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gm-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="38" rx="22" ry="26" fill="url(#gm-fill)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
      <path
        d="M100 64 L100 68 M72 78 Q60 82 52 98 L42 138 Q40 148 48 152 L58 150 L64 118 L70 108 L70 175 L68 218 L78 222 L82 178 L84 115 L100 105 L116 115 L118 178 L122 222 L132 218 L130 175 L130 108 L136 118 L142 150 L152 152 Q160 148 158 138 L148 98 Q140 82 128 78 Q115 72 100 72 Q85 72 72 78 Z"
        fill="url(#gm-fill)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="100" y1="105" x2="100" y2="175" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    </svg>
    <p className="ghost-mannequin-caption">{caption}</p>
  </div>
);

export default GhostMannequinPlaceholder;
