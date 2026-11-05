import { BookOpen, GraduationCap, School, X } from 'lucide-react';
import type { StudyBuddyStudent } from '../../../lib/studyBuddy';

interface StudentProfileModalProps {
  student: StudyBuddyStudent | null;
  isOnline: boolean;
  onClose: () => void;
}

function getStudyYearLabel(year: number): string {
  const suffix =
    year % 100 >= 11 && year % 100 <= 13
      ? 'th'
      : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[year % 10] ||
        'th';
  return `${year}${suffix} year`;
}

export function StudentProfileModal({
  student,
  isOnline,
  onClose,
}: StudentProfileModalProps) {
  if (!student) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-profile-title"
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close student profile"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          {student.avatarUrl ? (
            <img
              src={student.avatarUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              {student.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2
            id="student-profile-title"
            className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-50"
          >
            {student.name}
          </h2>
          <p
            className={`mt-1 text-xs font-medium ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}
          >
            {isOnline ? 'Online now' : 'Student'}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {student.school && (
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <School
                size={17}
                className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  School
                </p>
                <p className="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
                  {student.school}
                </p>
              </div>
            </div>
          )}
          {student.program && (
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <GraduationCap
                size={17}
                className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Program
                </p>
                <p className="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
                  {student.program}
                </p>
              </div>
            </div>
          )}
          {student.yearOfStudy != null && (
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <GraduationCap
                size={17}
                className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Year of study
                </p>
                <p className="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
                  {getStudyYearLabel(student.yearOfStudy)}
                </p>
              </div>
            </div>
          )}
          {student.bio && (
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                About
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-700 dark:text-slate-200">
                {student.bio}
              </p>
            </div>
          )}
          {student.courses.length > 0 && (
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Courses
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {student.courses.map((course) => (
                  <span
                    key={course}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <BookOpen
                      size={12}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                    {course}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
