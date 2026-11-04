import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpenCheck, Clock3, FileText, MessageCircle, Sparkles,
} from 'lucide-react';
import type { DataObject } from '../../../types';
import { getPath, useApiQuery } from '../../../hooks/useApiQuery';
import {
  EmptyState, LoadingLine, MarkdownContent, QueryNotice,
} from '../../../components/common';

export function SummaryDetailPage() {
  const { id = '' } = useParams();
  const query = useApiQuery<DataObject>('summary', `/summaries/${id}`, !!id);
  const data = query.data || {};
  const content = String(data.content || data.summary || data.markdown || '');
  const title = String(
    data.title || getPath(data, 'material.fileName', 'Untitled summary'),
  );
  const navigate = useNavigate();

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      window.prompt('Copy your summary:', content);
    }
  }

  return (
    <div className="summary-layout">
      <article className="summary-document">
        <Link className="back-link page-back-link" to="/ai">
          <ArrowLeft size={15} /> AI summaries
        </Link>
        <QueryNotice error={query.error} />
        <span className="eyebrow">YOUR STUDY NOTES</span>
        <h1>{title}</h1>
        <div className="summary-meta">
          {data.difficulty != null && (
            <span className="difficulty-pill">{String(data.difficulty)}</span>
          )}
          {data.readingTime != null && (
            <span>
              <Clock3 size={14} />
              {String(data.readingTime)} min read
            </span>
          )}
          {data.updatedAt != null && (
            <span>Updated {new Date(String(data.updatedAt)).toLocaleDateString()}</span>
          )}
        </div>
        <div className="summary-actions">
          <button
            className="button button-primary"
            onClick={() => navigate(`/quizzes?summaryId=${id}`)}
          >
            <BookOpenCheck size={16} /> Take a quiz
          </button>
          <button
            className="button button-outline"
            onClick={() => navigate(`/study-room?materialId=${id}`)}
          >
            <MessageCircle size={16} /> Ask your buddy
          </button>
          <button className="button button-outline" onClick={copy}>
            Copy notes
          </button>
        </div>
        <div className="markdown-content">
          {query.isLoading ? (
            <LoadingLine />
          ) : content ? (
            <MarkdownContent>{content}</MarkdownContent>
          ) : (
            <EmptyState
              icon={FileText}
              title="Your summary is getting ready"
              detail="When processing is complete, your summary will appear here."
            />
          )}
        </div>
        {Array.isArray(data.keyPoints) && data.keyPoints.length > 0 && (
          <aside className="key-points">
            <h3>
              <Sparkles size={17} /> Keep these in mind
            </h3>
            <ul>
              {(data.keyPoints as string[]).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </aside>
        )}
      </article>

      <aside className="summary-side">
        <div className="summary-side-card">
          <span className="summary-side-orb">
            <Sparkles size={18} />
          </span>
          <span className="eyebrow">A THOUGHTFUL NEXT STEP</span>
          <h3>Make sure it sticks.</h3>
          <p>Try a few practice questions based on this material, at your own pace.</p>
          <button
            className="button button-primary"
            onClick={() => navigate(`/quizzes?summaryId=${id}`)}
          >
            Practice these ideas <ArrowRight size={15} />
          </button>
        </div>
        <div className="summary-side-note">
          <span>✦</span>
          <p>Your study buddy answers with your uploaded notes as its source.</p>
        </div>
      </aside>
    </div>
  );
}
