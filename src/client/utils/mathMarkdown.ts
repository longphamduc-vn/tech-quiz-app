import katex from 'katex';
import { marked } from 'marked';
import { MediaAsset } from '../types/index.js';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true
});

/**
 * Utility function to render mathematical formulas (KaTeX), Markdown, and Media Tags.
 * 
 * Pipeline:
 * 1. Tokenize LaTeX formulas ($$display$$ and $inline$) to protect them from markdown parsing
 * 2. Parse Markdown formatting with marked.parse()
 * 3. Replace <!-- media:KEY --> tags with interactive HTML media containers
 * 4. Render KaTeX formulas and restore into HTML
 */
export function renderMathAndMarkdown(
  text: string | null | undefined,
  mediaMap: Record<string, MediaAsset> = {}
): string {
  if (!text) return '';

  const mathStore: Array<{ placeholder: string; math: string; displayMode: boolean }> = [];
  let tokenCounter = 0;

  // 1. Protect Block Math: $$...$$
  let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
    const placeholder = `%%KATEX_BLOCK_${tokenCounter++}%%`;
    mathStore.push({ placeholder, math, displayMode: true });
    return placeholder;
  });

  // Protect Inline Math: $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_match, math) => {
    const placeholder = `%%KATEX_INLINE_${tokenCounter++}%%`;
    mathStore.push({ placeholder, math, displayMode: false });
    return placeholder;
  });

  // 2. Parse Markdown using marked
  let html = '';
  try {
    const rawParsed = marked.parse(processed);
    html = typeof rawParsed === 'string' ? rawParsed : (rawParsed as any).toString();
  } catch (err) {
    console.error('Markdown parse error:', err);
    html = processed;
  }

  // 3. Custom HTML Comment Replacer: <!-- media:KEY -->
  html = html.replace(/<!--\s*media:([\w-]+)\s*-->/g, (_match, key) => {
    const media = mediaMap[key];
    if (media && media.url) {
      const alt = media.alt_text ? escapeHtml(media.alt_text) : key;
      const caption = media.caption ? escapeHtml(media.caption) : '';
      return `
        <div class="media-container">
          <img src="${media.url}" alt="${alt}" class="media-trigger cursor-zoom-in" data-url="${media.url}" data-caption="${caption}" />
          ${caption ? `<p class="caption">${caption}</p>` : ''}
        </div>
      `.trim();
    } else {
      return `
        <div class="media-container border-dashed border-amber-500/40 bg-amber-950/20 py-3 px-4">
          <span class="text-amber-400 text-xs font-mono">⚠️ Media asset [${escapeHtml(key)}] not found</span>
        </div>
      `.trim();
    }
  });

  // 4. Restore KaTeX rendered formulas
  for (const item of mathStore) {
    let renderedMath = '';
    try {
      renderedMath = katex.renderToString(item.math, {
        displayMode: item.displayMode,
        throwOnError: false
      });
    } catch (err: any) {
      renderedMath = `<span class="text-rose-400 font-mono text-sm">${escapeHtml(err.message || 'LaTeX Error')}</span>`;
    }
    html = html.split(item.placeholder).join(renderedMath);
  }

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
