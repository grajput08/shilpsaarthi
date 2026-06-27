/** Small presentation helpers shared across the apps. */

/** Demo dashboard: raw DB counts are scaled for ministry-style headline figures (500 → 5L). */
export const DASHBOARD_COUNT_SCALE = 1000;

const CRORE = 1_00_00_000;
const LAKH = 1_00_000;
const THOUSAND = 1_000;

function trimCompactDecimals(value: number, maxDecimals = 2): string {
  return value
    .toFixed(maxDecimals)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*[1-9])0+$/, '$1');
}

/** Indian compact notation: 5L, 85K, 1.2Cr */
export function formatIndianCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= CRORE) return `${trimCompactDecimals(value / CRORE)}Cr`;
  if (abs >= LAKH) return `${trimCompactDecimals(value / LAKH)}L`;
  if (abs >= THOUSAND) return `${trimCompactDecimals(value / THOUSAND)}K`;
  return value.toLocaleString('en-IN');
}

export function scaleDashboardCount(raw: number): number {
  return raw * DASHBOARD_COUNT_SCALE;
}

/** Scale a raw count and format for dashboard display (500 → 5L). */
export function formatDashboardCount(raw: number): string {
  return formatIndianCompact(scaleDashboardCount(raw));
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  if (phone.length < 4) return phone;
  return `${'•'.repeat(phone.length - 4)}${phone.slice(-4)}`;
}

/** Field PWA display: +91 94251 ••• 12 */
export function formatFieldPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('91') && digits.length > 10 ? digits.slice(2) : digits;
  if (local.length < 4) return maskPhone(phone);
  return `+91 ${local.slice(0, 5)} ••• ${local.slice(-2)}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(value: string | null | undefined): string {
  if (!value) return '—';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '—';
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (Math.abs(mins) < 1) return 'just now';
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export interface CompletenessInput {
  basicComplete: boolean;
  addressComplete: boolean;
  gpsCaptured: boolean;
  consentCaptured: boolean;
  craftComplete: boolean;
  productPhotos: boolean;
  documentsChecked: boolean;
  decisionPresent: boolean;
}

/** Data-quality score (0-100) per the eight POC completeness signals. */
export function computeCompleteness(input: CompletenessInput): number {
  const checks = [
    input.basicComplete,
    input.addressComplete,
    input.gpsCaptured,
    input.consentCaptured,
    input.craftComplete,
    input.productPhotos,
    input.documentsChecked,
    input.decisionPresent,
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}
