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
 * Formats ISO date string into human-friendly relative time
 * (e.g., "Just now", "20 days ago", "1 month ago", "2 months ago", "1 year ago", "2 years ago")
 */
export function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'Never';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return 'Just now';

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours < 1) {
        if (diffMin < 1) return 'Just now';
        return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }

    if (diffDays === 1) {
      return '1 day ago';
    }

    if (diffDays < 30) {
      return `${diffDays} days ago`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    }

    const diffYears = Math.floor(diffDays / 365);
    return diffYears <= 1 ? '1 year ago' : `${diffYears} years ago`;
  } catch {
    return isoString;
  }
}

/**
 * Checks if a date is older than a specified number of days (default: 30 days = ~1 month)
 */
export function isOlderThanDays(isoString?: string, daysThreshold: number = 30): boolean {
  if (!isoString) return true;
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= daysThreshold;
  } catch {
    return false;
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

