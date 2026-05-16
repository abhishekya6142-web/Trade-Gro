export function formatCurrency(value: number, showSign = false): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  let formatted = '';
  if (absValue >= 10000000) {
    formatted = `₹${(absValue / 10000000).toFixed(2)} Cr`;
  } else if (absValue >= 100000) {
    formatted = `₹${(absValue / 100000).toFixed(2)} L`;
  } else {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(absValue);
  }

  if (showSign) {
    return isNegative ? `-${formatted}` : `+${formatted}`;
  }
  return isNegative ? `-${formatted}` : formatted;
}

export function formatPercent(value: number): string {
  const isNegative = value < 0;
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  return isNegative ? `-${formatted}` : `+${formatted}`;
}