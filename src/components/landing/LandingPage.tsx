import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Flame,
  FolderKanban,
  Laptop,
  Menu,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
  Upload,
  X,
} from 'lucide-react';
import HeroScene3D from './HeroScene3D';
import Reveal from './Reveal';

/** Point this at your hosted APK (set `VITE_ANDROID_APK_URL` in Vercel) – falls back to /downloads/. */
const APK_URL: string = import.meta.env.VITE_ANDROID_APK_URL || '/downloads/SlotStudy.apk';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#strata', label: 'Study Tools' },
  { href: '#how', label: 'How It Works' },
  { href: '#mobile', label: 'Android APK' },
  { href: '#faq', label: 'FAQ' },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Document Summarizer',
    text: 'Turn 60-page lecture slides, textbooks, and PDF handouts into executive study briefs, core formulas, and key exam flashpoints in seconds.',
    tone: 'bg-blue-500/10 text-blue-600 border border-blue-200/60',
  },
  {
    icon: BrainCircuit,
    title: 'Virtual 24/7 Study Buddy',
    text: 'Stuck on a tricky concept at 2 AM? Ask your AI tutor for intuitive analogies, mathematical breakdowns, and step-by-step problem explanations.',
    tone: 'bg-purple-500/10 text-purple-600 border border-purple-200/60',
  },
  {
    icon: BookOpenCheck,
    title: 'Adaptive Practice Quizzes',
    text: 'Generate high-yield multiple-choice questions directly from your course syllabus with immediate rationale explanations and score tracking.',
    tone: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/60',
  },
  {
    icon: FolderKanban,
    title: 'Organized Course Library',
    text: 'Keep lecture handouts, materials, study notes, and generated summaries neatly separated by course rather than buried across desktop folders.',
    tone: 'bg-amber-500/10 text-amber-600 border border-amber-200/60',
  },
  {
    icon: Flame,
    title: 'Daily Streaks & XP Rewards',
    text: 'Build an unbreakable study habit. Earn XP with every summary read and quiz completed, leveling up as you prepare for midterms and finals.',
    tone: 'bg-orange-500/10 text-orange-600 border border-orange-200/60',
  },
  {
    icon: CalendarClock,
    title: 'Exam Countdown & Telemetry',
    text: 'Track exact completion rates per subject and set exam targets so you are never caught unprepared when revision week arrives.',
    tone: 'bg-cyan-500/10 text-cyan-600 border border-cyan-200/60',
  },
];

const STEPS = [
  {
    icon: Upload,
    num: '01',
    title: 'Upload Course Materials',
    text: 'Upload lecture slides, PDF handouts, or paste syllabus notes directly into your course workspace.',
  },
  {
    icon: Sparkles,
    num: '02',
    title: 'Instant AI Synthesis',
    text: 'SlotStudy analyzes the material to extract core definitions, formulas, and high-yield exam takeaways.',
  },
  {
    icon: Trophy,
    num: '03',
    title: 'Master & Practice',
    text: 'Take adaptive practice quizzes, chat with your study buddy, and sync your streak seamlessly to Android.',
  },
];

const FAQS = [
  {
    q: 'What types of study materials can I upload?',
    a: 'You can upload lecture slides (PDF), handouts, textbook chapters, past test questions, or raw text notes. SlotStudy automatically parses the text and extracts key concepts, formulas, and structured summaries.',
  },
  {
    q: 'How does the Android APK sync with the web version?',
    a: 'Everything is synchronized in real-time to your SlotStudy cloud account. Any course material you upload on your laptop is instantly accessible on your Android phone, complete with your summaries, quizzes, and streak progress.',
  },
  {
    q: 'Can I test my knowledge with practice quizzes?',
    a: 'Yes! SlotStudy automatically generates exam-style multiple-choice questions from your summaries. You get immediate explanations for every correct and incorrect option so you learn as you quiz.',
  },
  {
    q: 'How do I install the Android APK on my phone?',
    a: 'Click "Download Android App" to get the direct .apk file. When prompted on your Android phone, enable installation from your browser or file manager ("Install unknown apps"), and open the app to sign in.',
  },
  {
    q: 'Is SlotStudy free for students to get started?',
    a: 'Yes, creating an account takes under 30 seconds and gives you free access to course creation, document summaries, practice quizzes, and the Android mobile app.',
  },
  {
    q: 'Are the AI summaries accurate for exam revision?',
    a: 'SlotStudy uses curriculum-grounded models tuned specifically for academic comprehension. While it captures key formulas and definitions with exceptional precision, we always encourage using it alongside your official lecture materials.',
  },
];

const MATERIAL_TAGS = [
  'Lecture Slides (PDF)',
  'Past Exam Questions',
  'Textbook Chapters',
  'Lab Handouts',
  'Revision Summaries',
  'Formula Sheets',
  'Study Guides',
  'Course Syllabi',
];

/* ------------------------------------------------------------------ */
/* Reusable Brand Logo Lockup                                          */
/* ------------------------------------------------------------------ */

function SlotStudyBrandLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

  return (
    <div className="flex items-center gap-2.5 select-none">
      <img
        src="/images/slotstudy-icon.png"
        alt="SlotStudy"
        className={`${iconSizes[size]} object-contain drop-shadow-sm transition-transform group-hover:scale-105`}
      />
      <div className="flex flex-col">
        <div className={`flex items-baseline font-[Manrope] ${textSizes[size]} font-extrabold tracking-tight leading-none`}>
          <span className="text-[#2563eb]">Slot</span>
          <span className="text-[#10b981]">Study</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b] ml-0.5 inline-block" />
        </div>
        <span className="text-[9px] font-semibold text-[#68728a] tracking-wider uppercase mt-0.5 font-mono">
          AI Academic Workspace
        </span>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text?: string }) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
        <Sparkles size={12} className="text-[#2563eb]" />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-[Manrope] text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-3 text-base leading-relaxed text-[#64748b]">{text}</p>}
    </Reveal>
  );
}

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_25px_50px_-20px_rgb(37_99_235/15%)]">
      <div className="flex items-center gap-3 border-b border-slate-150 bg-slate-50/80 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
        </div>
        <div className="mx-auto flex max-w-sm flex-1 items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] font-mono text-slate-500 ring-1 ring-slate-200">
          <ShieldCheck size={11} className="text-[#10b981]" />
          {url}
        </div>
        <div className="w-10" />
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive Tool Simulations                                        */
/* ------------------------------------------------------------------ */

function SummaryPreview() {
  return (
    <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2 bg-gradient-to-b from-white to-slate-50/50">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-600">
              <FileText size={15} />
            </span>
            <span className="font-mono text-[11px]">BIO201_Cell_Respiration.pdf</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-600 font-bold">24 pages</span>
        </div>
        <div className="space-y-3">
          {[92, 100, 78, 96, 64, 88, 100, 70].map((w, i) => (
            <div
              key={i}
              className={`relative h-2.5 overflow-hidden rounded-full ${i === 2 || i === 5 ? 'bg-blue-200' : 'bg-slate-100'}`}
              style={{ width: `${w}%` }}
            >
              {(i === 2 || i === 5) && <span className="ls-shimmer absolute inset-0" />}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg bg-slate-50 border border-slate-200/60 p-3 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Parsing formulas &amp; diagrams…</span>
          <span className="text-[#10b981] font-bold">100% processed</span>
        </div>
      </div>

      <div className="ls-panel rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#2563eb] font-mono">
            <Sparkles size={11} /> AI STRUCTURED SUMMARY
          </span>
          <span className="text-[11px] font-mono text-slate-400">3 min read</span>
        </div>
        <h4 className="font-[Manrope] text-base font-extrabold text-slate-900">
          Cellular Respiration: High-Yield Breakdown
        </h4>
        <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-slate-600">
          {[
            'Glycolysis converts glucose into 2 pyruvate molecules (+2 net ATP, cytoplasm).',
            'Krebs Cycle oxidizes acetyl-CoA, producing NADH and FADH2 carriers (mitochondria).',
            'Electron Transport Chain utilizes proton gradient to yield 32-34 ATP with oxygen.',
          ].map((item, idx) => (
            <li key={idx} className="flex gap-2 items-start">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#10b981]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200/80 px-3.5 py-2.5 text-[12px] text-amber-900 flex items-start gap-2">
          <span className="text-amber-600 font-bold shrink-0">⚡ Exam Flashpoint:</span>
          <span>Know the exact ATP yield difference between aerobic vs anaerobic respiration.</span>
        </div>
      </div>
    </div>
  );
}

function BuddyPreview() {
  return (
    <div className="space-y-4 bg-slate-50/70 p-6 sm:p-8">
      <div className="ls-panel flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#2563eb] px-4 py-3 text-[13px] text-white shadow-md shadow-blue-500/20 font-medium">
          I don't understand why the Krebs cycle matters if it only makes 2 ATP directly?
        </div>
      </div>
      <div className="ls-panel flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#7658d6] text-white shadow-md">
          <BrainCircuit size={15} />
        </span>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-slate-700 shadow-sm">
          Great question! Think of the Krebs cycle as an <b>energy extraction refinery</b> rather than the main power generator 💡
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-slate-600">
            <li>Its real job isn't making ATP directly — it strips high-energy electrons from fuel molecules.</li>
            <li>It packs those electrons into carriers called <b>NADH</b> and <b>FADH2</b>.</li>
            <li>Those carriers feed the Electron Transport Chain, where <b>over 90% of your total ATP</b> is synthesized!</li>
          </ol>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
            <span>Ready for a quick 1-question quiz on this?</span>
            <span className="text-emerald-600 font-mono">+25 XP</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] text-slate-400 shadow-sm">
        <span>Ask anything about your lecture slides…</span>
        <span className="ml-auto grid h-7 w-7 place-items-center rounded-lg bg-[#2563eb] text-white">
          <Send size={13} />
        </span>
      </div>
    </div>
  );
}

function QuizPreview() {
  const options = ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'];
  const correct = 1;
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  return (
    <div className="p-6 sm:p-8 bg-white">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-slate-500 uppercase tracking-wider">
          Practice Question 3 of 10 · BIO201
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 font-mono font-bold text-amber-700">
          <Flame size={13} className="text-amber-500" /> 3 in a row
        </span>
      </div>
      <div className="ls-bar mb-6">
        <span style={{ ['--w' as string]: '35%', background: 'linear-gradient(90deg,#2563eb,#10b981)' }} />
      </div>
      <h4 className="font-[Manrope] text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
        Which cellular organelle is the primary site of the Krebs cycle and oxidative phosphorylation?
      </h4>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          const isCorrect = answered && i === correct;
          const isWrong = answered && picked === i && i !== correct;
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                isCorrect
                  ? 'border-[#10b981] bg-emerald-50 text-[#047857] shadow-sm'
                  : isWrong
                    ? 'border-red-400 bg-red-50 text-red-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#2563eb] hover:bg-blue-50/50 disabled:hover:translate-y-0'
              }`}
            >
              <span>{option}</span>
              {isCorrect && <Check size={18} className="ls-pop text-[#10b981]" />}
              {isWrong && <X size={18} className="ls-pop text-red-500" />}
            </button>
          );
        })}
      </div>
      {answered ? (
        <div className="ls-panel mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 text-[13px] leading-relaxed text-slate-700">
          <b className={picked === correct ? 'text-[#10b981]' : 'text-red-600'}>
            {picked === correct ? '✓ Correct! +50 XP added' : '✗ Incorrect.'}
          </b>{' '}
          The <b>mitochondria</b> host both the citric acid (Krebs) cycle within the matrix and the electron transport chain along the inner cristae membrane.
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:underline"
            >
              <RefreshCw size={13} /> Try question again
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs font-mono text-slate-400">
          👆 Click an option above to test real instant feedback.
        </p>
      )}
    </div>
  );
}

function ProgressPreview() {
  const days = [40, 65, 30, 85, 60, 95, 75];
  const courses = [
    { name: 'Biology 201: Cell Biology', pct: 82, color: '#2563eb' },
    { name: 'Organic Chemistry II', pct: 64, color: '#10b981' },
    { name: 'Applied Biostatistics', pct: 45, color: '#f59e0b' },
  ];

  return (
    <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-5 bg-white">
      <div className="space-y-4 md:col-span-2">
        <div className="ls-panel rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#10b981] p-5 text-white shadow-xl shadow-blue-500/20">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white/80">
            <Flame size={14} className="text-[#fbbf24]" /> CURRENT STUDY STREAK
          </div>
          <div className="mt-1 font-[Manrope] text-4xl font-extrabold">14 Days</div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/90 border-t border-white/20 pt-2 font-mono">
            <span>2,450 XP Earned</span>
            <span className="font-bold bg-white/20 px-2 py-0.5 rounded">Level 6</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
          <div className="mb-3 text-xs font-bold text-slate-500 font-mono uppercase">Activity This Week</div>
          <div className="flex h-20 items-end gap-2">
            {days.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full origin-bottom rounded-md bg-gradient-to-t from-[#2563eb] to-[#38bdf8]"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-mono text-slate-400">{'MTWTFSS'[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 p-5 md:col-span-3 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-sm font-extrabold text-slate-900 font-[Manrope]">Course Revision Telemetry</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            <Target size={12} /> Midterm in 12 days
          </span>
        </div>
        {courses.map((c) => (
          <div key={c.name} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>{c.name}</span>
              <span className="font-mono font-bold text-slate-900">{c.pct}%</span>
            </div>
            <div className="ls-bar">
              <span style={{ ['--w' as string]: `${c.pct}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEW_TABS = [
  { id: 'summary', label: 'AI Summaries', icon: Sparkles, url: 'slotstudyonline.com/summaries', Comp: SummaryPreview },
  { id: 'buddy', label: 'Virtual Study Buddy', icon: BrainCircuit, url: 'slotstudyonline.com/study-room', Comp: BuddyPreview },
  { id: 'quiz', label: 'Quiz Arena', icon: BookOpenCheck, url: 'slotstudyonline.com/quizzes', Comp: QuizPreview },
  { id: 'progress', label: 'Progress & Streaks', icon: Trophy, url: 'slotstudyonline.com/progress', Comp: ProgressPreview },
] as const;

/* ------------------------------------------------------------------ */
/* Main Landing Page Component                                         */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tab, setTab] = useState<(typeof PREVIEW_TABS)[number]['id']>('summary');

  // FAQ Accordion State: ALL start closed by default as requested!
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // APK Modal State
  const [apkOpen, setApkOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!apkOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setApkOpen(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [apkOpen]);

  const active = PREVIEW_TABS.find((t) => t.id === tab) ?? PREVIEW_TABS[0];
  const ActivePreview = active.Comp;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8faff] font-[DM_Sans] text-slate-800 selection:bg-[#2563eb] selection:text-white">
      {/* Background Architectural Grid & Subtle Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ls-grid-bg absolute inset-0 opacity-70" />
        <div className="ls-orb absolute -left-20 top-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[130px]" />
        <div
          className="ls-orb absolute -right-20 top-40 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px]"
          style={{ animationDelay: '-6s' }}
        />
      </div>

      {/* =========================================================================
          1. NAVBAR
          ========================================================================= */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-slate-200/80 bg-white/90 shadow-[0_4px_20px_-10px_rgb(37_99_235/15%)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Official SlotStudy Brand Logo */}
          <Link to="/" aria-label="SlotStudy home" className="group flex items-center">
            <SlotStudyBrandLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#2563eb]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setApkOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700 font-mono hover:bg-emerald-100 transition-colors"
            >
              <Smartphone size={13} className="text-emerald-600" />
              <span>Android APK v1.0.0</span>
            </button>

            <Link
              to="/login"
              className="hidden sm:inline-flex rounded-lg px-3.5 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/35"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="ls-panel border-t border-slate-200 bg-white px-4 pb-6 pt-3 md:hidden shadow-xl">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2563eb]"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setApkOpen(true);
                }}
                className="rounded-xl border border-emerald-300 bg-emerald-50 py-2.5 text-center text-xs font-mono font-bold text-emerald-700 flex items-center justify-center gap-2"
              >
                <Smartphone size={15} /> Download Android APK (v1.0.0)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200 py-2.5 text-center text-sm font-bold text-slate-700"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-[#2563eb] py-2.5 text-center text-sm font-bold text-white shadow-md shadow-blue-500/25"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION & 3D INTERACTIVE EXPERIENCE
          ========================================================================= */}
      <section className="relative isolate overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          {/* Left Column: Headlines & Dual CTAs */}
          <div className="lg:col-span-6 text-left">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-mono font-bold text-[#2563eb] shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>AI-POWERED ACADEMIC ACCELERATOR</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-5 font-[Manrope] text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                Master Every Course.
                <span className="block mt-1 bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#10b981] bg-clip-text text-transparent">
                  Powered by AI.
                </span>
                <span className="block mt-1 text-slate-700 text-3xl sm:text-4xl font-bold">
                  Engineered for Top Grades.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
                Transform messy lecture slides, 60-page PDF textbooks, and syllabus notes into instant structured study briefs, practice quiz arenas, and a 24/7 AI tutor. Synchronized across Web and Android.
              </p>
            </Reveal>

            <Reveal delay={240}>
              {/* Dual Primary Conversion Buttons */}
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row items-stretch sm:items-center">
                {/* 1. Web CTA */}
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#2563eb] px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40"
                >
                  <Laptop size={17} />
                  <span>Get Started on Web</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>

                {/* 2. Android APK CTA */}
                <button
                  type="button"
                  onClick={() => setApkOpen(true)}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#10b981] hover:shadow-md"
                >
                  <Smartphone size={17} className="text-[#10b981]" />
                  <span>Download Android App</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                    APK v1.0.0
                  </span>
                </button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-[#10b981]" /> Free account setup
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-[#2563eb]" /> Real-time cross-device sync
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-[#f59e0b]" /> Offline mobile revision
                </li>
              </ul>
            </Reveal>
          </div>

          {/* Right Column: 3D Scene + Floating Live Student Chips */}
          <div className="lg:col-span-6 relative">
            <Reveal delay={180} className="relative mx-auto h-[380px] w-full max-w-[540px] sm:h-[460px] lg:h-[500px]">
              {/* Subtle ambient backdrop */}
              <div className="absolute inset-4 rounded-3xl bg-gradient-to-tr from-blue-100/60 via-indigo-50/40 to-emerald-50/60 blur-xl -z-10" />

              {/* 3D Canvas */}
              <HeroScene3D />

              {/* Floating Live Badge 1: Streak */}
              <div className="ls-float pointer-events-none absolute left-0 top-6 flex items-center gap-2.5 rounded-2xl border border-white/90 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-blue-500/10 backdrop-blur sm:left-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-500 border border-amber-200/60">
                  <Flame size={18} />
                </span>
                <div className="leading-tight">
                  <b className="block text-[13px] font-[Manrope] text-slate-900">14-Day Streak</b>
                  <span className="text-[11px] font-mono text-slate-400">+2,450 XP earned</span>
                </div>
              </div>

              {/* Floating Live Badge 2: AI Summary */}
              <div className="ls-float-alt pointer-events-none absolute right-0 top-20 flex items-center gap-2.5 rounded-2xl border border-white/90 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-purple-500/10 backdrop-blur sm:right-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-[#2563eb] border border-blue-200/60">
                  <Sparkles size={18} />
                </span>
                <div className="leading-tight">
                  <b className="block text-[13px] font-[Manrope] text-slate-900">Summary Ready</b>
                  <span className="text-[11px] font-mono text-slate-400">BIO201 · 3 min read</span>
                </div>
              </div>

              {/* Floating Live Badge 3: Quiz Score */}
              <div className="ls-float-slow pointer-events-none absolute bottom-4 left-4 flex items-center gap-2.5 rounded-2xl border border-white/90 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-emerald-500/10 backdrop-blur sm:left-6">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-[#10b981] border border-emerald-200/60">
                  <Check size={18} />
                </span>
                <div className="leading-tight">
                  <b className="block text-[13px] font-[Manrope] text-slate-900">Quiz Score: 9/10</b>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold">+50 XP rewarded</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. INFINITE COURSE MATERIAL MARQUEE
          ========================================================================= */}
      <section aria-label="Supported Study Materials" className="border-y border-slate-200/80 bg-white py-4.5 overflow-hidden">
        <div className="ls-marquee-wrap relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="ls-marquee flex gap-3">
            {[...MATERIAL_TAGS, ...MATERIAL_TAGS, ...MATERIAL_TAGS].map((tag, idx) => (
              <span
                key={idx}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"
              >
                <FileText size={13} className="text-[#2563eb]" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. CORE PLATFORM FEATURE SHOWCASE ("THE SLOTSTUDY STRATA")
          ========================================================================= */}
      <section id="strata" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Interactive Study Environment"
            title={
              <>
                The SlotStudy <span className="text-[#2563eb]">Strata</span>
              </>
            }
            text="Explore the live simulations below to see how SlotStudy accelerates reading, comprehension, and exam preparation."
          />

          <Reveal>
            {/* Strata Tab Controller */}
            <div role="tablist" aria-label="Interactive features" className="mb-6 flex flex-wrap justify-center gap-2">
              {PREVIEW_TABS.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                    tab === item.id
                      ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/25 border border-blue-600'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-[#2563eb]'
                  }`}
                >
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Simulation Preview inside clean browser mockup */}
            <BrowserFrame url={active.url}>
              <div key={active.id} role="tabpanel" className="min-h-[350px]">
                <ActivePreview />
              </div>
            </BrowserFrame>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURES GRID ("EVERYTHING STUDENTS NEED")
          ========================================================================= */}
      <section id="features" className="scroll-mt-20 py-20 sm:py-28 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Purpose-Built Academic Tools"
            title={
              <>
                Engineered for How Students <span className="text-[#2563eb]">Actually Study</span>
              </>
            }
            text="No distractions, no overwhelming menus. Just the academic tools you need to stay on top of all your courses."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <Reveal key={feat.title} delay={(i % 3) * 90}>
                <article className="ls-card-hover h-full rounded-2xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between">
                  <div>
                    <span className={`ls-icon-wiggle mb-5 grid h-12 w-12 place-items-center rounded-xl ${feat.tone}`}>
                      <feat.icon size={22} />
                    </span>
                    <h3 className="font-[Manrope] text-lg font-extrabold text-slate-900">{feat.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{feat.text}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#2563eb]">
                    <span>Learn more</span>
                    <ArrowRight size={13} />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. HOW IT WORKS (3 SIMPLE STEPS)
          ========================================================================= */}
      <section id="how" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Simple 3-Step Workflow"
            title="From Messy Handouts to Exam-Ready Mastery"
          />

          <Reveal className="relative grid gap-8 md:grid-cols-3">
            <svg
              className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-3 w-[68%] md:block"
              viewBox="0 0 600 12"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="ls-step-line"
                d="M0 6 H600"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="2"
                strokeDasharray="6 8"
              />
            </svg>

            {STEPS.map((step) => (
              <div key={step.title} className="relative text-center">
                <div className="relative mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#10b981] text-white shadow-lg shadow-blue-500/25">
                  <step.icon size={26} />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-[10px] font-mono font-extrabold text-[#2563eb] shadow ring-1 ring-slate-200">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-[Manrope] text-lg font-extrabold text-slate-900">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">{step.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          7. CROSS-PLATFORM ECOSYSTEM: WEB + ANDROID
          ========================================================================= */}
      <section id="mobile" className="scroll-mt-20 overflow-hidden bg-gradient-to-b from-white to-blue-50/40 py-20 sm:py-28 border-t border-slate-200">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
              <Smartphone size={13} className="text-emerald-600" /> Web + Android Ecosystem
            </span>
            <h2 className="mt-4 font-[Manrope] text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Study at Your Desk or On the Go
            </h2>
            <p className="mt-3.5 max-w-lg text-base leading-relaxed text-slate-600">
              Upload dense lecture slides on your laptop at the library, then review flash summaries and practice quizzes on your phone while commuting. Your streak and progress stay synchronized with zero latency.
            </p>

            <ul className="mt-6 space-y-3 text-sm font-medium text-slate-700">
              {[
                'Single account synchronizes across all devices',
                '14-day streak, XP, and quiz scores never reset',
                'Direct Android APK download — no app store account needed',
                'Lightweight 28 MB package with instant offline access',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                    <Check size={14} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setApkOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Smartphone size={17} className="text-[#10b981]" />
                <span>Download Android APK</span>
              </button>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition-all hover:-translate-y-0.5 hover:border-[#2563eb]"
              >
                <span>Launch Web Workspace</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          {/* Dual Device Graphic Mockup */}
          <Reveal delay={150} className="relative mx-auto h-[420px] w-full max-w-md">
            {/* Desktop window card */}
            <div className="ls-float-slow absolute left-0 top-6 w-[82%] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-blue-500/10">
              <div className="flex items-center gap-1.5 border-b border-slate-150 bg-slate-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <img src="/images/slotstudy-icon.png" alt="" className="h-7 w-7" />
                  <b className="text-sm font-[Manrope]">Dashboard • BIO201</b>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['14', 'Streak'],
                    ['2,450', 'XP'],
                    ['Level 6', 'Rank'],
                  ].map(([num, lbl]) => (
                    <div key={lbl} className="rounded-lg bg-blue-50/60 p-2 text-center">
                      <b className="block font-[Manrope] text-base text-[#2563eb]">{num}</b>
                      <span className="text-[10px] font-mono text-slate-500">{lbl}</span>
                    </div>
                  ))}
                </div>
                <div className="ls-bar">
                  <span style={{ ['--w' as string]: '78%', background: 'linear-gradient(90deg,#2563eb,#10b981)' }} />
                </div>
              </div>
            </div>

            {/* Mobile Android frame mockup */}
            <div className="ls-float absolute bottom-0 right-0 w-[48%] rounded-[2rem] border-[6px] border-slate-900 bg-white p-2.5 shadow-2xl shadow-slate-900/30">
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-slate-300" />
              <div className="space-y-2.5 rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#2563eb]" />
                  <b className="text-[11px] font-[Manrope]">Today's Revision</b>
                </div>
                {['Read BIO201 brief', 'Practice Quiz', 'Ask Study Buddy'].map((task, i) => (
                  <div key={task} className="flex items-center gap-1.5 rounded-lg bg-white p-2 text-[10px] font-semibold text-slate-700 shadow-sm">
                    <span className={`grid h-4 w-4 place-items-center rounded-full ${i < 2 ? 'bg-[#10b981] text-white' : 'border border-slate-300'}`}>
                      {i < 2 && <Check size={9} />}
                    </span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Sync Badge */}
            <div className="absolute left-[16%] top-[50%] flex items-center gap-2 rounded-full border border-white bg-white px-3.5 py-1.5 text-[11px] font-bold text-[#10b981] shadow-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Cloud Sync • 0ms Latency</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          8. FAQ ACCORDION (SMOOTH ANIMATION & COLLAPSED BY DEFAULT)
          ========================================================================= */}
      <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Frequently Asked Questions"
            title="Questions Students Ask Us"
            text="Everything you need to know about getting started with SlotStudy on Web and Android."
          />

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Reveal key={faq.q} delay={idx * 40}>
                  <div
                    className={`rounded-2xl border bg-white transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'border-[#2563eb] shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20'
                        : 'border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left transition-colors"
                    >
                      <span className={`text-[15px] font-extrabold font-[Manrope] transition-colors ${isOpen ? 'text-[#2563eb]' : 'text-slate-900'}`}>
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-[#2563eb] transition-transform duration-300 ease-out ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Smooth Accordion Animation via CSS Grid */}
                    <div className={`ls-accordion-content ${isOpen ? 'is-open' : ''}`}>
                      <div className="ls-accordion-inner">
                        <p className="px-6 pb-5 pt-2 text-sm leading-relaxed text-slate-600 border-t border-slate-100/80">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FINAL CALL TO ACTION CARD (HIGH VISIBILITY & EXPLICIT STYLING)
          ========================================================================= */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] px-6 py-14 text-center text-white shadow-2xl shadow-blue-500/30 sm:px-12 sm:py-16">
            <div className="ls-orb absolute -left-10 -top-10 h-52 w-52 rounded-full bg-white/15 blur-2xl" />
            <div
              className="ls-orb absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-[#10b981]/25 blur-3xl"
              style={{ animationDelay: '-5s' }}
            />

            {/* Logo Icon */}
            <div className="relative mx-auto mb-5 h-16 w-16 rounded-2xl bg-white p-2.5 shadow-xl flex items-center justify-center">
              <img src="/images/slotstudy-icon.png" alt="SlotStudy" className="h-full w-full object-contain" />
            </div>

            <h2 className="relative font-[Manrope] text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Make Room for What Matters?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-base sm:text-lg text-blue-100 leading-relaxed">
              Join thousands of students turning messy course slides into top exam grades with SlotStudy on Web and Android.
            </p>

            {/* BUTTONS WITH EXPLICIT HIGH-CONTRAST COLORS */}
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              {/* Primary Register Button: Explicit White Background + Royal Blue Text */}
              <Link
                to="/register"
                style={{ color: '#2563eb', backgroundColor: '#ffffff' }}
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4 text-sm font-extrabold text-[#2563eb] shadow-2xl transition-all hover:scale-[1.03] hover:shadow-blue-900/40"
              >
                <span className="font-extrabold">Create Free Account</span>
                <ArrowRight size={16} className="text-[#2563eb] transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Secondary Android Button: Frosted Glass + Emerald Icon */}
              <button
                type="button"
                onClick={() => setApkOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/40 bg-white/15 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/25 hover:border-white"
              >
                <Smartphone size={17} className="text-[#10b981]" />
                <span>Get the Android App</span>
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =========================================================================
          10. FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="md:col-span-2 space-y-3">
            <SlotStudyBrandLogo size="md" />
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              Your personal AI-powered study space — structured summaries, practice quizzes, and an academic study buddy for every course.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-slate-600">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-[#2563eb] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Get Started
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold text-slate-600">
              <li>
                <Link to="/login" className="hover:text-[#2563eb] transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#2563eb] transition-colors">
                  Create free account
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setApkOpen(true)}
                  className="hover:text-[#10b981] transition-colors flex items-center gap-1.5"
                >
                  <Smartphone size={13} className="text-[#10b981]" />
                  <span>Download Android APK</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 py-6 text-center text-xs font-mono text-slate-400">
          © {new Date().getFullYear()} SlotStudy · Built with ❤️ for students worldwide
        </div>
      </footer>

      {/* =========================================================================
          11. ANDROID APK DOWNLOAD / QR MODAL
          ========================================================================= */}
      {apkOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="apk-title"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setApkOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <div className="ls-pop relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setApkOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img src="/images/slotstudy-icon.png" alt="SlotStudy" className="h-12 w-12 object-contain" />
              <div>
                <h3 id="apk-title" className="font-[Manrope] text-lg font-extrabold text-slate-900">
                  SlotStudy for Android
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Official APK Release • v1.0.0 (28 MB)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Install SlotStudy directly on your Android phone and sign in to access your course materials and practice quizzes anywhere.
            </p>

            {/* Direct Download Button */}
            <a
              href={APK_URL}
              download="SlotStudy.apk"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
            >
              <Download size={16} />
              <span>Download APK Directly</span>
            </a>

            {/* 3 Step Instructions */}
            <ol className="mt-5 space-y-2.5 rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-[12px] text-slate-600">
              {[
                'Tap Download APK above directly to your Android device.',
                'Open the downloaded file & allow installation ("Install unknown apps").',
                'Launch SlotStudy and sign in with your account to sync your courses.',
              ].map((step, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
