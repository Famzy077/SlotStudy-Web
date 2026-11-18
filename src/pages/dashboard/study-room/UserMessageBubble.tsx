import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MarkdownContent } from '../../../components/common/MarkdownContent';

interface UserMessageBubbleProps {
  content: string;
  userName?: string;
  avatar?: ReactNode;
}

export function UserMessageBubble({
  content,
  userName = 'You',
  avatar,
}: UserMessageBubbleProps) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if content exceeds 4-5 lines (~108px)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // Line count heuristic + height measurement
    const lineCount = content.split('\n').length;
    const isLongText = content.length > 250 || lineCount > 4;

    const checkHeight = () => {
      if (el.scrollHeight > 115 || isLongText) {
        setIsClamped(true);
      } else {
        setIsClamped(false);
      }
    };

    checkHeight();
    const timer = setTimeout(checkHeight, 150);
    return () => clearTimeout(timer);
  }, [content]);

  return (
    <div className="chat-message chat-message-user">
      <span className="message-avatar">
        {avatar || userName.slice(0, 1).toUpperCase() || 'U'}
      </span>
      <div className="message-body user-bubble-body">
        <div className="user-bubble-header">
          <span className="message-name">{userName}</span>
        </div>

        <div
          ref={contentRef}
          className={`user-bubble-content ${
            isClamped && !expanded ? 'user-bubble-clamped' : ''
          }`}
        >
          <div className="markdown-content">
            <MarkdownContent>{content}</MarkdownContent>
          </div>
          {isClamped && !expanded && <div className="user-bubble-fade" />}
        </div>

        {isClamped && (
          <button
            type="button"
            className="user-bubble-toggle"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <span>Show less</span>
                <ChevronUp size={13} />
              </>
            ) : (
              <>
                <span>Show more</span>
                <ChevronDown size={13} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
