import { BookOpenCheck, Clock3, Flame, Target } from 'lucide-react';
import { useApiQuery, list } from '../../../hooks/useApiQuery';
import { formatStudyHours } from '../../../lib/duration';
import { PageTitle, QueryNotice, StatCard } from '../../../components/common';
import type { DataObject } from '../../../types';

export function ProgressPage() {
  const progressQuery = useApiQuery<DataObject>('progress', '/progress');
  const streakQuery = useApiQuery<DataObject>('streak', '/streaks/me');
  const progress = progressQuery.data || {};
  const weekly = list<DataObject>(progress.weeklyStudyHours);
  const chartDays = weekly;
  const subjects = list<DataObject>(progress.subjectPerformance);

  return (
    <div>
      <PageTitle
        eyebrow="YOUR LEARNING JOURNEY"
        title="Progress & analytics"
        subtitle="A gentle look at the effort you’ve been putting in."
      />
      <QueryNotice error={progressQuery.error || streakQuery.error} />

      <div className="progress-stats-grid">
        <StatCard
          icon={Clock3}
          label="Study time"
          value={progress.totalStudyTime != null ? formatStudyHours(Number(progress.totalStudyTime)) : '—'}
          note="Time spent practicing"
          color="stat-blue"
        />
        <StatCard
          icon={BookOpenCheck}
          label="Quizzes taken"
          value={String(progress.totalQuizzesTaken ?? '—')}
          note="Every try counts"
          color="stat-violet"
        />
        <StatCard
          icon={Target}
          label="Overall accuracy"
          value={progress.quizAccuracy != null ? `${Math.round(Number(progress.quizAccuracy))}%` : '—'}
          note="Across all your quizzes"
          color="stat-green"
        />
        <StatCard
          icon={Flame}
          label="Current streak"
          value={`${String(streakQuery.data?.current ?? '—')} days`}
          note="One day at a time"
          color="stat-amber"
        />
      </div>

      <div className="analytics-grid">
        <section className="analytics-card">
          <div className="section-heading section-heading-row">
            <div>
              <span className="eyebrow">THIS WEEK</span>
              <h2>Your study rhythm</h2>
            </div>
            <span className="chart-caption">Study activity</span>
          </div>
          {chartDays.length ? (
            <div className="weekly-chart">
              {chartDays.map((day, index) => {
                const amount = Number(day.hours || 0);
                const height = Math.min(100, amount * 20);
                return (
                  <div
                    className="chart-day"
                    key={String(day.day || index)}
                    title={`${String(day.day || '')}: ${formatStudyHours(amount)}`}
                  >
                    <div className="chart-bar-wrap">
                      <span className={amount ? 'chart-bar chart-bar-active' : 'chart-bar'} style={{ height: `${height}%` }} />
                    </div>
                    <span>{String(day.day || '')}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted-copy">Study activity will appear here when available.</p>
          )}
        </section>

        <section className="analytics-card streak-card">
          <div className="streak-card-art">
            <Flame size={25} fill="currentColor" />
          </div>
          <span className="eyebrow">YOUR STUDY STREAK</span>
          <h2>{String(streakQuery.data?.current ?? '—')} days</h2>
          <p>You’re building a habit that will take you places.</p>
          {chartDays.length > 0 && (
            <div className="streak-week">
              {chartDays.map((day, index) => {
                const label = String(day.day || index + 1);
                const active = Number(day.hours || 0) > 0;
                return (
                  <span
                    className={active ? 'streak-day streak-day-on' : 'streak-day'}
                    title={`${label}: ${active ? 'Activity recorded' : 'No activity recorded'}`}
                    key={`${label}-${index}`}
                  >
                    {label.slice(0, 1)}
                  </span>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="analytics-card mastery-card">
        <div className="section-heading">
          <span className="eyebrow">SUBJECT MASTERY</span>
          <h2>Where you’re building confidence</h2>
        </div>
        {subjects.length ? (
          subjects.map((subject, index) => (
            <div className="mastery-row" key={String(subject.subject || subject.name || index)}>
              <span>{String(subject.subject || subject.name || 'Subject')}</span>
              <div className="progress-track">
                <span style={{ width: `${Math.min(100, Number(subject.score || 0))}%` }} />
              </div>
              <b>{`${Math.round(Number(subject.score || 0))}%`}</b>
            </div>
          ))
        ) : (
          <p className="muted-copy">Subject performance will show here as you complete quizzes.</p>
        )}
      </section>
    </div>
  );
}
