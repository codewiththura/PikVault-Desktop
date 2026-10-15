/**
 * Normalizes text by converting to lowercase and stripping non-alphanumeric characters
 * (hyphens, underscores, dots, spaces, slashes, punctuation).
 * E.g. "abc-58" -> "abc58", "abc 58" -> "abc58", "abc_58" -> "abc58"
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/**
 * Checks if target text matches the search query.
 * Supports:
 * 1. Direct case-insensitive substring match (e.g. "abc" in "abc-58")
 * 2. Delimiter-normalized match (e.g. "abc-58" matches "abc 58", "abc58", "abc_58", and vice-versa)
 * 3. Multi-token match where all query tokens appear in target
 */
export function matchesSearchText(target: string | undefined | null, query: string): boolean {
  if (!target || !query) return false;
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return false;

  const cleanTarget = target.toLowerCase();

  // 1. Exact case-insensitive substring match
  if (cleanTarget.includes(cleanQuery)) {
    return true;
  }

  // 2. Normalized alphanumeric match (stripping -, _, spaces, dots, etc.)
  const normTarget = normalizeSearchText(target);
  const normQuery = normalizeSearchText(query);

  if (normQuery && normTarget.includes(normQuery)) {
    return true;
  }

  // 3. Token-based matching: split query into individual words/tokens
  const queryTokens = cleanQuery.split(/[\s\-_.,/\\:;()[\]{}+]+/).filter(Boolean);
  if (queryTokens.length > 1) {
    const allTokensMatch = queryTokens.every((token) => {
      const normToken = normalizeSearchText(token);
      return cleanTarget.includes(token) || (normToken.length > 0 && normTarget.includes(normToken));
    });
    if (allTokensMatch) {
      return true;
    }
  }

  return false;
}
