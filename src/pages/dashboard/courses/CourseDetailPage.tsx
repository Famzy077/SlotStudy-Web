import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpenCheck, FileText, Target, Upload,
} from 'lucide-react';
import type { Course, DataObject, Material } from '../../../types';
import { list, useApiQuery } from '../../../hooks/useApiQuery';
import {
  QueryNotice, EmptyState,
} from '../../../components/common';
import { MaterialCard } from '../materials/MaterialCard';

export function CourseDetailPage() {
  const { id = '' } = useParams();
  const [tab, setTab] = useState('Materials');
  const courseQuery = useApiQuery<Course>('course', `/courses/${id}`, !!id);
  const materialsQuery = useApiQuery<unknown>('materials', '/materials', !!id, {
    courseId: id,
  });
  const summariesQuery = useApiQuery<unknown>('summaries', '/summaries', !!id, {
    courseId: id,
  });
  const course = courseQuery.data;
  const materials = list<Material>(materialsQuery.data, 'materials');
  const summaries = list<DataObject>(summariesQuery.data, 'summaries');
  const navigate = useNavigate();

  return (
    <div>
      <Link className="back-link page-back-link" to="/courses">
        <ArrowLeft size={15} /> All courses
      </Link>
      <QueryNotice
        error={
          courseQuery.error || materialsQuery.error || summariesQuery.error
        }
      />
      <div className="course-detail-hero">
        <div>
          <span className="eyebrow">{course?.subject || 'COURSE SPACE'}</span>
          <h1>
            {course?.title ||
              (courseQuery.isLoading ? 'Loading course…' : 'Untitled course')}
          </h1>
          <p>Everything you need to keep moving through this subject.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => navigate(`/materials/upload?courseId=${id}`)}
        >
          <Upload size={16} /> Upload material
        </button>
      </div>
      <div className="course-detail-stats">
        <span>
          <FileText size={15} />
          {materials.length} materials
        </span>
        <span>
          <BookOpenCheck size={15} />
          {summaries.length} summaries
        </span>
        <span>
          <Target size={15} />
          {course?.progress == null ? '—' : `${String(course.progress)}%`} progress
        </span>
      </div>
      <div className="detail-tabs">
        {['Materials', 'Summaries', 'Quizzes'].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={tab === item ? 'detail-tab-active' : ''}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Materials' ? (
        materials.length ? (
          <div className="materials-grid">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Add your first material"
            detail="Upload lecture notes, slides or a course handout."
            action={
              <Link
                className="button button-primary"
                to={`/materials/upload?courseId=${id}`}
              >
                <Upload size={15} /> Upload material
              </Link>
            }
          />
        )
      ) : tab === 'Summaries' ? (
        summaries.length ? (
          <div className="materials-grid">
            {summaries.map((summary) => (
              <Link
                className="material-card summary-card"
                to={`/summaries/${String(summary.materialId || summary.id)}`}
                key={String(summary.id)}
              >
                <span className="material-file-icon summary-icon">
                  <BookOpenCheck size={20} />
                </span>
                <span className="status-pill status-completed">READY TO READ</span>
                <b>{String(summary.title || 'Untitled summary')}</b>
                <span className="material-course">
                  {String(summary.difficulty || 'Difficulty unavailable')}
                </span>
                <span className="material-card-bottom">
                  Open summary <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpenCheck}
            title="Summaries will show up here"
            detail="Process your course materials to see their study summaries."
          />
        )
      ) : (
        <EmptyState
          icon={BookOpenCheck}
          title="No quizzes yet"
          detail="Generate a practice quiz from one of your summaries."
          action={
            <Link to="/quizzes" className="button button-primary">
              Go to quizzes <ArrowRight size={15} />
            </Link>
          }
        />
      )}
    </div>
  );
}
