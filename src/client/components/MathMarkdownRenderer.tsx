import React, { useMemo } from 'react';
import { renderMathAndMarkdown } from '../utils/mathMarkdown.js';
import { MediaAsset } from '../types/index.js';

interface MathMarkdownRendererProps {
  content: string | null | undefined;
  mediaMap?: Record<string, MediaAsset>;
  className?: string;
}

export const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({
  content,
  mediaMap = {},
  className = ''
}) => {
  const renderedHtml = useMemo(() => {
    return renderMathAndMarkdown(content, mediaMap);
  }, [content, mediaMap]);

  if (!content) return null;

  return (
    <div
      className={`markdown-body text-slate-200 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
