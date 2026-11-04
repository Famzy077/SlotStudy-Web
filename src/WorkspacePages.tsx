import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, BookOpen, BookOpenCheck, Check, CheckCircle2, ChevronDown, Mic,
  ChevronRight, CircleHelp, Clock3, CloudUpload, FileText, Flame, GraduationCap, Headphones,
  LoaderCircle, MessageCircle, MoreHorizontal, Plus, Search, Send, Sparkles, Target, Trophy,
  Upload, X,
} from 'lucide-react';
import api, { getErrorMessage, unwrap } from './lib/api';
import { useAuth } from './lib/auth';
import { formatStudyHours } from './lib/duration';

const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));
function MarkdownContent({ children }: { children: string }) {
  return <Suspense fallback={<div className="loading-line">Opening your notes…</div>}><MarkdownRenderer>{children}</MarkdownRenderer></Suspense>;
}

interface RecognitionEvent extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface RecognitionController {
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => RecognitionController;
    webkitSpeechRecognition?: new () => RecognitionController;
  }
}

type DataObject = Record<string, unknown> & { id?: string; title?: string; name?: string };
type Course = DataObject & { id: string; title: string; subject?: string; progress?: number; materials?: unknown[]; _count?: { materials?: number } };
type Material = DataObject & { id: string; fileName?: string; filename?: string; status?: string; size?: number };
type StudyMessage = { id?: string; role?: string; content?: string; sources?: unknown[] };

function getPath(object: unknown, path: string, fallback: unknown = undefined): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, object) ?? fallback;
}

function useApiQuery<T>(key: string, url: string, enabled = true, params?: Record<string, string>) {
  return useQuery<T>({
    queryKey: [key, params],
    queryFn: async () => unwrap<T>((await api.get(url, { params })).data),
    enabled,
  });
}

function list<T>(data: unknown, key?: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const source = key ? (data as Record<string, unknown>)[key] : undefined;
    if (Array.isArray(source)) return source as T[];
    for (const value of Object.values(data)) if (Array.isArray(value)) return value as T[];
  }
  return [];
}

function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="page-title-row"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="page-title-action">{action}</div>}</div>;
}

function QueryNotice({ error }: { error: unknown }) {
  if (!error) return null;
  return <div className="query-notice" role="alert"><CircleHelp size={17} /><span>Couldn’t load the latest data from SlotStudy API: {getErrorMessage(error)}</span></div>;
}

function LoadingLine() {
  return <div className="loading-line"><LoaderCircle className="spin" size={18} /> Loading your study space…</div>;
}

function EmptyState({ icon: Icon = BookOpen, title, detail, action }: { icon?: typeof BookOpen; title: string; detail: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={22} /></span><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

function StatCard({ icon: Icon, label, value, note, color }: { icon: typeof Flame; label: string; value: string; note: string; color: string }) {
  return <div className="stat-card"><span className={`stat-icon ${color}`}><Icon size={18} /></span><span className="stat-label">{label}</span><b className={`stat-value ${value.length > 9 ? 'stat-value-long' : ''}`}>{value}</b><span className="stat-note">{note}</span></div>;
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

function formatDuration(seconds: number) { return `${Math.floor(seconds / 60)}m ${seconds % 60}s`; }

export function DashboardPage() {
  const user = useAuth((state) => state.user);
  const navigate = useNavigate();
  const dashboard = useApiQuery<DataObject>('dashboard', '/dashboard');
  const coursesQuery = useApiQuery<unknown>('courses', '/courses');
  const courses = list<Course>(coursesQuery.data, 'courses');
  const stats = dashboard.data || {};
  const recentCourses = list<Course>(stats.recentCourses, 'recentCourses');
  const visibleCourses = recentCourses.length ? recentCourses : courses;
  const university = user?.university || getPath(stats, 'university') || getPath(stats, 'user.university');
  const name = user?.name?.split(' ')[0] || (getPath(stats, 'user.name') as string)?.split(' ')[0] || 'there';

  useEffect(() => {
    const serverUni = getPath(stats, 'university') || getPath(stats, 'user.university');
    const serverProgram = getPath(stats, 'program') || getPath(stats, 'user.program');
    const serverYear = getPath(stats, 'yearOfStudy') || getPath(stats, 'user.yearOfStudy');
    const serverSetup = getPath(stats, 'academicSetupCompleted') ?? getPath(stats, 'user.academicSetupCompleted');

    if (serverUni && typeof serverUni === 'string' && (!user?.university || user.university !== serverUni)) {
      useAuth.setState((state) => ({
        user: state.user
          ? {
              ...state.user,
              university: serverUni,
              program: typeof serverProgram === 'string' ? serverProgram : state.user.program,
              yearOfStudy: typeof serverYear === 'number' ? serverYear : state.user.yearOfStudy,
              academicSetupCompleted: typeof serverSetup === 'boolean' ? serverSetup : state.user.academicSetupCompleted,
            }
          : state.user,
      }));
    }
  }, [stats, user]);

  return <div className="dashboard-page">
    <div className="welcome-strip">
      <div><span className="eyebrow">YOUR STUDY SPACE</span><h1>{greeting()}, {name}<span className="wave">✳</span></h1><p>A fresh day to get one step closer to where you’re going.</p>
        {university ? <span className="affiliation-pill"><GraduationCap size={14} />{String(university)}</span> : <Link className="setup-nudge" to="/onboarding/academic-setup"><GraduationCap size={15} /> Add your university to personalize your learning <ArrowRight size={14} /></Link>}
      </div>
      <div className="welcome-illustration"><div className="illustration-sun" /><div className="book-stack"><span /><span /><span /></div><div className="illustration-spark">✦</div><div className="illustration-dot" /></div>
    </div>
    <QueryNotice error={dashboard.error || coursesQuery.error} />
    <div className="stats-grid">
      <StatCard icon={Flame} label="Study streak" value={`${getPath(stats, 'streak.current', getPath(stats, 'streak', '—'))}`} note="Keep your rhythm going" color="stat-amber" />
      <StatCard icon={Trophy} label="Total XP" value={`${getPath(stats, 'xp.total', getPath(stats, 'totalXp', '—'))}`} note={`Level ${getPath(stats, 'xp.level', getPath(stats, 'level', '—'))}`} color="stat-blue" />
      <StatCard icon={Target} label="Quiz accuracy" value={getPath(stats, 'examReadiness.overall') != null ? `${getPath(stats, 'examReadiness.overall')}%` : '—'} note="Your recent average" color="stat-green" />
      <StatCard icon={BookOpenCheck} label="Courses" value={coursesQuery.isSuccess ? String(visibleCourses.length) : '—'} note="In your library" color="stat-violet" />
    </div>
    <div className="section-heading"><div><span className="eyebrow">MAKE IT COUNT</span><h2>What would you like to do?</h2></div></div>
    <div className="quick-actions">
      <button className="quick-action action-upload" onClick={() => navigate('/materials/upload')}><span><Upload size={19} /></span><b>Upload material</b><small>Add lecture notes or a PDF</small><ArrowRight size={16} className="quick-arrow" /></button>
      <button className="quick-action action-quiz" onClick={() => navigate('/quizzes')}><span><BookOpenCheck size={19} /></span><b>Practice a quiz</b><small>Learn as you go, no pressure</small><ArrowRight size={16} className="quick-arrow" /></button>
      <button className="quick-action action-buddy" onClick={() => navigate('/study-room')}><span><Sparkles size={19} /></span><b>Ask your study buddy</b><small>Get unstuck, your way</small><ArrowRight size={16} className="quick-arrow" /></button>
      <button className="quick-action action-summary" onClick={() => navigate('/ai')}><span><FileText size={19} /></span><b>Browse summaries</b><small>Review your study notes</small><ArrowRight size={16} className="quick-arrow" /></button>
    </div>
    <div className="section-heading section-heading-row"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Continue studying</h2></div><Link to="/courses" className="subtle-link">All courses <ArrowRight size={15} /></Link></div>
    {coursesQuery.isLoading || dashboard.isLoading ? <LoadingLine /> : visibleCourses.length ? <div className="course-preview-grid">{visibleCourses.slice(0, 3).map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}</div> : <div className="first-study-card"><div className="first-study-art"><div className="paper-one" /><div className="paper-two" /><span><CloudUpload size={24} /></span></div><div className="first-study-copy"><span className="eyebrow">YOUR FIRST STUDY SESSION</span><h3>Start with what you’re learning.</h3><p>Upload a PDF or lecture slide and we’ll help turn it into a clear, focused study plan.</p><button className="button button-primary" onClick={() => navigate('/materials/upload')}>Upload your first material <ArrowRight size={16} /></button></div><span className="first-study-number">01</span></div>}
  </div>;
}

const courseColors = ['cover-blue', 'cover-coral', 'cover-lilac'];
function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const numberOfMaterials = course._count?.materials ?? (Array.isArray(course.materials) ? course.materials.length : 0);
  const rawProgress = course.progress ?? getPath(course, 'completionPercentage');
  const progress = rawProgress == null ? null : Number(rawProgress);
  return <Link className="course-card" to={`/courses/${course.id}`}><div className={`course-cover ${courseColors[index % courseColors.length]}`}><span className="course-cover-icon"><BookOpen size={22} /></span><span className="course-cover-subject">{course.subject || 'COURSE'}</span><span className="cover-decoration">✳</span></div><div className="course-card-body"><span className="course-subject">{course.subject || 'Course'}</span><h3>{course.title || course.name || 'Untitled course'}</h3><div className="course-progress-line"><div className="progress-track"><span style={{ width: `${Math.min(100, Math.max(0, progress ?? 0))}%` }} /></div><small>{progress == null || !Number.isFinite(progress) ? '—' : `${progress}%`}</small></div><div className="course-meta"><span><FileText size={13} />{numberOfMaterials} materials</span><span>Open course <ArrowRight size={13} /></span></div></div></Link>;
}

function CourseLibrary() {
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
  useEffect(() => { const timer = window.setTimeout(() => setParams(search ? { search } : {}), 300); return () => window.clearTimeout(timer); }, [search, setParams]);
  const result = useApiQuery<unknown>('courses', '/courses', true, search ? { search } : undefined);
  const courses = list<Course>(result.data, 'courses').filter((course) => {
    const progress = Number(course.progress ?? 0);
    return filter === 'All courses' || (filter === 'In progress' && progress > 0 && progress < 100) || (filter === 'Completed' && progress >= 100);
  });
  async function createCourse(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post('/courses', { title, subject, ...(description ? { description } : {}) });
      const created = unwrap<Course>(data);
      await queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowCreate(false); setTitle(''); setSubject(''); setDescription('');
      if (created.id) navigate(`/courses/${created.id}`);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  return <div><PageTitle eyebrow="YOUR LEARNING LIBRARY" title="My courses" subtitle="Everything you’re learning, all in one place." action={<button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={17} /> New course</button>} />
    <QueryNotice error={result.error} />
    <div className="library-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a course…" /></div><div className="filter-tabs">{['All courses', 'In progress', 'Completed'].map((item) => <button key={item} className={filter === item ? 'filter-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
    {result.isLoading ? <LoadingLine /> : courses.length ? <div className="course-grid">{courses.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}</div> : <EmptyState title={search ? 'No matching courses' : 'Your course library is ready'} detail={search ? 'Try another search term.' : 'Create a course to keep your notes, summaries and quizzes together.'} action={<button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create a course</button>} />}
    {showCreate && <Modal title="Create a new course" onClose={() => setShowCreate(false)}><form className="modal-form" onSubmit={createCourse}>{error && <div className="form-alert">{error}</div>}<label className="form-field"><span>Course title</span><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Introduction to Biology" /></label><label className="form-field"><span>Subject</span><input required value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Biology" /></label><label className="form-field"><span>Description <small>Optional</small></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What are you studying in this course?" rows={3} /></label><button className="button button-primary" disabled={busy}>{busy ? 'Creating…' : 'Create course'}<ArrowRight size={16} /></button></form></Modal>}
  </div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal"><div className="modal-heading"><div><span className="eyebrow">SLOTSTUDY</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>{children}</div></div>;
}

function UploadPage() {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const coursesQuery = useApiQuery<unknown>('courses', '/courses');
  const courses = list<Course>(coursesQuery.data, 'courses');
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState(params.get('courseId') || '');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    const body = new FormData(); body.append('file', file); if (courseId) body.append('courseId', courseId);
    setBusy(true); setError(''); setSuccess(''); setProgress(0);
    try {
      const { data } = await api.post('/materials/upload', body, { onUploadProgress: (event) => { if (event.total) setProgress(Math.round((event.loaded * 100) / event.total)); } });
      const material = unwrap<Material>(data);
      if (material.id) {
        try { await api.post(`/materials/${material.id}/process`); }
        catch (processingError) { setError(`Uploaded successfully, but processing could not start: ${getErrorMessage(processingError)}`); }
      }
      setSuccess(`“${file.name}” uploaded. You can follow processing in AI summaries.`);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['materials'] }), queryClient.invalidateQueries({ queryKey: ['courses'] })]);
      setFile(null);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  function choose(candidate?: File) {
    if (!candidate) return;
    if (!/\.(pdf|png|jpe?g)$/i.test(candidate.name)) { setError('Choose a PDF, PNG or JPG file.'); return; }
    if (candidate.size > 50 * 1024 * 1024) { setError('This file is larger than the 50 MB limit.'); return; }
    setError(''); setFile(candidate);
  }
  return <div className="narrow-page"><PageTitle eyebrow="ADD TO YOUR STUDY SPACE" title="Upload material" subtitle="Add notes, handouts or lecture slides. We’ll help you turn them into something easier to study." />
    <div className="upload-card"><form onSubmit={upload}><button type="button" className={`dropzone ${file ? 'dropzone-selected' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(event.dataTransfer.files[0]); }}><input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" hidden onChange={(event) => choose(event.target.files?.[0])} />{file ? <><span className="dropzone-icon"><FileText size={24} /></span><b>{file.name}</b><span>{(file.size / 1024 / 1024).toFixed(1)} MB · Ready to upload</span><span className="replace-file">Click to choose a different file</span></> : <><span className="dropzone-icon"><CloudUpload size={25} /></span><b>Drop your file here, or <u>browse</u></b><span>PDF, PNG or JPG · Up to 50 MB</span></>}</button>
      <label className="form-field course-select"><span>Add to a course <small>Optional</small></span><select className="select-input" value={courseId} onChange={(event) => setCourseId(event.target.value)}><option value="">No course selected</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}</select></label>
      {busy && <div className="upload-progress"><div className="progress-label"><span>Uploading material</span><b>{progress}%</b></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>}
      {error && <div className="form-alert">{error}</div>}{success && <div className="success-alert"><CheckCircle2 size={17} />{success}</div>}
      <button className="button button-primary upload-submit" disabled={!file || busy}>{busy ? 'Uploading…' : 'Upload and process'}{busy ? <LoaderCircle className="spin" size={16} /> : <ArrowRight size={16} />}</button>
    </form></div>
    <div className="upload-privacy"><span>✦</span><div><b>Your notes stay yours.</b><p>Materials are only used to support your own study sessions and summaries.</p></div></div>
  </div>;
}

function MaterialsPage() {
  const result = useApiQuery<unknown>('materials', '/materials');
  const materials = list<Material>(result.data, 'materials');
  return <div><PageTitle eyebrow="YOUR STUDY LIBRARY" title="AI summaries" subtitle="Thoughtful notes made from the materials you’ve uploaded." action={<Link className="button button-primary" to="/materials/upload"><Plus size={16} /> Add material</Link>} /><QueryNotice error={result.error} />
    <div className="ai-hero"><span className="ai-hero-orb"><Sparkles size={23} /></span><div><span className="eyebrow">YOUR GROUNDED STUDY BUDDY</span><h2>Big ideas, made a little clearer.</h2><p>Ask questions about your own notes, get helpful summaries, and study in the way that works for you.</p></div><Link className="button button-light" to="/study-room">Open study buddy <ArrowRight size={15} /></Link><span className="ai-hero-star">✦</span></div>
    <div className="section-heading section-heading-row"><div><span className="eyebrow">YOUR MATERIALS</span><h2>Recent study notes</h2></div></div>
    {result.isLoading ? <LoadingLine /> : materials.length ? <div className="materials-grid">{materials.map((material) => <MaterialCard material={material} key={material.id} />)}</div> : <EmptyState icon={FileText} title="Nothing to summarize just yet" detail="Upload a course handout or lecture slide to create your first study summary." action={<Link to="/materials/upload" className="button button-primary"><Upload size={16} /> Upload a material</Link>} />}
  </div>;
}

function MaterialCard({ material }: { material: Material }) {
  const name = String(material.fileName || material.filename || material.title || 'Untitled material');
  const status = String(material.status || 'UNKNOWN').toUpperCase();
  return <Link to={`/summaries/${material.id}`} className="material-card"><span className={`material-file-icon ${name.toLowerCase().endsWith('.pdf') ? 'pdf-icon' : ''}`}><FileText size={21} /></span><span className={`status-pill status-${status.toLowerCase()}`}>{status}</span><b>{name}</b><span className="material-course">{String(getPath(material, 'course.title', 'No course linked'))}</span><span className="material-card-bottom"><span><Clock3 size={13} />{material.createdAt ? new Date(String(material.createdAt)).toLocaleDateString() : 'Date unavailable'}</span><ArrowRight size={15} /></span></Link>;
}

function CourseDetail() {
  const { id = '' } = useParams();
  const [tab, setTab] = useState('Materials');
  const courseQuery = useApiQuery<Course>('course', `/courses/${id}`, !!id);
  const materialsQuery = useApiQuery<unknown>('materials', '/materials', !!id, { courseId: id });
  const summariesQuery = useApiQuery<unknown>('summaries', '/summaries', !!id, { courseId: id });
  const course = courseQuery.data;
  const materials = list<Material>(materialsQuery.data, 'materials');
  const summaries = list<DataObject>(summariesQuery.data, 'summaries');
  const navigate = useNavigate();
  return <div><Link className="back-link page-back-link" to="/courses"><ArrowLeft size={15} /> All courses</Link><QueryNotice error={courseQuery.error || materialsQuery.error || summariesQuery.error} />
    <div className="course-detail-hero"><div><span className="eyebrow">{course?.subject || 'COURSE SPACE'}</span><h1>{course?.title || (courseQuery.isLoading ? 'Loading course…' : 'Untitled course')}</h1><p>Everything you need to keep moving through this subject.</p></div><button className="button button-primary" onClick={() => navigate(`/materials/upload?courseId=${id}`)}><Upload size={16} /> Upload material</button></div>
    <div className="course-detail-stats"><span><FileText size={15} />{materials.length} materials</span><span><Sparkles size={15} />{summaries.length} summaries</span><span><Target size={15} />{course?.progress == null ? '—' : `${String(course.progress)}%`} progress</span></div>
    <div className="detail-tabs">{['Materials', 'Summaries', 'Quizzes'].map((item) => <button key={item} onClick={() => setTab(item)} className={tab === item ? 'detail-tab-active' : ''}>{item}</button>)}</div>
    {tab === 'Materials' ? materials.length ? <div className="materials-grid">{materials.map((material) => <MaterialCard key={material.id} material={material} />)}</div> : <EmptyState icon={FileText} title="Add your first material" detail="Upload lecture notes, slides or a course handout." action={<Link className="button button-primary" to={`/materials/upload?courseId=${id}`}><Upload size={15} /> Upload material</Link>} /> : tab === 'Summaries' ? summaries.length ? <div className="materials-grid">{summaries.map((summary) => <Link className="material-card summary-card" to={`/summaries/${String(summary.materialId || summary.id)}`} key={String(summary.id)}><span className="material-file-icon summary-icon"><Sparkles size={20} /></span><span className="status-pill status-completed">READY TO READ</span><b>{String(summary.title || 'Untitled summary')}</b><span className="material-course">{String(summary.difficulty || 'Difficulty unavailable')}</span><span className="material-card-bottom">Open summary <ArrowRight size={14} /></span></Link>)}</div> : <EmptyState icon={Sparkles} title="Summaries will show up here" detail="Process your course materials to see their study summaries." /> : <EmptyState icon={BookOpenCheck} title="No quizzes yet" detail="Generate a practice quiz from one of your summaries." action={<Link to="/quizzes" className="button button-primary">Go to quizzes <ArrowRight size={15} /></Link>} />}
  </div>;
}

function SummaryDetail() {
  const { id = '' } = useParams();
  const query = useApiQuery<DataObject>('summary', `/summaries/${id}`, !!id);
  const data = query.data || {};
  const content = String(data.content || data.summary || data.markdown || '');
  const title = String(data.title || getPath(data, 'material.fileName', 'Untitled summary'));
  const navigate = useNavigate();
  async function copy() {
    try { await navigator.clipboard.writeText(content); }
    catch { window.prompt('Copy your summary:', content); }
  }
  return <div className="summary-layout"><article className="summary-document"><Link className="back-link page-back-link" to="/ai"><ArrowLeft size={15} /> AI summaries</Link><QueryNotice error={query.error} />
    <span className="eyebrow">YOUR STUDY NOTES</span><h1>{title}</h1><div className="summary-meta">{data.difficulty != null && <span className="difficulty-pill">{String(data.difficulty)}</span>}{data.readingTime != null && <span><Clock3 size={14} />{String(data.readingTime)} min read</span>}{data.updatedAt != null && <span>Updated {new Date(String(data.updatedAt)).toLocaleDateString()}</span>}</div>
    <div className="summary-actions"><button className="button button-primary" onClick={() => navigate(`/quizzes?summaryId=${id}`)}><BookOpenCheck size={16} /> Take a quiz</button><button className="button button-outline" onClick={() => navigate(`/study-room?materialId=${id}`)}><MessageCircle size={16} /> Ask your buddy</button><button className="button button-outline" onClick={copy}>Copy notes</button></div>
    <div className="markdown-content">{query.isLoading ? <LoadingLine /> : content ? <MarkdownContent>{content}</MarkdownContent> : <EmptyState icon={FileText} title="Your summary is getting ready" detail="When processing is complete, your summary will appear here." />}</div>
    {Array.isArray(data.keyPoints) && data.keyPoints.length > 0 && <aside className="key-points"><h3><Sparkles size={17} /> Keep these in mind</h3><ul>{(data.keyPoints as string[]).map((point) => <li key={point}>{point}</li>)}</ul></aside>}
  </article><aside className="summary-side"><div className="summary-side-card"><span className="summary-side-orb"><Sparkles size={18} /></span><span className="eyebrow">A THOUGHTFUL NEXT STEP</span><h3>Make sure it sticks.</h3><p>Try a few practice questions based on this material, at your own pace.</p><button className="button button-primary" onClick={() => navigate(`/quizzes?summaryId=${id}`)}>Practice these ideas <ArrowRight size={15} /></button></div><div className="summary-side-note"><span>✦</span><p>Your study buddy answers with your uploaded notes as its source.</p></div></aside></div>;
}

function StudyRoom() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const materialsQuery = useApiQuery<unknown>('materials', '/materials');
  const coursesQuery = useApiQuery<unknown>('courses', '/courses');
  const sessionsQuery = useApiQuery<unknown>('study-sessions', '/study-sessions');
  const sessionQuery = useApiQuery<DataObject>('study-session', `/study-sessions/${id}`, !!id);
  const materials = list<Material>(materialsQuery.data, 'materials');
  const courses = list<Course>(coursesQuery.data, 'courses');
  const sessions = list<DataObject>(sessionsQuery.data, 'sessions');
  const [courseId, setCourseId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(params.get('materialId') ? [params.get('materialId')!] : []);
  const [sessionTitle, setSessionTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [streamText, setStreamText] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState<StudyMessage[]>([]);
  const [sources, setSources] = useState<unknown[]>([]);
  const [showSources, setShowSources] = useState(false);
  const [listening, setListening] = useState(false);
  const session = sessionQuery.data || {};
  const sessionMaterials = list<DataObject>(session.materials);
  const messages = [...list<StudyMessage>(session.messages), ...optimisticMessages];
  const filteredMaterials = materials.filter((material) => !courseId || getPath(material, 'courseId') === courseId || getPath(material, 'course.id') === courseId);
  const streamController = useRef<AbortController | null>(null);
  const recognition = useRef<RecognitionController | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, streamText]);

  async function createSession(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!selectedIds.length) { setError('Select at least one material so your study buddy knows what you’re learning.'); return; }
    setBusy(true);
    try {
      const { data } = await api.post('/study-sessions', { courseId: courseId || undefined, materialIds: selectedIds, title: sessionTitle || undefined });
      const created = unwrap<DataObject>(data);
      await queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      navigate(`/study-room/${created.id}`);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }

  async function sendMessage(content = prompt) {
    const text = content.trim();
    if (!text || !id || busy) return;
    setPrompt('');
    setError('');
    setBusy(true);
    setOptimisticMessages((current) => [...current, { role: 'USER', content: text }]);
    setStreamText('');
    setSources([]);
    const controller = new AbortController();
    streamController.current = controller;
    let streamStarted = false;
    try {
      const response = await fetch(`${api.defaults.baseURL}/study-sessions/${id}/messages/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAuth.getState().accessToken}` },
        body: JSON.stringify({ content: text, inputMode: 'TEXT' }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error(`Streaming unavailable (${response.status}).`);
      streamStarted = true;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let completeText = '';
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        buffer += decoder.decode(chunk.value, { stream: !done });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || '';
        for (const event of events) {
          const line = event.split(/\r?\n/).find((row) => row.startsWith('data:'));
          if (!line) continue;
          const parsed = JSON.parse(line.slice(5).trim()) as { type: string; data: unknown };
          if (parsed.type === 'sources' && Array.isArray(parsed.data)) setSources(parsed.data);
          if (parsed.type === 'chunk' && typeof parsed.data === 'string') {
            completeText += parsed.data;
            setStreamText(completeText);
          }
          if (parsed.type === 'error') setError(String(parsed.data));
          if (parsed.type === 'done') {
            const final = parsed.data as StudyMessage;
            setOptimisticMessages((current) => [...current, { ...final, role: 'ASSISTANT', content: completeText || final.content }]);
            setStreamText('');
          }
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['study-session', id] });
      setOptimisticMessages([]);
    } catch (requestError) {
      if (controller.signal.aborted) {
        setStreamText('');
        await queryClient.invalidateQueries({ queryKey: ['study-session', id] });
        setOptimisticMessages([]);
        return;
      }
      if (!streamStarted) {
        try {
          const { data } = await api.post(`/study-sessions/${id}/messages`, { content: text, inputMode: 'TEXT' });
          const result = unwrap<{ assistantMessage?: StudyMessage; userMessage?: StudyMessage }>(data);
          setOptimisticMessages((current) => [...current, result.assistantMessage || { role: 'ASSISTANT', content: String(getPath(result, 'assistantMessage.content', '')) }]);
          await queryClient.invalidateQueries({ queryKey: ['study-session', id] });
        } catch (fallbackError) { setError(getErrorMessage(fallbackError)); }
      } else setError(getErrorMessage(requestError));
      setOptimisticMessages([]);
      setStreamText('');
    } finally { setBusy(false); streamController.current = null; }
  }
  function speak(content: string) {
    if (!('speechSynthesis' in window)) { setError('Read aloud is not supported in this browser.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content.replace(/[#*_`>[]()]/g, '').replace(/\p{Extended_Pictographic}/gu, ''));
    utterance.lang = 'en-NG';
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((candidate) => candidate.lang.toLowerCase().startsWith('en-ng')) || voices.find((candidate) => candidate.lang.toLowerCase().startsWith('en'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }
  function dictate() {
    if (listening) { recognition.current?.stop(); return; }
    const SpeechInput = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechInput) { setError('Speech input is not supported in this browser.'); return; }
    const input = new SpeechInput();
    recognition.current = input;
    input.lang = 'en-NG';
    input.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setPrompt((current) => `${current}${current ? ' ' : ''}${transcript}`);
    };
    input.onerror = () => setError('Could not hear that clearly. Please try again or type your question.');
    input.onend = () => setListening(false);
    setListening(true);
    input.start();
  }

  if (!id) return <div><PageTitle eyebrow="YOUR AI STUDY BUDDY" title="Study room" subtitle="A friendly space to ask questions about the materials you’re studying." />
    <div className="study-setup-layout"><form className="study-setup-card" onSubmit={createSession}><div className="study-setup-heading"><span className="setup-sparkle"><Sparkles size={20} /></span><div><h2>Start a study session</h2><p>Choose your notes so answers stay grounded in what you’re learning.</p></div></div>{error && <div className="form-alert">{error}</div>}
      <label className="form-field"><span>Course <small>Optional</small></span><select className="select-input" value={courseId} onChange={(event) => { setCourseId(event.target.value); setSelectedIds([]); }}><option value="">All my materials</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
      <label className="form-field"><span>Give your session a name <small>Optional</small></span><input value={sessionTitle} onChange={(event) => setSessionTitle(event.target.value)} placeholder="e.g. Reviewing cell biology" maxLength={120} /></label>
      <div className="material-picker-heading"><span className="form-label">Choose study materials</span><span>{selectedIds.length} selected · select up to 10</span></div>
      {materialsQuery.isLoading ? <LoadingLine /> : filteredMaterials.length ? <div className="material-picker">{filteredMaterials.map((material) => {
        const selected = selectedIds.includes(material.id);
        const title = String(material.fileName || material.filename || material.title || 'Untitled material');
        return <button type="button" className={`material-picker-item ${selected ? 'material-picker-selected' : ''}`} key={material.id} onClick={() => setSelectedIds((current) => selected ? current.filter((value) => value !== material.id) : current.length < 10 ? [...current, material.id] : current)}><span className="picker-file"><FileText size={17} /></span><span><b>{title}</b><small>{String(getPath(material, 'course.title', 'No course linked'))}</small></span><span className="picker-check">{selected && <Check size={14} />}</span></button>;
      })}</div> : <EmptyState icon={FileText} title="Upload notes to get started" detail="Your study buddy needs at least one material to answer questions." action={<Link className="button button-outline" to="/materials/upload"><Upload size={15} /> Upload material</Link>} />}
      <button className="button button-primary create-session-button" disabled={busy || !selectedIds.length}>{busy ? 'Setting up…' : 'Start study session'}<ArrowRight size={16} /></button>
    </form><aside className="study-session-history"><span className="eyebrow">RECENT SESSIONS</span><h3>Pick up a conversation</h3>{sessionsQuery.error && <QueryNotice error={sessionsQuery.error} />}{sessions.map((item) => <Link className="session-history-item" to={`/study-room/${item.id}`} key={String(item.id)}><span><MessageCircle size={16} /></span><div><b>{String(item.title || 'Study session')}</b><small>{item.updatedAt ? new Date(String(item.updatedAt)).toLocaleDateString() : 'Open conversation'}</small></div><ChevronRight size={15} /></Link>)}{!sessionsQuery.isLoading && !sessions.length && <p className="muted-copy">Your recent study sessions will appear here.</p>}</aside></div>
  </div>;

  const history = list<StudyMessage>(session.messages);
  const visibleMessages = [...history, ...optimisticMessages];
  return <div className="chat-page"><aside className="chat-sidebar"><div className="chat-sidebar-heading"><Link to="/study-room" className="back-link"><ArrowLeft size={14} /> All sessions</Link><span className="eyebrow">GROUNDED IN YOUR NOTES</span><h3>{String(session.title || 'Study session')}</h3></div><div className="chat-grounded-label"><span className="grounded-dot" /> ACTIVE MATERIALS</div>{sessionMaterials.map((row, index) => {
    const material = (row.material || row) as DataObject;
    return <div className="grounded-material" key={String(material.id || index)}><FileText size={15} /><span>{String(material.fileName || material.filename || material.title || 'Untitled material')}</span></div>;
  })}<div className="chat-sidebar-tip"><span>✦</span><b>Need another angle?</b><p>Ask in English or Nigerian Pidgin. Your buddy is here to help you understand.</p></div><Link className="button button-outline new-session-button" to="/study-room"><Plus size={15} /> New session</Link></aside>
    <section className="chat-main"><header className="chat-topbar"><div><span className="online-indicator" /><b>Study buddy</b><span className="chat-topbar-divider">·</span><small>Grounded in your notes</small></div><button className="icon-button" onClick={() => setShowSources(true)} aria-label="View sources"><FileText size={17} /></button></header>
      <div className="chat-messages">{sessionQuery.isLoading ? <LoadingLine /> : !visibleMessages.length ? <div className="chat-welcome"><span className="chat-welcome-icon"><Sparkles size={23} /></span><span className="eyebrow">A FRIENDLY PLACE TO GET UNSTUCK</span><h2>What would you like<br />to understand?</h2><p>Your study buddy uses the materials in this session to give you thoughtful, grounded answers.</p></div> : visibleMessages.map((message, index) => <div key={message.id || `${message.role}-${index}`} className={`chat-message ${String(message.role).toLowerCase() === 'user' ? 'chat-message-user' : 'chat-message-ai'}`}><span className="message-avatar">{String(message.role).toLowerCase() === 'user' ? (useAuth.getState().user?.name?.slice(0, 1) || 'U') : <Sparkles size={15} />}</span><div className="message-body"><span className="message-name">{String(message.role).toLowerCase() === 'user' ? 'You' : 'Study buddy'}</span><div className="markdown-content"><MarkdownContent>{String(message.content || '')}</MarkdownContent></div>{String(message.role).toLowerCase() !== 'user' && message.content && <button className="read-aloud-button" onClick={() => speak(String(message.content))}><Headphones size={14} /> Read aloud</button>}</div></div>)}
      {busy && streamText && <div className="chat-message chat-message-ai"><span className="message-avatar"><Sparkles size={15} /></span><div className="message-body"><span className="message-name">Study buddy</span><div className="markdown-content"><MarkdownContent>{streamText}</MarkdownContent><span className="stream-cursor" /></div></div></div>}
      {busy && !streamText && <div className="typing-indicator"><span /><span /><span /> Thinking through your notes…</div>}
      {error && <div className="chat-error">{error}</div>}<div ref={chatEnd} /></div>
      <div className="chat-composer-area"><div className="prompt-chips">{[['🇳🇬 Explain in Pidgin', 'Abeg break down this concept for me in Nigerian Pidgin!'], ['💡 Naija analogy', 'Give me a relatable everyday Nigerian analogy for this topic.'], ['🎯 Quiz me', 'Test my brain with one quick exam question from this material!'], ['📝 Key takeaways', 'What are the top exam takeaways I must remember from this material?']].map(([label, text]) => <button key={label} onClick={() => sendMessage(text)} disabled={busy}>{label}</button>)}</div><form className="chat-composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Ask a question about your study materials…" rows={1} /><div className="composer-bottom"><span>{listening ? 'Listening… speak your question' : 'Answers are grounded in your selected notes'}</span><div className="composer-actions">{!busy && <button type="button" className={`mic-button ${listening ? 'mic-button-active' : ''}`} onClick={dictate} aria-label={listening ? 'Stop voice input' : 'Start voice input'}><Mic size={15} /></button>}{busy ? <button type="button" className="button button-stop" onClick={() => streamController.current?.abort()}><X size={15} /> Stop generating</button> : <button className="send-button" disabled={!prompt.trim()} aria-label="Send message"><Send size={17} /></button>}</div></div></form></div>
    </section>
    {showSources && <Modal title="Sources for this session" onClose={() => setShowSources(false)}>{sources.length ? <div className="source-list">{sources.map((source, index) => { const filename = getPath(source, 'fileName', getPath(source, 'filename')); const excerpt = getPath(source, 'excerpt', getPath(source, 'content')); return <div className="source-item" key={index}><span className="source-badge">Source {index + 1}</span><b>{filename ? String(filename) : 'Filename unavailable'}{getPath(source, 'pageNumber') ? ` · Page ${String(getPath(source, 'pageNumber'))}` : ''}</b><p>{excerpt ? String(excerpt) : 'Excerpt unavailable.'}</p></div>; })}</div> : <p className="muted-copy">Source details appear after your study buddy references a note.</p>}</Modal>}
  </div>;
}

function QuizHub() {
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
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post('/quizzes/generate', { summaryId, numberOfQuestions: Number(count) });
      const quiz = unwrap<DataObject>(data);
      if (!quiz.id) throw new Error('The quiz was created, but the API did not return its identifier.');
      navigate(`/quizzes/${String(quiz.id)}?mode=${mode}`);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  return <div><PageTitle eyebrow="PRACTICE MAKES PROGRESS" title="Practice quizzes" subtitle="A low-pressure way to find out what’s sticking." />
    <div className="quiz-hub-grid"><div className="quiz-generator"><span className="generator-icon"><BookOpenCheck size={21} /></span><span className="eyebrow">MAKE A QUIZ</span><h2>Practice what you’ve learned.</h2><p>Choose a study summary and we’ll make a fresh quiz from your notes.</p>{error && <div className="form-alert">{error}</div>}
      <form className="modal-form" onSubmit={generate}><label className="form-field"><span>Study summary</span><select className="select-input" value={summaryId} onChange={(event) => setSummaryId(event.target.value)} required><option value="">Choose a summary</option>{summaries.map((summary) => <option value={String(summary.id || summary.materialId)} key={String(summary.id || summary.materialId)}>{String(summary.title || 'Untitled summary')}</option>)}</select></label><div className="quiz-options-row"><label className="form-field"><span>Questions</span><select className="select-input" value={count} onChange={(event) => setCount(event.target.value)}>{[5, 10, 15].map((number) => <option key={number} value={number}>{number} questions</option>)}</select></label><label className="form-field"><span>Mode</span><select className="select-input" value={mode} onChange={(event) => setMode(event.target.value as 'practice' | 'test')}><option value="practice">Practice mode</option><option value="test">Test mode</option></select></label></div><div className="mode-description"><span>{mode === 'practice' ? '✦' : '◷'}</span><p>{mode === 'practice' ? 'See answers and explanations as you go.' : 'Take a timed quiz and review everything at the end.'}</p></div><button className="button button-primary" disabled={busy || !summaryId}>{busy ? 'Building your quiz…' : 'Generate quiz'}<Sparkles size={16} /></button></form>
    </div><aside className="quiz-mode-card"><span className="quiz-mode-illustration"><Target size={25} /></span><span className="eyebrow">A NOTE ABOUT PRACTICE</span><h3>It’s okay to get things wrong.</h3><p>Every question helps you see what you know and what you can revisit. Your progress is yours to make.</p><div className="quiz-kind-row"><span><CheckCircle2 size={16} /> Practice mode</span><small>Learn as you go</small></div><div className="quiz-kind-row"><span><Clock3 size={16} /> Test mode</span><small>Save feedback for later</small></div></aside></div>
    <div className="section-heading section-heading-row"><div><span className="eyebrow">YOUR RECENT WORK</span><h2>Recent quizzes</h2></div></div>
    <QueryNotice error={summariesQuery.error || quizzesQuery.error} />
    {quizzesQuery.isLoading ? <LoadingLine /> : quizzes.length ? <div className="quiz-list">{quizzes.map((quiz) => <Link to={`/quizzes/${String(quiz.id)}`} className="quiz-list-item" key={String(quiz.id)}><span className="quiz-list-icon"><BookOpenCheck size={18} /></span><div><b>{String(quiz.title || 'Untitled quiz')}</b><small>{String(getPath(quiz, 'summary.title', 'Summary unavailable'))} · {String(quiz.questionCount ?? list(quiz.questions).length)} questions</small></div><span className="quiz-score">{quiz.score != null ? `${quiz.score}%` : 'Not taken'}</span><ChevronRight size={16} /></Link>)}</div> : <EmptyState icon={BookOpenCheck} title="Your quiz history starts here" detail="Generate your first quiz from a processed study summary." />}
  </div>;
}

function QuizRunner() {
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
    const timer = window.setInterval(() => setSeconds((value) => mode === 'test' && timeLimit > 0 ? Math.max(0, value - 1) : value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [mode, timeLimit]);
  const question = questions[current] || {};
  const questionId = String(question.id || current);
  const options = Array.isArray(question.options) ? question.options as unknown[] : Object.entries(question.options || {}).map(([letter, text]) => ({ letter, text }));
  const elapsedSeconds = mode === 'test' && timeLimit > 0 ? timeLimit - seconds : seconds;
  const formatTime = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  async function submitQuiz() {
    setSubmitting(true); setError('');
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
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setSubmitting(false); }
  }
  useEffect(() => {
    if (mode === 'test' && timeLimit > 0 && timerReady && seconds === 0 && query.isSuccess && questions.length && !submitting && !timeExpired.current) {
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
  return <div className="quiz-runner"><Link to="/quizzes" className="back-link page-back-link"><ArrowLeft size={15} /> All quizzes</Link><QueryNotice error={query.error} />
    <div className="quiz-runner-top"><div><span className="eyebrow">{mode === 'test' ? 'TEST MODE' : 'PRACTICE MODE'}</span><h1>{String(quiz.title || 'Untitled quiz')}</h1></div><div className={`quiz-timer ${mode === 'test' ? 'quiz-timer-amber' : ''}`}><Clock3 size={16} />{formatTime(mode === 'test' && timeLimit > 0 ? seconds : elapsedSeconds)}</div></div>
    <div className="quiz-progress-row"><span>Question {current + 1} <small>of {questions.length}</small></span><div className="progress-track"><span style={{ width: `${questions.length ? ((current + 1) / questions.length) * 100 : 0}%` }} /></div><span>{Object.keys(answers).length} answered</span></div>
    {!questions.length ? <EmptyState title="This quiz has no questions" detail="Go back and try generating another quiz." /> : <div className="question-card"><div className="question-label"><span className="question-number">Q{current + 1}</span>{question.type != null && <span>{String(question.type).replaceAll('_', ' ')}</span>}<MoreHorizontal size={17} /></div><h2>{String(question.question || question.prompt || question.text || 'Question unavailable')}</h2><div className="answer-options">{options.map((entry, index) => {
      const option = (typeof entry === 'string' ? { letter: String.fromCharCode(65 + index), text: entry } : entry) as DataObject;
      const label = String(option.label || option.letter || String.fromCharCode(65 + index));
      const text = String(option.text || option.value || option.label || '');
      const selected = answers[questionId] === label;
      const correct = String(question.correctAnswer || '') === label;
      return <button key={label} className={`answer-option ${selected ? 'answer-selected' : ''} ${feedback && correct ? 'answer-correct' : ''} ${feedback && selected && !correct ? 'answer-wrong' : ''}`} onClick={() => { setAnswers((value) => ({ ...value, [questionId]: label })); if (mode === 'practice') setFeedback(true); }}><span className="option-letter">{label}</span><span>{text}</span>{feedback && correct && <CheckCircle2 size={18} />}</button>;
    })}</div>{feedback && mode === 'practice' && <div className="answer-explanation"><Sparkles size={16} /><p>{String(question.explanation || (String(question.correctAnswer) === answers[questionId] ? 'Nice work! Keep building on that understanding.' : 'Take another look at this idea in your study summary.'))}</p></div>}
    <div className="question-footer"><button className="button button-outline" onClick={() => { setCurrent((value) => Math.max(0, value - 1)); setFeedback(false); }} disabled={!current}><ArrowLeft size={15} /> Previous</button><div>{current < questions.length - 1 ? <button className="button button-primary" onClick={() => { setCurrent((value) => value + 1); setFeedback(false); }}>Next question <ArrowRight size={15} /></button> : <button className="button button-primary" disabled={submitting} onClick={submitQuiz}>{submitting ? 'Submitting…' : 'Finish quiz'}<Check size={15} /></button>}</div></div></div>}
    {error && <div className="form-alert">{error}</div>}
    <div className="quiz-keyboard-hint">TIP <span>Use keys 1–4 to select an answer, and A / D to navigate.</span></div>
  </div>;
}

function QuizResult() {
  const { id = '' } = useParams();
  const query = useApiQuery<DataObject>('quiz-result', `/quizzes/${id}/result`, !!id);
  const result = query.data || {};
  const scoreValue = result.score ?? result.accuracy;
  const score = scoreValue == null ? null : Number(scoreValue);
  const [mistakesOnly, setMistakesOnly] = useState(false);
  const questions = list<DataObject>(result.questions || result.answers);
  const shown = questions.filter((question) => !mistakesOnly || question.isCorrect === false || question.correct === false);
  if (query.isLoading) return <LoadingLine />;
  return <div><Link to="/quizzes" className="back-link page-back-link"><ArrowLeft size={15} /> Quizzes</Link><PageTitle eyebrow="LOOK HOW FAR YOU’VE COME" title="Quiz results" subtitle={String(getPath(result, 'quiz.title', 'Quiz results'))} /><QueryNotice error={query.error} />
    <div className="result-overview"><div className="result-score"><span className="eyebrow">YOUR SCORE</span>{score == null ? <div className="score-gauge"><span>—</span></div> : <div className="score-gauge" style={{ '--score': `${score}%` } as React.CSSProperties}><span>{score}<small>%</small></span></div>}<span className="grade-pill">Grade {String(result.grade || (score == null ? '—' : score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'Keep going'))}</span></div><div className="result-summary"><span className="eyebrow">NICE WORK SHOWING UP</span><h2>Every attempt is progress.</h2><p>Take a moment to review what felt easy and what you’d like to explore a little more.</p><div className="result-stats"><div><b>{String(result.xpEarned ?? '—')}</b><span>XP earned</span></div><div><b>{String(result.timeTaken != null ? formatDuration(Number(result.timeTaken)) : '—')}</b><span>Time taken</span></div><div><b>{String(result.correctCount ?? '—')} / {String(result.totalQuestions ?? questions.length)}</b><span>Correct</span></div></div><Link to="/quizzes" className="button button-primary">Back to quizzes <ArrowRight size={15} /></Link></div></div>
    <div className="section-heading section-heading-row"><div><span className="eyebrow">YOUR ANSWER REVIEW</span><h2>Question breakdown</h2></div><button className={`mistakes-toggle ${mistakesOnly ? 'mistakes-toggle-active' : ''}`} onClick={() => setMistakesOnly(!mistakesOnly)}>{mistakesOnly ? 'Show all questions' : 'Mistakes to review only'}</button></div>
    {shown.map((question, index) => <div className="review-question" key={String(question.id || index)}><span className={`review-result-icon ${question.isCorrect || question.correct ? 'review-correct' : 'review-incorrect'}`}>{question.isCorrect || question.correct ? <Check size={16} /> : <X size={16} />}</span><div><b>{String(question.question || question.prompt || question.text || 'Question unavailable')}</b><p>Your answer: {String(question.selectedAnswer || question.userAnswer || 'Not answered')} · Correct answer: {String(question.correctAnswer || 'Unavailable')}</p>{Boolean(question.explanation) && <small>{String(question.explanation)}</small>}</div></div>)}
  </div>;
}

function ProgressPage() {
  const progressQuery = useApiQuery<DataObject>('progress', '/progress');
  const streakQuery = useApiQuery<DataObject>('streak', '/streaks/me');
  const progress = progressQuery.data || {};
  const weekly = list<DataObject>(progress.weeklyStudyHours);
  const chartDays = weekly;
  const subjects = list<DataObject>(progress.subjectPerformance);
  return <div><PageTitle eyebrow="YOUR LEARNING JOURNEY" title="Progress & analytics" subtitle="A gentle look at the effort you’ve been putting in." /><QueryNotice error={progressQuery.error || streakQuery.error} />
    <div className="progress-stats-grid"><StatCard icon={Clock3} label="Study time" value={progress.totalStudyTime != null ? formatStudyHours(Number(progress.totalStudyTime)) : '—'} note="Time spent practicing" color="stat-blue" /><StatCard icon={BookOpenCheck} label="Quizzes taken" value={String(progress.totalQuizzesTaken ?? '—')} note="Every try counts" color="stat-violet" /><StatCard icon={Target} label="Overall accuracy" value={progress.quizAccuracy != null ? `${Math.round(Number(progress.quizAccuracy))}%` : '—'} note="Across all your quizzes" color="stat-green" /><StatCard icon={Flame} label="Current streak" value={`${String(streakQuery.data?.current ?? '—')} days`} note="One day at a time" color="stat-amber" /></div>
    <div className="analytics-grid"><section className="analytics-card"><div className="section-heading section-heading-row"><div><span className="eyebrow">THIS WEEK</span><h2>Your study rhythm</h2></div><span className="chart-caption">Study activity</span></div>{chartDays.length ? <div className="weekly-chart">{chartDays.map((day, index) => { const amount = Number(day.hours || 0); const height = Math.min(100, amount * 20); return <div className="chart-day" key={String(day.day || index)} title={`${String(day.day || '')}: ${formatStudyHours(amount)}`}><div className="chart-bar-wrap"><span className={amount ? 'chart-bar chart-bar-active' : 'chart-bar'} style={{ height: `${height}%` }} /></div><span>{String(day.day || '')}</span></div>; })}</div> : <p className="muted-copy">Study activity will appear here when available.</p>}</section>
      <section className="analytics-card streak-card"><div className="streak-card-art"><Flame size={25} fill="currentColor" /></div><span className="eyebrow">YOUR STUDY STREAK</span><h2>{String(streakQuery.data?.current ?? '—')} days</h2><p>You’re building a habit that will take you places.</p>{chartDays.length > 0 && <div className="streak-week">{chartDays.map((day, index) => { const label = String(day.day || index + 1); const active = Number(day.hours || 0) > 0; return <span className={active ? 'streak-day streak-day-on' : 'streak-day'} title={`${label}: ${active ? 'Activity recorded' : 'No activity recorded'}`} key={`${label}-${index}`}>{label.slice(0, 1)}</span>; })}</div>}</section></div>
    <section className="analytics-card mastery-card"><div className="section-heading"><span className="eyebrow">SUBJECT MASTERY</span><h2>Where you’re building confidence</h2></div>{subjects.length ? subjects.map((subject, index) => <div className="mastery-row" key={String(subject.subject || subject.name || index)}><span>{String(subject.subject || subject.name || 'Subject')}</span><div className="progress-track"><span style={{ width: `${Math.min(100,Number(subject.score || 0))}%` }} /></div><b>{`${Math.round(Number(subject.score || 0))}%`}</b></div>) : <p className="muted-copy">Subject performance will show here as you complete quizzes.</p>}</section>
  </div>;
}

function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('All');
  const result = useApiQuery<unknown>('notifications', '/notifications');
  const notifications = list<DataObject>(result.data, 'notifications');
  const visible = notifications.filter((notification) => filter === 'All' || !notification.readAt && !notification.isRead);
  async function markAllRead() {
    try { await api.patch('/notifications/read-all'); await queryClient.invalidateQueries({ queryKey: ['notifications'] }); }
    catch (error) { window.alert(getErrorMessage(error)); }
  }
  async function markRead(notification: DataObject) {
    if (!notification.id || notification.readAt || notification.isRead) return;
    try { await api.patch(`/notifications/${notification.id}`); await queryClient.invalidateQueries({ queryKey: ['notifications'] }); }
    catch (error) { window.alert(getErrorMessage(error)); }
  }
  return <div><PageTitle eyebrow="A LITTLE NUDGE, WHEN YOU NEED IT" title="Notifications" subtitle="Helpful reminders and updates from your study space." action={<button className="button button-outline" onClick={markAllRead}>Mark all as read</button>} /><QueryNotice error={result.error} /><div className="filter-tabs notification-filters">{['All', 'Unread'].map((name) => <button className={filter === name ? 'filter-active' : ''} onClick={() => setFilter(name)} key={name}>{name}</button>)}</div>
    {result.isLoading ? <LoadingLine /> : visible.length ? <div className="notification-list">{visible.map((item, index) => <button className={`notification-item ${item.readAt || item.isRead ? '' : 'notification-unread'}`} key={String(item.id || index)} onClick={() => void markRead(item)}><span className="notification-item-icon"><Sparkles size={17} /></span><span><b>{String(item.title || 'Notification')}</b><small>{String(item.message || item.body || '')}</small><small>{item.createdAt ? new Date(String(item.createdAt)).toLocaleString() : ''}</small></span>{!item.readAt && !item.isRead && <span className="unread-dot" />}</button>)}</div> : <EmptyState icon={CheckCircle2} title="You’re all caught up" detail="When something needs your attention, you’ll find it here." />}
  </div>;
}

function ProfilePage() {
  const user = useAuth((state) => state.user);
  const queryClient = useQueryClient();
  const profileQuery = useApiQuery<DataObject>('profile', '/profile');
  const profile = profileQuery.data || {};
  const profileStats = getPath(profile, 'stats', {}) as DataObject;
  const profileName = String(profile.name || user?.name || 'Your profile');
  const profileUsername = String(profile.username || user?.username || '');
  const profileEmail = String(profile.email || user?.email || '—');
  const profileUniversity = String(profile.university || user?.university || 'Add your institution');
  const profileProgram = String(profile.program || user?.program || 'Not added yet');
  const profileYear = profile.yearOfStudy || user?.yearOfStudy;
  const avatarInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  async function uploadAvatar(file?: File) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choose a JPG, PNG or WebP image smaller than 5 MB.');
      return;
    }
    const body = new FormData();
    body.append('file', file);
    setAvatarBusy(true);
    setError('');
    try {
      const { data } = await api.post('/profile/avatar', body);
      const updated = unwrap<Partial<typeof user>>(data);
      const current = useAuth.getState();
      if (current.user) useAuth.setState({ user: { ...current.user, ...updated } });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccess('Your profile photo has been updated.');
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setAvatarBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      const { data } = await api.patch('/profile', { name, username });
      const update = unwrap<Partial<typeof user>>(data);
      const current = useAuth.getState();
      if (current.user && current.accessToken && current.refreshToken) current.setSession({ user: { ...current.user, ...update }, accessToken: current.accessToken, refreshToken: current.refreshToken });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccess('Your profile has been updated.'); setEditing(false);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setBusy(false); }
  }
  return <div className="narrow-page"><PageTitle eyebrow="THE PERSON BEHIND THE PROGRESS" title="Your profile" subtitle="A little space that’s yours." /><QueryNotice error={profileQuery.error} /><div className="profile-card">  <div className="profile-hero"><div className="profile-avatar-wrap"><input ref={avatarInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => void uploadAvatar(event.target.files?.[0])} /><button className="profile-large-avatar" onClick={() => avatarInput.current?.click()} aria-label="Change profile photo">{profile.avatarUrl || user?.avatarUrl ? <img src={String(profile.avatarUrl || user?.avatarUrl)} alt="" /> : profileName.slice(0, 1).toUpperCase()}</button><small>{avatarBusy ? 'Uploading…' : 'Change photo'}</small></div><div><h2>{profileName}</h2>{profileUsername && <span>@{profileUsername}</span>}</div><button className="button button-outline" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit profile'}</button></div>{success && <div className="success-alert"><CheckCircle2 size={16} />{success}</div>}{error && <div className="form-alert">{error}</div>}
    {editing && <form className="modal-form profile-edit-form" onSubmit={save}><label className="form-field"><span>Full name</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label><label className="form-field"><span>Username</span><input value={username} onChange={(event) => setUsername(event.target.value)} required /></label><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}<Check size={15} /></button></form>}
    <div className="profile-details"><div><span>Email address</span><b>{profileEmail}</b></div><div><span>Institution</span><b>{profileUniversity}</b></div><div><span>Programme</span><b>{profileProgram}</b></div><div><span>Year of study</span><b>{profileYear ? `Year ${profileYear}` : 'Not added yet'}</b></div></div>
    <div className="profile-stats-row"><div><BookOpen size={16} /><b>{String(profileStats.totalCourses ?? '—')}</b><span>Courses</span></div><div><BookOpenCheck size={16} /><b>{String(profileStats.totalQuizzes ?? '—')}</b><span>Quizzes</span></div><div><Flame size={16} /><b>{String(profileStats.currentStreak ?? '—')}</b><span>Day streak</span></div></div>
    <div className="profile-xp-card"><span className="profile-xp-icon"><Sparkles size={20} /></span><div><b>{profileStats.level != null ? `Level ${String(profileStats.level)}` : 'Level unavailable'}</b><span>{profileStats.totalXp != null ? `${Number(profileStats.totalXp).toLocaleString()} XP earned` : 'XP unavailable'} <i>·</i> {profileStats.studyHours != null ? `${formatStudyHours(Number(profileStats.studyHours))} study time` : 'Study time unavailable'}</span></div></div>
    <Link className="profile-academic-link" to="/onboarding/academic-setup"><GraduationCap size={16} /> Update academic details <ArrowRight size={15} /></Link></div></div>;
}

function SettingsPage() {
  const result = useApiQuery<DataObject>('settings', '/settings');
  const [theme, setTheme] = useState(localStorage.getItem('slotstudy-theme') || 'system');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState({ pushEnabled: false, emailEnabled: true, studyReminders: true, reminderTime: '19:00' });
  const [autoPlay, setAutoPlay] = useState(false);
  useEffect(() => {
    if (!result.data) return;
    const savedTheme = String(getPath(result.data, 'preferences.theme', theme));
    const savedNotifications = getPath(result.data, 'notifications');
    setTheme(savedTheme);
    setNotifications((current) => ({ ...current, ...(savedNotifications as Partial<typeof current>) }));
    setAutoPlay(Boolean(getPath(result.data, 'preferences.autoPlay', false)));
    window.dispatchEvent(new CustomEvent('slotstudy-theme-change', { detail: savedTheme }));
  }, [result.data]);
  async function saveSettings() {
    setBusy(true); setMessage('');
    try {
      await api.patch('/settings', { notifications, preferences: { theme, autoPlay } });
      localStorage.setItem('slotstudy-theme', theme);
      window.dispatchEvent(new CustomEvent('slotstudy-theme-change', { detail: theme }));
      setMessage('Your preferences have been saved.');
    }
    catch (error) { setMessage(getErrorMessage(error)); }
    finally { setBusy(false); }
  }
  async function deleteAccount() {
    if (!window.confirm('Permanently delete your account and study data? This cannot be undone.')) return;
    try { await api.delete('/settings/account'); useAuth.getState().logout(); window.location.assign('/login'); }
    catch (error) { setMessage(getErrorMessage(error)); }
  }
  return <div className="narrow-page"><PageTitle eyebrow="MAKE IT FEEL LIKE YOURS" title="Settings" subtitle="Set up your study space the way you like it." /><QueryNotice error={result.error} />
    {result.data ? <>
      <section className="settings-card"><span className="eyebrow">APPEARANCE</span><h3>A comfortable place to focus</h3><p>Choose how SlotStudy looks on this device.</p><div className="theme-choices">{['light', 'dark', 'system'].map((choice) => <button key={choice} onClick={() => { setTheme(choice); window.dispatchEvent(new CustomEvent('slotstudy-theme-change', { detail: choice })); }} className={theme === choice ? 'theme-choice theme-choice-selected' : 'theme-choice'}>{choice === 'light' ? '☼' : choice === 'dark' ? '☾' : '◐'}<span>{choice[0].toUpperCase() + choice.slice(1)}</span>{theme === choice && <Check size={15} />}</button>)}</div></section>
      <section className="settings-card"><span className="eyebrow">YOUR STUDY RHYTHM</span><h3>Reminders and preferences</h3><p>Choose how we can help you keep a steady learning rhythm.</p><label className="setting-toggle"><span><b>Study reminders</b><small>Get a gentle nudge to make time for learning.</small></span><input type="checkbox" checked={notifications.studyReminders} onChange={(event) => setNotifications((value) => ({ ...value, studyReminders: event.target.checked }))} /></label><label className="setting-toggle"><span><b>Email notifications</b><small>Receive important study updates by email.</small></span><input type="checkbox" checked={notifications.emailEnabled} onChange={(event) => setNotifications((value) => ({ ...value, emailEnabled: event.target.checked }))} /></label><label className="setting-toggle"><span><b>Push notifications</b><small>Allow reminders on this device.</small></span><input type="checkbox" checked={notifications.pushEnabled} onChange={(event) => setNotifications((value) => ({ ...value, pushEnabled: event.target.checked }))} /></label><label className="form-field reminder-time"><span>Preferred reminder time</span><input type="time" value={notifications.reminderTime} onChange={(event) => setNotifications((value) => ({ ...value, reminderTime: event.target.value }))} /></label><label className="setting-toggle"><span><b>Auto-play read aloud</b><small>Play voice narration when opening a summary.</small></span><input type="checkbox" checked={autoPlay} onChange={(event) => setAutoPlay(event.target.checked)} /></label><button className="button button-primary settings-save" onClick={saveSettings} disabled={busy}>{busy ? 'Saving…' : 'Save preferences'}<Check size={15} /></button>{message && <div className={message.includes('saved') ? 'success-alert' : 'form-alert'}>{message}</div>}</section>
    </> : result.isLoading ? <LoadingLine /> : <EmptyState title="Settings unavailable" detail="Your saved preferences could not be loaded." />}
    <section className="settings-card danger-card"><span className="eyebrow">DANGER ZONE</span><h3>Delete your account</h3><p>Deleting your account permanently removes your personal study data.</p><button className="button button-danger" onClick={deleteAccount}>Delete account permanently</button></section>
  </div>;
}

function SubscriptionPage() {
  const plansQuery = useApiQuery<unknown>('subscription-plans', '/subscriptions/plans');
  const subscriptionQuery = useApiQuery<DataObject>('subscription', '/subscriptions');
  const plans = list<DataObject>(plansQuery.data, 'plans');
  const subscription = subscriptionQuery.data || {};
  const planName = subscription.plan ? String(subscription.plan).toUpperCase() : '—';
  return <div className="narrow-page"><PageTitle eyebrow="YOUR STUDY PLAN" title="Subscription" subtitle="View your current plan and available options." /><QueryNotice error={plansQuery.error || subscriptionQuery.error} /><div className="subscription-card"><span className="plan-badge"><Sparkles size={14} /> CURRENT PLAN</span><h2>{planName}</h2><p>{subscription.isActive === true ? 'Your subscription is active.' : subscription.isActive === false ? 'Your subscription is not active.' : 'Subscription status is unavailable.'}</p>{subscription.expiresAt != null && <div className="plan-feature">Expires {new Date(String(subscription.expiresAt)).toLocaleDateString()}</div>}{plans.length ? plans.map((plan, index) => <div className="plan-feature" key={String(plan.id || plan.name || index)}><b>{String(plan.name || plan.title || 'Plan')}</b>{plan.description != null && <span> · {String(plan.description)}</span>}</div>) : !plansQuery.error && <div className="subscription-coming">No purchasable plans are available right now.</div>}</div></div>;
}

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [['How does the study buddy know what to answer?', 'The study buddy is grounded in the materials you select for a session. It uses those notes to help answer your questions, rather than relying on general answers alone.'], ['What file types can I upload?', 'You can upload PDF, PNG and JPG files up to 50 MB.'], ['Can I ask questions in Nigerian Pidgin?', 'Yes. Ask in Nigerian Pidgin or English, or use one of the prompt suggestions in a study-room conversation.'], ['What happens to my study materials?', 'Materials are linked to your personal study account and used to support your learning features.']];
  return <div className="narrow-page"><PageTitle eyebrow="HERE WHEN YOU NEED A HAND" title="Help & support" subtitle="A few answers to help you get more from your study space." /><div className="faq-card">{faqs.map(([question, answer], index) => <div className="faq-item" key={question}><button onClick={() => setOpen(open === index ? null : index)}><b>{question}</b><ChevronDown className={open === index ? 'faq-open' : ''} size={17} /></button>{open === index && <p>{answer}</p>}</div>)}</div><div className="support-card"><span><MessageCircle size={19} /></span><div><b>Still need a hand?</b><p>We’d love to hear from you.</p></div><a className="button button-outline" href="mailto:support@slotstudy.app">Email support <ArrowRight size={14} /></a></div></div>;
}

export function WorkspacePage() {
  const { pathname } = useLocation();
  if (pathname === '/courses') return <CourseLibrary />;
  if (pathname.startsWith('/courses/')) return <CourseDetail />;
  if (pathname === '/materials/upload') return <UploadPage />;
  if (pathname === '/ai') return <MaterialsPage />;
  if (pathname.startsWith('/summaries/')) return <SummaryDetail />;
  if (pathname === '/study-room' || pathname.startsWith('/study-room/')) return <StudyRoom />;
  if (pathname === '/quizzes') return <QuizHub />;
  if (pathname.startsWith('/quizzes/') && pathname.endsWith('/result')) return <QuizResult />;
  if (pathname.startsWith('/quizzes/')) return <QuizRunner />;
  if (pathname === '/progress') return <ProgressPage />;
  if (pathname === '/notifications') return <NotificationsPage />;
  if (pathname === '/profile') return <ProfilePage />;
  if (pathname === '/settings') return <SettingsPage />;
  if (pathname === '/subscription') return <SubscriptionPage />;
  return <HelpPage />;
}
