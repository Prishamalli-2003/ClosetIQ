import useUserProfile from '../services/useUserProfile';

const FEMALE_QUOTES = [
  "Style is a way to say who you are without having to speak.",
  "Fashion is the armor to survive the reality of everyday life.",
  "Dress how you want to be addressed.",
  "Your wardrobe is your story — make it a good one.",
  "Confidence is the best outfit. Rock it and own it.",
  "Life is too short to wear boring clothes.",
  "Elegance is not about being noticed, it's about being remembered.",
  "A woman who wears her confidence is always in style.",
  "Invest in your wardrobe, invest in yourself.",
  "Every outfit is a chance to tell your story.",
];

const MALE_QUOTES = [
  "Style is knowing who you are and what you want to say.",
  "Dress well, live well.",
  "A man's wardrobe is his armor.",
  "Confidence starts with how you dress.",
  "Your style speaks before you do.",
  "Dress for the life you want.",
  "A well-dressed man is always remembered.",
  "Invest in quality, not quantity.",
  "Style is the answer to everything.",
  "Look good, feel good, do good.",
];

const NEUTRAL_QUOTES = [
  "Your wardrobe, your story.",
  "Dress for the day you want to have.",
  "Style is self-expression.",
  "Every outfit is a fresh start.",
  "Wear what makes you feel alive.",
];

const PageHeader = ({ title, subtitle }) => {
  const { firstName, gender } = useUserProfile();

  const quotes = gender === 'female' ? FEMALE_QUOTES : gender === 'male' ? MALE_QUOTES : NEUTRAL_QUOTES;
  // Pick a consistent quote based on day of month so it changes daily
  const quote = quotes[new Date().getDate() % quotes.length];

  const displayTitle = title.replace('{name}', firstName || 'Your');

  return (
    <div className="page-header-block">
      <h1 className="form-title">{displayTitle}</h1>
      {subtitle && <p className="form-subtitle">{subtitle}</p>}
      {firstName && (
        <div className="page-header-quote">
          <span className="quote-icon">✨</span>
          <span>"{quote}"</span>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
