import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return "₹0.00";
  
  const absValue = Math.abs(value);
  let formatted = "";
  
  if (absValue >= 10000000) {
    formatted = `₹${(absValue / 10000000).toFixed(2)} Cr`;
  } else if (absValue >= 100000) {
    formatted = `₹${(absValue / 100000).toFixed(2)} L`;
  } else {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(absValue);
  }
  
  return value < 0 ? `-${formatted}` : formatted;
}

export function formatPNL(value: number | undefined | null): string {
  if (value === undefined || value === null) return "₹0.00";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return "0.00%";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}
