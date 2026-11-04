import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Plus, Search } from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../../lib/api';
import type { Course } from '../../../types';
import { list, useApiQuery } from '../../../hooks/useApiQuery';
import {
  PageTitle, QueryNotice, LoadingLine, EmptyState, Modal,
} from '../../../components/common';
import { CourseCard } from './CourseCard';

export function CoursesPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [filter, setFilter] = useState('All courses');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(
      () => setParams(search ? { search } : {}),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search, setParams]);

  const result = useApiQuery<unknown>(
    'courses',
    '/courses',
    true,
    search ? { search } : undefined,
  );

  const courses = list<Course>(result.data, 'courses').filter((course) => {
    const progress = Number(course.progress ?? 0);
    return (
      filter === 'All courses' ||
      (filter === 'In progress' && progress > 0 && progress < 100) ||
      (filter === 'Completed' && progress >= 100)
    );
  });

  async function createCourse(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/courses', {
        title,
        subject,
        ...(description ? { description } : {}),
      });
      const created = unwrap<Course>(data);
      await queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowCreate(false);
      setTitle('');
      setSubject('');
      setDescription('');
      if (created.id) navigate(`/courses/${created.id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageTitle
        eyebrow="YOUR LEARNING LIBRARY"
        title="My courses"
        subtitle="Everything you’re learning, all in one place."
        action={
          <button className="button button-primary" onClick={() => setShowCreate(true)}>
            <Plus size={17} /> New course
          </button>
        }
      />
      <QueryNotice error={result.error} />
      <div className="library-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a course…"
          />
        </div>
        <div className="filter-tabs">
          {['All courses', 'In progress', 'Completed'].map((item) => (
            <button
              key={item}
              className={filter === item ? 'filter-active' : ''}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {result.isLoading ? (
        <LoadingLine />
      ) : courses.length ? (
        <div className="course-grid">
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={search ? 'No matching courses' : 'Your course library is ready'}
          detail={
            search
              ? 'Try another search term.'
              : 'Create a course to keep your notes, summaries and quizzes together.'
          }
          action={
            <button className="button button-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create a course
            </button>
          }
        />
      )}

      {showCreate && (
        <Modal title="Create a new course" onClose={() => setShowCreate(false)}>
          <form className="modal-form" onSubmit={createCourse}>
            {error && <div className="form-alert">{error}</div>}
            <label className="form-field">
              <span>Course title</span>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Introduction to Biology"
              />
            </label>
            <label className="form-field">
              <span>Subject</span>
              <input
                required
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. Biology"
              />
            </label>
            <label className="form-field">
              <span>
                Description <small>Optional</small>
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What are you studying in this course?"
                rows={3}
              />
            </label>
            <button className="button button-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create course'}
              <ArrowRight size={16} />
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
