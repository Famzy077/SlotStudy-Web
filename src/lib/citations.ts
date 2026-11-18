/**
 * Utility functions for cleaning and formatting RAG retrieval citations in AI Tutor responses.
 *
 * Replaces raw chunk references (e.g. `[Source: [Source 1, Chunk 8], [Source 3, Chunk 9]]`
 * or `[Source 1, Chunk 8]`) with clean, subtle page badges (e.g. `Page 11`),
 * and strips ungrounded or empty chunk IDs so text reads naturally.
 */

export interface SourceMetadata {
  pageNumber?: number | string;
  page?: number | string;
  fileName?: string;
  filename?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  [key: string]: unknown;
}

/**
 * Resolves a page reference or source title from the sources array.
 */
function resolveSourcePage(
  sourceIndexOrNum: string | number,
  sources: SourceMetadata[] = [],
): string | null {
  const num = typeof sourceIndexOrNum === 'string' ? parseInt(sourceIndexOrNum, 10) : sourceIndexOrNum;
  if (isNaN(num)) return null;
  const idx = num - 1; // Sources are 1-based in text: "Source 1" -> index 0
  if (idx >= 0 && idx < sources.length) {
    const src = sources[idx];
    const page = src?.pageNumber ?? src?.page ?? (src?.metadata as Record<string, unknown> | undefined)?.pageNumber;
    if (page !== undefined && page !== null && String(page).trim() !== '') {
      return String(page).trim();
    }
  }
  return null;
}

/**
 * Cleans raw RAG retrieval metadata and converts citations into markdown links
 * formatted as `[Page X](#source-pX)` which MarkdownRenderer renders as compact pill badges.
 */
export function cleanAndFormatCitations(
  text: string,
  sources: unknown[] = [],
): string {
  if (!text) return '';

  const typedSources = sources as SourceMetadata[];

  let formatted = text;

  // 1. Convert direct parenthetical or bracketed page references first:
  // e.g. "(p. 11)", "(pp. 11-12)", "(Page 11)", "[p. 11]", "[Page 14]"
  formatted = formatted.replace(
    /(?:\(|\[)\s*(?:pp?\.?|pages?)\s*(\d+(?:[–-]\d+)?)\s*(?:\)|\])/gi,
    ' <<PAGE:$1>> ',
  );

  // 2. Handle nested/multi sources:
  // e.g. [Source: [Source 1, Chunk 8], [Source 3, Chunk 9]] or [Sources: [Source 1, Chunk 8]]
  formatted = formatted.replace(
    /\[\s*(?:Sources?|References?)\s*:\s*([^\]]+\](?:\s*,\s*\[[^\]]+\])*)\]/gi,
    (_match, inner: string) => {
      const items = inner.match(/\[[^\]]+\]/g) || [inner];
      const pills: string[] = [];
      for (const item of items) {
        const cleanItem = item.replace(/^\[|\]$/g, '');
        const pageMatch = cleanItem.match(/(?:page|p\.?)\s*(\d+(?:[–-]\d+)?)/i);
        const srcMatch = cleanItem.match(/source\s*(\d+)/i);
        let page = pageMatch ? pageMatch[1] : null;
        if (!page && srcMatch) {
          page = resolveSourcePage(srcMatch[1], typedSources);
        }
        if (page) {
          pills.push(`<<PAGE:${page}>>`);
        }
      }
      return pills.length ? ` ${pills.join(' ')} ` : ' ';
    },
  );

  // 3. Handle single [Source: ...] or [Source 1, Chunk 8, Page 11]
  formatted = formatted.replace(
    /\[\s*(?:Sources?|References?)\s*:\s*([^\]]+)\]/gi,
    (_match, inner: string) => {
      const pageMatch = inner.match(/(?:page|p\.?)\s*(\d+(?:[–-]\d+)?)/i);
      const srcMatch = inner.match(/source\s*(\d+)/i);
      let page = pageMatch ? pageMatch[1] : null;
      if (!page && srcMatch) {
        page = resolveSourcePage(srcMatch[1], typedSources);
      }
      if (page) return ` <<PAGE:${page}>> `;
      return ' ';
    },
  );

  // 4. Handle [Source X, Chunk Y, Page Z] or [Source X, Chunk Y] or [Source X]
  formatted = formatted.replace(
    /\[\s*Source\s*(\d+)?\s*(?:,\s*Chunk\s*\d+)?\s*(?:,\s*(?:Page|p\.?)\s*(\d+(?:[–-]\d+)?))?\s*\]/gi,
    (_match, srcNum?: string, pageNum?: string) => {
      let page = pageNum;
      if (!page && srcNum) {
        page = resolveSourcePage(srcNum, typedSources) || undefined;
      }
      if (page) return ` <<PAGE:${page}>> `;
      // If it was raw chunk/source metadata with no page, strip it cleanly
      return ' ';
    },
  );

  // 5. Handle standalone chunk references like [Chunk 8] or (Chunk 8)
  formatted = formatted.replace(/\[\s*Chunk\s*\d+\s*\]/gi, ' ');
  formatted = formatted.replace(/\(\s*Chunk\s*\d+\s*\)/gi, ' ');

  // 6. Convert internal <<PAGE:X>> tokens into markdown links for CitationPill rendering
  formatted = formatted.replace(/<<PAGE:([^>]+)>>/g, '[Page $1](#source-p$1)');

  // 7. Clean up extra spaces and punctuation artifacts (e.g. "word , next" -> "word, next")
  formatted = formatted.replace(/ +([.,;:!?])/g, '$1');
  formatted = formatted.replace(/  +/g, ' ');

  return formatted.trim();
}
