import { useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { useApiQuery, list, getPath } from '../../../hooks/useApiQuery';
import { formatDuration } from '../../../lib/duration';
import { LoadingLine, PageTitle, QueryNotice } from '../../../components/common';
import type { DataObject } from '../../../types';

export function QuizResultPage() {
  const { id = '' } = useParams();
  const query = useApiQuery<DataObject>('quiz-result', `/quizzes/${id}/result`, !!id);
  const result = query.data || {};
  const scoreValue = result.score ?? result.accuracy;
  const score = scoreValue == null ? null : Number(scoreValue);
  const [mistakesOnly, setMistakesOnly] = useState(false);
  const questions = list<DataObject>(result.questions || result.answers);
  const shown = questions.filter((question) => !mistakesOnly || question.isCorrect === false || question.correct === false);

  if (query.isLoading) return <LoadingLine />;

  return (
    <div>
      <Link to="/quizzes" className="back-link page-back-link">
        <ArrowLeft size={15} /> Quizzes
      </Link>
      <PageTitle
        eyebrow="LOOK HOW FAR YOU’VE COME"
        title="Quiz results"
        subtitle={String(getPath(result, 'quiz.title', 'Quiz results'))}
      />
      <QueryNotice error={query.error} />

      <div className="result-overview">
        <div className="result-score">
          <span className="eyebrow">YOUR SCORE</span>
          {score == null ? (
            <div className="score-gauge"><span>—</span></div>
          ) : (
            <div className="score-gauge" style={{ '--score': `${score}%` } as CSSProperties}>
              <span>{score}<small>%</small></span>
            </div>
          )}
          <span className="grade-pill">
            Grade {String(result.grade || (score == null ? '—' : score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'Keep going'))}
          </span>
        </div>

        <div className="result-summary">
          <span className="eyebrow">NICE WORK SHOWING UP</span>
          <h2>Every attempt is progress.</h2>
          <p>Take a moment to review what felt easy and what you’d like to explore a little more.</p>
          <div className="result-stats">
            <div>
              <b>{String(result.xpEarned ?? '—')}</b>
              <span>XP earned</span>
            </div>
            <div>
              <b>{String(result.timeTaken != null ? formatDuration(Number(result.timeTaken)) : '—')}</b>
              <span>Time taken</span>
            </div>
            <div>
              <b>{String(result.correctCount ?? '—')} / {String(result.totalQuestions ?? questions.length)}</b>
              <span>Correct</span>
            </div>
          </div>
          <Link to="/quizzes" className="button button-primary">
            Back to quizzes <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <div className="section-heading section-heading-row">
        <div>
          <span className="eyebrow">YOUR ANSWER REVIEW</span>
          <h2>Question breakdown</h2>
        </div>
        <button
          className={`mistakes-toggle ${mistakesOnly ? 'mistakes-toggle-active' : ''}`}
          onClick={() => setMistakesOnly(!mistakesOnly)}
        >
          {mistakesOnly ? 'Show all questions' : 'Mistakes to review only'}
        </button>
      </div>

      {shown.map((question, index) => (
        <div className="review-question" key={String(question.id || index)}>
          <span className={`review-result-icon ${question.isCorrect || question.correct ? 'review-correct' : 'review-incorrect'}`}>
            {question.isCorrect || question.correct ? <Check size={16} /> : <X size={16} />}
          </span>
          <div>
            <b>{String(question.question || question.prompt || question.text || 'Question unavailable')}</b>
            <p>
              Your answer: {String(question.selectedAnswer || question.userAnswer || 'Not answered')} · Correct answer: {String(question.correctAnswer || 'Unavailable')}
            </p>
            {Boolean(question.explanation) && <small>{String(question.explanation)}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}
