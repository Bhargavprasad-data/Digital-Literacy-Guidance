// Simple validators for Indian mobile numbers and UPI IDs
// Mobile: 10 digits, starts with 6-9. Allows spaces or dashes which will be stripped for validation
export function normalizeMobile(input) {
  if (!input) return '';
  return String(input).replace(/\D/g, '');
}

export function isValidIndianMobile(input) {
  const digits = normalizeMobile(input);
  return /^[6-9][0-9]{9}$/.test(digits);
}

// UPI ID: strict check name@handle against a curated list of handles
const UPI_HANDLES = [
  // Major apps and bank PSPs
  'ybl',          // PhonePe (Yes Bank)
  'axl',          // Google Pay (Axis)
  'ibl',          // Google Pay (ICICI)
  'okaxis',       // Google Pay (Axis handle)
  'okhdfcbank',   // Google Pay (HDFC handle)
  'okicici',      // Google Pay (ICICI handle)
  'oksbi',        // Google Pay (SBI handle)
  'paytm',        // Paytm Payments Bank
  'upi',          // Generic UPI (BHIM)
  'icici',
  'axisbank',
  'idfcbank',
  'idfc',
  'hdfcbank',
  'kotak',
  'sbi',
  'yesbank',
  'rbl',
  'fbl',          // Federal Bank
  'aubank',
  'airtel',
  'barodampay'    // Bank of Baroda
];

const UPI_HANDLE_REGEX = new RegExp(`^(${UPI_HANDLES.join('|')})$`, 'i');

export function isValidUpiId(input) {
  if (!input) return false;
  const trimmed = String(input).trim();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [local, handle] = parts;
  // local part: 2-50 allowed chars
  if (!/^[a-zA-Z0-9._-]{2,50}$/.test(local)) return false;
  return UPI_HANDLE_REGEX.test(handle);
}

export function isValidMobileOrUpi(input) {
  return isValidIndianMobile(input) || isValidUpiId(input);
}

// UPI PIN validation: allow only digits; most banks use 4 or 6 digits
export function isValidUpiPin(input) {
  if (!input) return false;
  const digits = String(input).replace(/\D/g, '');
  return /^(\d{4}|\d{6})$/.test(digits);
}


