import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpenCheck, CloudUpload, FileText, Flame,
  GraduationCap, Sparkles, Target, Trophy, Upload,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import type { Course, DataObject } from '../../types';
import { getPath, list, useApiQuery } from '../../hooks/useApiQuery';
import { StatCard, LoadingLine, QueryNotice } from '../../components/common';
import { CourseCard } from './courses/CourseCard';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export function DashboardPage() {
  const user = useAuth((state) => state.user);
  const navigate = useNavigate();
  const dashboard = useApiQuery<DataObject>('dashboard', '/dashboard');
  const coursesQuery = useApiQuery<unknown>('courses', '/courses');
  const courses = list<Course>(coursesQuery.data, 'courses');
  const stats = dashboard.data || {};
  const recentCourses = list<Course>(stats.recentCourses, 'recentCourses');
  const visibleCourses = recentCourses.length ? recentCourses : courses;
  const university =
    user?.university || getPath(stats, 'university') || getPath(stats, 'user.university');
  const name =
    user?.name?.split(' ')[0] || (getPath(stats, 'user.name') as string)?.split(' ')[0] || 'there';

  useEffect(() => {
    const serverUni = getPath(stats, 'university') || getPath(stats, 'user.university');
    const serverProgram = getPath(stats, 'program') || getPath(stats, 'user.program');
    const serverYear = getPath(stats, 'yearOfStudy') || getPath(stats, 'user.yearOfStudy');
    const serverSetup =
      getPath(stats, 'academicSetupCompleted') ?? getPath(stats, 'user.academicSetupCompleted');

    if (
      serverUni &&
      typeof serverUni === 'string' &&
      (!user?.university || user.university !== serverUni)
    ) {
      useAuth.setState((state) => ({
        user: state.user
          ? {
              ...state.user,
              university: serverUni,
              program: typeof serverProgram === 'string' ? serverProgram : state.user.program,
              yearOfStudy: typeof serverYear === 'number' ? serverYear : state.user.yearOfStudy,
              academicSetupCompleted:
                typeof serverSetup === 'boolean'
                  ? serverSetup
                  : state.user.academicSetupCompleted,
            }
          : state.user,
      }));
    }
  }, [stats, user]);

  return (
    <div className="dashboard-page">
      <div className="welcome-strip">
        <div>
          <span className="eyebrow">YOUR STUDY SPACE</span>
          <h1>
            {greeting()}, {name}
            <span className="wave">✳</span>
          </h1>
          <p>A fresh day to get one step closer to where you’re going.</p>
          {university ? (
            <span className="affiliation-pill">
              <GraduationCap size={14} />
              {String(university)}
            </span>
          ) : (
            <Link className="setup-nudge" to="/onboarding/academic-setup">
              <GraduationCap size={15} /> Add your university to personalize your learning{' '}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
        <div className="welcome-illustration">
          <div className="illustration-sun" />
          <div className="book-stack">
            <span />
            <span />
            <span />
          </div>
          <div className="illustration-spark">✦</div>
          <div className="illustration-dot" />
        </div>
      </div>

      <QueryNotice error={dashboard.error || coursesQuery.error} />

      <div className="stats-grid">
        <StatCard
          icon={Flame}
          label="Study streak"
          value={`${getPath(stats, 'streak.current', getPath(stats, 'streak', '—'))}`}
          note="Keep your rhythm going"
          color="stat-amber"
        />
        <StatCard
          icon={Trophy}
          label="Total XP"
          value={`${getPath(stats, 'xp.total', getPath(stats, 'totalXp', '—'))}`}
          note={`Level ${getPath(stats, 'xp.level', getPath(stats, 'level', '—'))}`}
          color="stat-blue"
        />
        <StatCard
          icon={Target}
          label="Quiz accuracy"
          value={
            getPath(stats, 'examReadiness.overall') != null
              ? `${getPath(stats, 'examReadiness.overall')}%`
              : '—'
          }
          note="Your recent average"
          color="stat-green"
        />
        <StatCard
          icon={BookOpenCheck}
          label="Courses"
          value={coursesQuery.isSuccess ? String(visibleCourses.length) : '—'}
          note="In your library"
          color="stat-violet"
        />
      </div>

      <div className="section-heading">
        <div>
          <span className="eyebrow">MAKE IT COUNT</span>
          <h2>What would you like to do?</h2>
        </div>
      </div>

      <div className="quick-actions">
        <button
          className="quick-action action-upload"
          onClick={() => navigate('/materials/upload')}
        >
          <span>
            <Upload size={19} />
          </span>
          <b>Upload material</b>
          <small>Add lecture notes or a PDF</small>
          <ArrowRight size={16} className="quick-arrow" />
        </button>
        <button className="quick-action action-quiz" onClick={() => navigate('/quizzes')}>
          <span>
            <BookOpenCheck size={19} />
          </span>
          <b>Practice a quiz</b>
          <small>Learn as you go, no pressure</small>
          <ArrowRight size={16} className="quick-arrow" />
        </button>
        <button
          className="quick-action action-buddy"
          onClick={() => navigate('/study-room')}
        >
          <span>
            <Sparkles size={19} />
          </span>
          <b>Ask your study buddy</b>
          <small>Get unstuck, your way</small>
          <ArrowRight size={16} className="quick-arrow" />
        </button>
        <button className="quick-action action-summary" onClick={() => navigate('/ai')}>
          <span>
            <FileText size={19} />
          </span>
          <b>Browse summaries</b>
          <small>Review your study notes</small>
          <ArrowRight size={16} className="quick-arrow" />
        </button>
      </div>

      <div className="section-heading section-heading-row">
        <div>
          <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
          <h2>Continue studying</h2>
        </div>
        <Link to="/courses" className="subtle-link">
          All courses <ArrowRight size={15} />
        </Link>
      </div>

      {coursesQuery.isLoading || dashboard.isLoading ? (
        <LoadingLine />
      ) : visibleCourses.length ? (
        <div className="course-preview-grid">
          {visibleCourses.slice(0, 3).map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      ) : (
        <div className="first-study-card">
          <div className="first-study-art">
            <div className="paper-one" />
            <div className="paper-two" />
            <span>
              <CloudUpload size={24} />
            </span>
          </div>
          <div className="first-study-copy">
            <span className="eyebrow">YOUR FIRST STUDY SESSION</span>
            <h3>Start with what you’re learning.</h3>
            <p>
              Upload a PDF or lecture slide and we’ll help turn it into a clear, focused study
              plan.
            </p>
            <button
              className="button button-primary"
              onClick={() => navigate('/materials/upload')}
            >
              Upload your first material <ArrowRight size={16} />
            </button>
          </div>
          <span className="first-study-number">01</span>
        </div>
      )}
    </div>
  );
}
