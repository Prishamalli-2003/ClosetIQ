export const formatINR = (amount, options = {}) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '₹—';

  const maximumFractionDigits = options.maximumFractionDigits ?? 0;
  const minimumFractionDigits = options.minimumFractionDigits ?? 0;

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits,
      minimumFractionDigits,
    }).format(value);
  } catch {
    const rounded =
      maximumFractionDigits === 0 ? Math.round(value) : Number(value.toFixed(maximumFractionDigits));
    return `₹${rounded}`;
  }
};

