import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpenCheck, CheckCircle2, ChevronRight, Clock3, Target } from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../../lib/api';
import { useApiQuery, list, getPath } from '../../../hooks/useApiQuery';
import { PageTitle, QueryNotice, LoadingLine, EmptyState } from '../../../components/common';
import type { DataObject } from '../../../types';

export function QuizzesPage() {
  const [params] = useSearchParams();
  const summariesQuery = useApiQuery<unknown>('summaries', '/summaries');
  const quizzesQuery = useApiQuery<unknown>('quizzes', '/quizzes');
  const summaries = list<DataObject>(summariesQuery.data, 'summaries');
  const quizzes = list<DataObject>(quizzesQuery.data, 'quizzes');
  const [summaryId, setSummaryId] = useState(params.get('summaryId') || '');
  const [count, setCount] = useState('5');
  const [mode, setMode] = useState<'practice' | 'test'>('practice');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function generate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/quizzes/generate', { summaryId, numberOfQuestions: Number(count) });
      const quiz = unwrap<DataObject>(data);
      if (!quiz.id) throw new Error('The quiz was created, but the API did not return its identifier.');
      navigate(`/quizzes/${String(quiz.id)}?mode=${mode}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageTitle
        eyebrow="PRACTICE MAKES PROGRESS"
        title="Practice quizzes"
        subtitle="A low-pressure way to find out what’s sticking."
      />

      <div className="quiz-hub-grid">
        <div className="quiz-generator">
          <span className="generator-icon"><BookOpenCheck size={21} /></span>
          <span className="eyebrow">MAKE A QUIZ</span>
          <h2>Practice what you’ve learned.</h2>
          <p>Choose a study summary and we’ll make a fresh quiz from your notes.</p>
          {error && <div className="form-alert">{error}</div>}
          <form className="modal-form" onSubmit={generate}>
            <label className="form-field">
              <span>Study summary</span>
              <select
                className="select-input"
                value={summaryId}
                onChange={(event) => setSummaryId(event.target.value)}
                required
              >
                <option value="">Choose a summary</option>
                {summaries.map((summary) => (
                  <option
                    value={String(summary.id || summary.materialId)}
                    key={String(summary.id || summary.materialId)}
                  >
                    {String(summary.title || 'Untitled summary')}
                  </option>
                ))}
              </select>
            </label>

            <div className="quiz-options-row">
              <label className="form-field">
                <span>Questions</span>
                <select className="select-input" value={count} onChange={(event) => setCount(event.target.value)}>
                  {[5, 10, 15].map((number) => (
                    <option key={number} value={number}>{number} questions</option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Mode</span>
                <select
                  className="select-input"
                  value={mode}
                  onChange={(event) => setMode(event.target.value as 'practice' | 'test')}
                >
                  <option value="practice">Practice mode</option>
                  <option value="test">Test mode</option>
                </select>
              </label>
            </div>

            <div className="mode-description">
              <span>{mode === 'practice' ? '✦' : '◷'}</span>
              <p>{mode === 'practice' ? 'See answers and explanations as you go.' : 'Take a timed quiz and review everything at the end.'}</p>
            </div>

            <button className="button button-primary" disabled={busy || !summaryId}>
              {busy ? 'Building your quiz…' : 'Generate quiz'}
              <BookOpenCheck size={16} />
            </button>
          </form>
        </div>

        <aside className="quiz-mode-card">
          <span className="quiz-mode-illustration"><Target size={25} /></span>
          <span className="eyebrow">A NOTE ABOUT PRACTICE</span>
          <h3>It’s okay to get things wrong.</h3>
          <p>Every question helps you see what you know and what you can revisit. Your progress is yours to make.</p>
          <div className="quiz-kind-row">
            <span><CheckCircle2 size={16} /> Practice mode</span>
            <small>Learn as you go</small>
          </div>
          <div className="quiz-kind-row">
            <span><Clock3 size={16} /> Test mode</span>
            <small>Save feedback for later</small>
          </div>
        </aside>
      </div>

      <div className="section-heading section-heading-row">
        <div>
          <span className="eyebrow">YOUR RECENT WORK</span>
          <h2>Recent quizzes</h2>
        </div>
      </div>

      <QueryNotice error={summariesQuery.error || quizzesQuery.error} />
      {quizzesQuery.isLoading ? (
        <LoadingLine />
      ) : quizzes.length ? (
        <div className="quiz-list">
          {quizzes.map((quiz) => (
            <Link to={`/quizzes/${String(quiz.id)}`} className="quiz-list-item" key={String(quiz.id)}>
              <span className="quiz-list-icon"><BookOpenCheck size={18} /></span>
              <div>
                <b>{String(quiz.title || 'Untitled quiz')}</b>
                <small>{String(getPath(quiz, 'summary.title', 'Summary unavailable'))} · {String(quiz.questionCount ?? list(quiz.questions).length)} questions</small>
              </div>
              <span className="quiz-score">{quiz.score != null ? `${quiz.score}%` : 'Not taken'}</span>
              <ChevronRight size={16} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpenCheck}
          title="Your quiz history starts here"
          detail="Generate your first quiz from a processed study summary."
        />
      )}
    </div>
  );
}
