import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen } from 'lucide-react';

interface MarkdownRendererProps {
  children: string;
  onCitationClick?: (page: string) => void;
}

export default function MarkdownRenderer({
  children,
  onCitationClick,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children: linkChildren, ...props }) => {
          if (href?.startsWith('#source-')) {
            const pageRef = href.replace('#source-', '').replace(/^p/, '');
            return (
              <button
                type="button"
                className="citation-pill"
                title={`Course material reference · Page ${pageRef}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCitationClick?.(pageRef);
                }}
              >
                <BookOpen size={10} className="citation-pill-icon" />
                <span>{linkChildren}</span>
              </button>
            );
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {linkChildren}
            </a>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
