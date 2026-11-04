import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, MoreHorizontal, Sparkles } from 'lucide-react';
import api, { getErrorMessage } from '../../../lib/api';
import { useApiQuery, list } from '../../../hooks/useApiQuery';
import { LoadingLine, QueryNotice, EmptyState } from '../../../components/common';
import type { DataObject } from '../../../types';

export function QuizRunnerPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const mode = params.get('mode') || 'practice';
  const query = useApiQuery<DataObject>('quiz', `/quizzes/${id}`, !!id);
  const quiz = query.data || {};
  const questions = list<DataObject>(quiz.questions, 'questions');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState(0);
  const [timerReady, setTimerReady] = useState(mode !== 'test');
  const [feedback, setFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timeExpired = useRef(false);
  const navigate = useNavigate();
  const timeLimit = Number(quiz.timeLimit || 0);

  useEffect(() => {
    if (mode === 'test' && timeLimit > 0) setSeconds(timeLimit);
    setTimerReady(true);
  }, [mode, timeLimit]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setSeconds((value) => (mode === 'test' && timeLimit > 0 ? Math.max(0, value - 1) : value + 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [mode, timeLimit]);

  const question = questions[current] || {};
  const questionId = String(question.id || current);
  const options = Array.isArray(question.options)
    ? (question.options as unknown[])
    : Object.entries(question.options || {}).map(([letter, text]) => ({ letter, text }));
  const elapsedSeconds = mode === 'test' && timeLimit > 0 ? timeLimit - seconds : seconds;
  const formatTime = (value: number) =>
    `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

  async function submitQuiz() {
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/quizzes/${id}/submit`, {
        quizId: id,
        idempotencyKey: crypto.randomUUID(),
        answers: questions.map((item, index) => {
          const itemId = String(item.id || index);
          return { questionId: itemId, selectedAnswer: answers[itemId] || '' };
        }),
        timeTaken: elapsedSeconds,
      });
      navigate(`/quizzes/${id}/result`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (
      mode === 'test' &&
      timeLimit > 0 &&
      timerReady &&
      seconds === 0 &&
      query.isSuccess &&
      questions.length &&
      !submitting &&
      !timeExpired.current
    ) {
      timeExpired.current = true;
      void submitQuiz();
    }
  }, [mode, timeLimit, timerReady, seconds, query.isSuccess, questions.length, submitting]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (/^[1-4]$/.test(event.key) && options.length >= Number(event.key)) {
        const option = options[Number(event.key) - 1] as DataObject;
        const answer = String(option.label || option.letter || option.id || option.text || event.key);
        setAnswers((value) => ({ ...value, [questionId]: answer }));
      }
      if (event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'd') {
        if (event.key.toLowerCase() === 'a') setCurrent((value) => Math.max(0, value - 1));
        if (event.key.toLowerCase() === 'd') setCurrent((value) => Math.min(questions.length - 1, value + 1));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [options, questionId, questions.length]);

  if (query.isLoading) return <LoadingLine />;

  return (
    <div className="quiz-runner">
      <Link to="/quizzes" className="back-link page-back-link">
        <ArrowLeft size={15} /> All quizzes
      </Link>
      <QueryNotice error={query.error} />
      <div className="quiz-runner-top">
        <div>
          <span className="eyebrow">{mode === 'test' ? 'TEST MODE' : 'PRACTICE MODE'}</span>
          <h1>{String(quiz.title || 'Untitled quiz')}</h1>
        </div>
        <div className={`quiz-timer ${mode === 'test' ? 'quiz-timer-amber' : ''}`}>
          <Clock3 size={16} />
          {formatTime(mode === 'test' && timeLimit > 0 ? seconds : elapsedSeconds)}
        </div>
      </div>

      <div className="quiz-progress-row">
        <span>Question {current + 1} <small>of {questions.length}</small></span>
        <div className="progress-track">
          <span style={{ width: `${questions.length ? ((current + 1) / questions.length) * 100 : 0}%` }} />
        </div>
        <span>{Object.keys(answers).length} answered</span>
      </div>

      {!questions.length ? (
        <EmptyState title="This quiz has no questions" detail="Go back and try generating another quiz." />
      ) : (
        <div className="question-card">
          <div className="question-label">
            <span className="question-number">Q{current + 1}</span>
            {question.type != null && <span>{String(question.type).replaceAll('_', ' ')}</span>}
            <MoreHorizontal size={17} />
          </div>
          <h2>{String(question.question || question.prompt || question.text || 'Question unavailable')}</h2>
          <div className="answer-options">
            {options.map((entry, index) => {
              const option = (typeof entry === 'string' ? { letter: String.fromCharCode(65 + index), text: entry } : entry) as DataObject;
              const label = String(option.label || option.letter || String.fromCharCode(65 + index));
              const text = String(option.text || option.value || option.label || '');
              const selected = answers[questionId] === label;
              const correct = String(question.correctAnswer || '') === label;
              return (
                <button
                  key={label}
                  className={`answer-option ${selected ? 'answer-selected' : ''} ${feedback && correct ? 'answer-correct' : ''} ${feedback && selected && !correct ? 'answer-wrong' : ''}`}
                  onClick={() => {
                    setAnswers((value) => ({ ...value, [questionId]: label }));
                    if (mode === 'practice') setFeedback(true);
                  }}
                >
                  <span className="option-letter">{label}</span>
                  <span>{text}</span>
                  {feedback && correct && <CheckCircle2 size={18} />}
                </button>
              );
            })}
          </div>
          {feedback && mode === 'practice' && (
            <div className="answer-explanation">
              <Sparkles size={16} />
              <p>
                {String(
                  question.explanation ||
                    (String(question.correctAnswer) === answers[questionId]
                      ? 'Nice work! Keep building on that understanding.'
                      : 'Take another look at this idea in your study summary.')
                )}
              </p>
            </div>
          )}
          <div className="question-footer">
            <button
              className="button button-outline"
              onClick={() => {
                setCurrent((value) => Math.max(0, value - 1));
                setFeedback(false);
              }}
              disabled={!current}
            >
              <ArrowLeft size={15} /> Previous
            </button>
            <div>
              {current < questions.length - 1 ? (
                <button
                  className="button button-primary"
                  onClick={() => {
                    setCurrent((value) => value + 1);
                    setFeedback(false);
                  }}
                >
                  Next question <ArrowRight size={15} />
                </button>
              ) : (
                <button className="button button-primary" disabled={submitting} onClick={submitQuiz}>
                  {submitting ? 'Submitting…' : 'Finish quiz'}
                  <Check size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {error && <div className="form-alert">{error}</div>}
      <div className="quiz-keyboard-hint">
        TIP <span>Use keys 1–4 to select an answer, and A / D to navigate.</span>
      </div>
    </div>
  );
}
