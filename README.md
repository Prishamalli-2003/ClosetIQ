# ClosetIQ — Smart Wardrobe Management App

A React web app that helps you manage your wardrobe, get outfit recommendations, track wear frequency, and make smarter purchase decisions.

## Features

- **Digital Wardrobe** — Add clothing items with photos (ghost mannequin background removal via remove.bg)
- **Outfit Recommendations** — AI-powered mix & match based on occasion, weather, mood, formality, and style
- **Outfit Log** — Track what you wear daily with wear count analytics
- **Purchase Decision Support** — Check if a new item overlaps your wardrobe before buying
- **Analytics** — Cost per wear, utilization rates, wardrobe insights
- **Onboarding** — Personalized setup with gender, body type, color preferences, and style quiz
- **Mobile Responsive** — Works on iPhone/Android with hamburger nav and bottom tab bar

## Tech Stack

- React.js
- Firebase (Authentication + Firestore)
- remove.bg API (background removal for product-style photos)
- CSS with glass-morphism design

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase
Create a project at [console.firebase.google.com](https://console.firebase.google.com) with:
- Authentication (Email/Password)
- Firestore Database
- Storage (optional — app falls back to Base64 if unavailable)

Update `src/services/firebase.js` with your config.

### 3. Configure remove.bg (optional)
Get a free API key at [remove.bg/api](https://www.remove.bg/api) (50 free removals/month).

Create a `.env` file:
```
REACT_APP_REMOVE_BG_KEY=your_api_key_here
```

### 4. Run locally
```bash
npm start
```

### 5. Access on mobile
```bash
set HOST=0.0.0.0 && npm start
```
Then open `http://YOUR_WIFI_IP:3000` on your phone (both devices must be on same WiFi).

## Deploy to Vercel
```bash
npm run build
npx vercel --prod
```

## Project Structure

```
src/
├── components/
│   ├── Navigation.js          # Hamburger + bottom tabs (mobile)
│   ├── ClothingItem.js        # Wardrobe item card
│   ├── ColorPalettePicker.js  # Visual color swatch grid
│   ├── GhostMannequinPlaceholder.js
│   ├── RecommendationCard.js
│   ├── DeletionSuggestions.js
│   └── CustomDropdown.js
├── pages/
│   ├── Dashboard.js
│   ├── Wardrobe.js
│   ├── OutfitLog.js
│   ├── Recommendations.js
│   ├── PurchaseSupport.js
│   ├── Analytics.js
│   ├── Onboarding.js
│   ├── Login.js
│   └── Register.js
├── services/
│   ├── firebase.js
│   ├── imageProcessor.js      # Background removal + Base64 storage
│   ├── analyticsLogic.js
│   └── dynamicOptions.js
└── utils/
    ├── constants.js
    └── currency.js
```

## Environment Variables

| Variable | Description |
|---|---|
| `REACT_APP_REMOVE_BG_KEY` | remove.bg API key for background removal |

> Never commit `.env` to version control.
