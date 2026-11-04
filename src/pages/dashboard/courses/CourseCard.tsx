import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FileText } from 'lucide-react';
import type { Course } from '../../../types';
import { getPath } from '../../../hooks/useApiQuery';

const courseColors = ['cover-blue', 'cover-coral', 'cover-lilac'];

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const numberOfMaterials =
    course._count?.materials ??
    (Array.isArray(course.materials) ? course.materials.length : 0);
  const rawProgress = course.progress ?? getPath(course, 'completionPercentage');
  const progress = rawProgress == null ? null : Number(rawProgress);

  return (
    <Link className="course-card" to={`/courses/${course.id}`}>
      <div className={`course-cover ${courseColors[index % courseColors.length]}`}>
        <span className="course-cover-icon">
          <BookOpen size={22} />
        </span>
        <span className="course-cover-subject">{course.subject || 'COURSE'}</span>
        <span className="cover-decoration">✳</span>
      </div>
      <div className="course-card-body">
        <span className="course-subject">{course.subject || 'Course'}</span>
        <h3>{course.title || course.name || 'Untitled course'}</h3>
        <div className="course-progress-line">
          <div className="progress-track">
            <span
              style={{
                width: `${Math.min(100, Math.max(0, progress ?? 0))}%`,
              }}
            />
          </div>
          <small>
            {progress == null || !Number.isFinite(progress) ? '—' : `${progress}%`}
          </small>
        </div>
        <div className="course-meta">
          <span>
            <FileText size={13} />
            {numberOfMaterials} materials
          </span>
          <span>
            Open course <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
