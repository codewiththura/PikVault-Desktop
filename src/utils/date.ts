/**
 * Formats ISO date string into readable desktop timestamp
 */
export function formatDateTime(isoString?: string): string {
  if (!isoString) return 'Never';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Formats date-only (YYYY-MM-DD)
 */
export function formatDateOnly(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Returns current date ISO string
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Returns current date formatted as YYYY-MM-DD for date inputs
 */
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}
