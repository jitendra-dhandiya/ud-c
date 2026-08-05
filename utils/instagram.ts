/**
 * Instagram URL parsing, shared by the admin reel manager and the storefront
 * embed so the two can never disagree about what a valid URL looks like.
 *
 * The previous regex — /instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/ —
 * only accepted the singular `/reel/` form. Instagram hands out several other
 * shapes today, and each of them silently produced a null shortcode: no embed
 * in the admin preview, and no embed on the homepage either. From the admin's
 * side that is indistinguishable from "adding a reel doesn't work".
 *
 * Formats handled:
 *   instagram.com/reel/CODE            classic
 *   instagram.com/reels/CODE           what the web UI copies today
 *   instagram.com/p/CODE               feed post
 *   instagram.com/tv/CODE              IGTV
 *   instagram.com/share/reel/CODE      mobile share sheet
 *   instagram.com/<username>/reel/CODE profile-scoped
 * with or without www, trailing slash, or ?igsh=... tracking parameters.
 */

export type InstagramMediaType = 'reel' | 'p' | 'tv';

export interface ParsedInstagramUrl {
  shortcode: string;
  /** Which embed path to use — a feed post does not embed under /reel/. */
  type: InstagramMediaType;
}

// The optional `(?:[^/?#]+\/)?` segment absorbs a leading `share/` or a
// username. Regex backtracking means it does not interfere with plain
// /reel/CODE URLs.
const URL_PATTERN =
  /instagram\.com\/(?:[^/?#]+\/)?(reels?|p|tv)\/([A-Za-z0-9_-]+)/i;

export const parseInstagramUrl = (url: string | null | undefined): ParsedInstagramUrl | null => {
  if (!url) return null;
  const match = url.match(URL_PATTERN);
  if (!match) return null;

  const rawType = match[1].toLowerCase();
  // `reels` and `reel` are the same thing; embeds are served under /reel/.
  const type: InstagramMediaType = rawType === 'reels' || rawType === 'reel' ? 'reel' : (rawType as InstagramMediaType);

  return { shortcode: match[2], type };
};

/** Backwards-compatible helper for callers that only need the shortcode. */
export const extractShortcode = (url: string | null | undefined): string | null =>
  parseInstagramUrl(url)?.shortcode ?? null;

/**
 * Build the iframe src for a reel/post. Preserves the media type, because
 * embedding a feed post under /reel/ returns Instagram's "unavailable" page.
 */
export const buildInstagramEmbedUrl = (
  url: string | null | undefined,
  opts?: { autoplay?: boolean }
): string | null => {
  const parsed = parseInstagramUrl(url);
  if (!parsed) return null;
  const autoplay = opts?.autoplay ? '?autoplay=1&cr=1' : '';
  return `https://www.instagram.com/${parsed.type}/${parsed.shortcode}/embed/${autoplay}`;
};
