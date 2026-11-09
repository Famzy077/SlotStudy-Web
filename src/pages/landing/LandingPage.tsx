import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Flame,
  FolderKanban,
  GraduationCap,
  Laptop,
  Layers,
  Loader2,
  Menu,
  Moon,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Sun,
  Target,
  Trophy,
  Upload,
  X,
} from 'lucide-react';
import HeroScene3D from '../../components/landing/HeroScene3D';
import Reveal from '../../components/landing/Reveal';
import api, { getErrorMessage } from '../../lib/api';

/** Point this at your hosted APK (set `VITE_ANDROID_APK_URL` in Vercel) – falls back to /downloads/. */
const APK_URL: string = import.meta.env.VITE_ANDROID_APK_URL || '/downloads/SlotStudy.apk';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#strata', label: 'Study Tools' },
  { href: '#how', label: 'How It Works' },
  { href: '#mobile', label: 'Android APK' },
  { href: '#faq', label: 'FAQ' },
];

/* ------------------------------------------------------------------ */
/* Crisp Social Icons (SVG)                                            */
/* ------------------------------------------------------------------ */

function LinkedInIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function XTwitterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.25a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.35-6.34V8.46a8.28 8.28 0 0 0 4.9 1.57V6.69h-1z" />
    </svg>
  );
}

function TelegramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8-1.74 8.21c-.13.58-.47.72-.96.45l-2.65-1.95-1.28 1.23c-.14.14-.26.26-.54.26l.19-2.7 4.92-4.44c.21-.19-.05-.3-.32-.11L7.54 13.52 4.92 12.7c-.57-.18-.58-.57.12-.84l10.24-3.95c.47-.17.89.11.72.74z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { name: 'LinkedIn', icon: LinkedInIcon, href: 'https://linkedin.com/company/slotstudy', label: 'SlotStudy on LinkedIn' },
  { name: 'X', icon: XTwitterIcon, href: 'https://x.com/slotstudy_ng', label: 'SlotStudy on X (Twitter)' },
  { name: 'Instagram', icon: InstagramIcon, href: 'https://instagram.com/slot_study', label: 'SlotStudy on Instagram' },
  { name: 'TikTok', icon: TikTokIcon, href: 'https://tiktok.com/@slot.study', label: 'SlotStudy on TikTok' },
  { name: 'Telegram', icon: TelegramIcon, href: 'https://t.me/slotstudy', label: 'SlotStudy on Telegram' },
];

const FEATURES = [
  {
    icon: FileText,
    title: 'Structured Lecture Briefs',
    text: 'Condense 60-page slides and dense PDF handouts into executive study briefs, essential formulas, and core exam takeaways in seconds.',
    tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60',
  },
  {
    icon: GraduationCap,
    title: 'Grounded Study Buddy',
    text: 'Stuck on a tricky concept at 2 AM? Ask your senior coursemate tutor for intuitive breakdowns, everyday analogies, or Pidgin explanations—100% grounded in your notes.',
    tone: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60',
  },
  {
    icon: BookOpenCheck,
    title: 'Adaptive Practice Quizzes',
    text: 'Generate high-yield multiple-choice questions directly from your materials with immediate answer rationales and mistake breakdowns.',
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60',
  },
  {
    icon: FolderKanban,
    title: 'Organized Course Workspaces',
    text: 'Keep lecture handouts, study briefs, and quizzes neatly categorized by course code instead of buried across folders and group chats.',
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60',
  },
  {
    icon: Flame,
    title: 'Daily Streaks & XP Milestones',
    text: 'Build a consistent revision routine. Earn XP with every summary read and quiz completed to stay accountable through test week.',
    tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60',
  },
  {
    icon: Target,
    title: 'Exam Readiness Tracking',
    text: 'Monitor quiz accuracy and subject confidence scores so you know exactly which topics need your attention before walking into the exam hall.',
    tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/60',
  },
];

const STEPS = [
  {
    icon: Upload,
    num: '01',
    title: 'Upload Course Materials',
    text: 'Drop lecture slides, PDF handouts, or syllabus notes directly into your course workspace.',
  },
  {
    icon: Layers,
    num: '02',
    title: 'Structured Concept Breakdown',
    text: 'SlotStudy parses your document to isolate core definitions, key formulas, and high-yield flashpoints—citing exact source pages.',
  },
  {
    icon: Trophy,
    num: '03',
    title: 'Practice & Master',
    text: 'Test yourself with adaptive quizzes, resolve doubts with your grounded study buddy, and maintain your streak across devices.',
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
    q: 'How accurate are the study briefs for exam revision?',
    a: 'SlotStudy is strictly grounded in the materials you upload. Rather than pulling generic information from the open web that might contradict your lecturer, it extracts and cites formulas, definitions, and concepts directly from your lecture slides and handouts.',
  },
  {
    q: 'Can the Study Buddy explain concepts in Nigerian Pidgin or everyday analogies?',
    a: 'Yes! SlotStudy can seamlessly switch between articulate academic English and relatable Nigerian Pidgin with everyday analogies, making tough university concepts click without losing academic rigor.',
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
  const iconSizes = {
    sm: 'h-7 w-7 sm:h-8 sm:w-8',
    md: 'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10',
    lg: 'h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12',
  };
  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  };

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 select-none">
      <img
        src="/images/slotstudy-icon.png"
        alt="SlotStudy"
        className={`${iconSizes[size]} object-contain drop-shadow-sm transition-transform group-hover:scale-105`}
      />
      <div className="flex flex-col">
        <div className={`flex items-baseline font-[Manrope] ${textSizes[size]} font-extrabold tracking-tight leading-none`}>
          <span className="text-[#2563eb] dark:text-[#3b82f6]">Slot</span>
          <span className="text-[#10b981] dark:text-[#10b981]">Study</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b] ml-0.5 inline-block" />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text?: string }) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563eb] dark:text-blue-400">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] dark:bg-blue-400" />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-[Manrope] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>}
    </Reveal>
  );
}

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_25px_50px_-20px_rgb(37_99_235/15%)]">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
        </div>
        <div className="mx-auto flex max-w-sm flex-1 items-center justify-center gap-1.5 rounded-md bg-white dark:bg-slate-900 px-3 py-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800">
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
    <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600">
              <FileText size={15} />
            </span>
            <span className="font-mono text-[11px]">BIO201_Cell_Respiration.pdf</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">24 pages</span>
        </div>
        <div className="space-y-3">
          {[92, 100, 78, 96, 64, 88, 100, 70].map((w, i) => (
            <div
              key={i}
              className={`relative h-2.5 overflow-hidden rounded-full ${i === 2 || i === 5 ? 'bg-blue-200 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-800'}`}
              style={{ width: `${w}%` }}
            >
              {(i === 2 || i === 5) && <span className="ls-shimmer absolute inset-0" />}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
          <span>Parsing formulas &amp; diagrams…</span>
          <span className="text-[#10b981] font-bold">100% processed</span>
        </div>
      </div>

      <div className="ls-panel rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#2563eb] dark:text-blue-400 font-mono">
            <BookOpenCheck size={12} /> STRUCTURED STUDY BRIEF
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/60">
              Intermediate
            </span>
            <span className="text-[11px] font-mono text-slate-400">3 min read</span>
          </div>
        </div>
        <h4 className="font-[Manrope] text-base font-extrabold text-slate-900 dark:text-white">
          Cellular Respiration: High-Yield Breakdown
        </h4>
        <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
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
        <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 px-3.5 py-2.5 text-[12px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
          <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">⚡ Exam Flashpoint:</span>
          <span>Know the exact ATP yield difference between aerobic vs anaerobic respiration.</span>
        </div>
      </div>
    </div>
  );
}

function BuddyPreview() {
  return (
    <div className="space-y-4 bg-slate-50/70 dark:bg-slate-950 p-6 sm:p-8">
      <div className="ls-panel flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#2563eb] px-4 py-3 text-[13px] text-white shadow-md shadow-blue-500/20 font-medium">
          I don't understand why the Krebs cycle matters if it only makes 2 ATP directly?
        </div>
      </div>
      <div className="ls-panel flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] text-white shadow-md">
          <GraduationCap size={16} />
        </span>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 px-2 py-0.5 text-[10px] font-mono font-bold text-[#2563eb] dark:text-blue-400">
              <BookOpenCheck size={11} /> Handout 3 · Page 14
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={11} /> 100% Grounded
            </span>
          </div>
          Great question! Think of the Krebs cycle as an <b>energy extraction refinery</b> rather than the main power generator 💡
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-slate-600 dark:text-slate-400">
            <li>Its real job isn't making ATP directly — it strips high-energy electrons from fuel molecules.</li>
            <li>It packs those electrons into carriers called <b>NADH</b> and <b>FADH2</b>.</li>
            <li>Those carriers feed the Electron Transport Chain, where <b>over 90% of your total ATP</b> is synthesized!</li>
          </ol>
          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              🇳🇬 Explain in Pidgin
            </span>
            <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              💡 Everyday Analogy
            </span>
            <span className="inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563eb] dark:text-blue-400 px-2.5 py-1 text-[11px] font-bold">
              🎯 Quiz Me on This
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-[13px] text-slate-400 shadow-sm">
        <span>Ask your study buddy anything from this handout…</span>
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
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Practice Question 3 of 10 · BIO201
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 font-mono font-bold text-amber-700 dark:text-amber-400">
          <Flame size={13} className="text-amber-500" /> 3 in a row
        </span>
      </div>
      <div className="ls-bar mb-6">
        <span style={{ ['--w' as string]: '35%', background: 'linear-gradient(90deg,#2563eb,#10b981)' }} />
      </div>
      <h4 className="font-[Manrope] text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
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
                  ? 'border-[#10b981] bg-emerald-50 dark:bg-emerald-950/50 text-[#047857] dark:text-emerald-300 shadow-sm'
                  : isWrong
                    ? 'border-red-400 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5 hover:border-[#2563eb] hover:bg-blue-50/50 dark:hover:bg-slate-800 disabled:hover:translate-y-0'
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
        <div className="ls-panel mt-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
          <b className={picked === correct ? 'text-[#10b981]' : 'text-red-600'}>
            {picked === correct ? '✓ Correct! +50 XP added' : '✗ Incorrect.'}
          </b>{' '}
          The <b>mitochondria</b> host both the citric acid (Krebs) cycle within the matrix and the electron transport chain along the inner cristae membrane.
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] dark:text-blue-400 hover:underline"
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
    <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-5 bg-white dark:bg-slate-900">
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

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-950">
          <div className="mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono uppercase">Activity This Week</div>
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

      <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 p-5 md:col-span-3 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-sm font-extrabold text-slate-900 dark:text-white font-[Manrope]">Subject Mastery & Revision Progress</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            <Target size={12} /> Midterm in 12 days
          </span>
        </div>
        {courses.map((c) => (
          <div key={c.name} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>{c.name}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{c.pct}%</span>
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
  { id: 'summary', label: 'Study Briefs', icon: FileText, url: 'slotstudyonline.com/summaries', Comp: SummaryPreview },
  { id: 'buddy', label: 'Study Buddy', icon: GraduationCap, url: 'slotstudyonline.com/study-room', Comp: BuddyPreview },
  { id: 'quiz', label: 'Practice Quiz', icon: BookOpenCheck, url: 'slotstudyonline.com/quizzes', Comp: QuizPreview },
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

  // Theme State (Dark / Light Screen Switcher)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('slotstudy-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Footer Waitlist State
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  // Theme Switcher Handler
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('slotstudy-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#070a13' : '#f8faff');
    window.dispatchEvent(new CustomEvent('slotstudy-theme-change', { detail: nextTheme }));
  };

  // Sync with system or storage theme changes
  useEffect(() => {
    const handleThemeEvent = (e: Event) => {
      const newTheme = (e as CustomEvent<string>).detail;
      if (newTheme === 'dark' || newTheme === 'light') {
        setTheme(newTheme);
      }
    };
    window.addEventListener('slotstudy-theme-change', handleThemeEvent);
    return () => window.removeEventListener('slotstudy-theme-change', handleThemeEvent);
  }, []);

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

  // Handle Waitlist Form Submission
  const handleWaitlistSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim() || waitlistLoading) return;

    try {
      setWaitlistLoading(true);
      setWaitlistError(null);
      setWaitlistSuccess(null);

      const res = await api.post('/waitlist', {
        email: waitlistEmail.trim(),
        source: 'landing_footer',
      });

      const data = res.data;
      const message = data?.message || "You're successfully on the waitlist!";
      const pos = data?.position ? ` (Position #${data.position})` : '';
      setWaitlistSuccess(`${message}${pos}`);
      setWaitlistEmail('');
    } catch (err) {
      setWaitlistError(getErrorMessage(err));
    } finally {
      setWaitlistLoading(false);
    }
  };

  const active = PREVIEW_TABS.find((t) => t.id === tab) ?? PREVIEW_TABS[0];
  const ActivePreview = active.Comp;

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f8faff] dark:bg-[#070a13] font-[DM_Sans] text-slate-800 dark:text-slate-100 selection:bg-[#2563eb] selection:text-white transition-colors duration-300">
      {/* Background Architectural Grid & Subtle Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ls-grid-bg absolute inset-0 opacity-70 dark:opacity-40" />
        <div className="ls-orb absolute -left-20 top-20 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[130px]" />
        <div
          className="ls-orb absolute -right-20 top-40 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-[130px]"
          style={{ animationDelay: '-6s' }}
        />
      </div>

      {/* =========================================================================
          1. NAVBAR (FIXED STICKY ON SCROLL)
          ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#070a13]/90 shadow-[0_4px_20px_-10px_rgb(37_99_235/15%)] backdrop-blur-xl'
            : 'border-b border-transparent bg-[#f8faff] dark:bg-[#070a13]'
        }`}
      >
        <div className="mx-auto flex h-[64px] sm:h-[72px] max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
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
                className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-blue-50 dark:hover:bg-slate-800/80 hover:text-[#2563eb] dark:hover:text-blue-400"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Dark / Light Screen Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm transition-all hover:scale-105"
            >
              {theme === 'dark' ? (
                <Sun size={17} className="text-amber-400 animate-spin-slow" />
              ) : (
                <Moon size={17} className="text-slate-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setApkOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              <Smartphone size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Android APK v1.0.0</span>
            </button>

            <Link
              to="/login"
              className="hidden sm:inline-flex rounded-lg px-3.5 py-2 text-[13px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[13px] font-extrabold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/35"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="rounded-xl p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 md:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown backdrop & drawer */}
        {menuOpen && (
          <>
            <div
              className="ls-mobile-menu-backdrop fixed inset-0 top-[64px] z-40 bg-black/40 backdrop-blur-xs md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="ls-mobile-menu relative z-50 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl px-4 pb-6 pt-3 md:hidden shadow-2xl">
              {NAV_LINKS.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className="ls-mobile-menu-item block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#2563eb] dark:hover:text-blue-400"
                >
                  {link.label}
                </a>
              ))}
              <div className="ls-mobile-menu-actions mt-4 grid gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setApkOpen(true);
                  }}
                  className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 py-2.5 text-center text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2"
                >
                  <Smartphone size={15} /> Download Android APK (v1.0.0)
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-center text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl bg-[#2563eb] py-2.5 text-center text-sm font-bold text-white shadow-md shadow-blue-500/25"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION & 3D INTERACTIVE EXPERIENCE
          ========================================================================= */}
      <section className="relative isolate overflow-hidden pt-[134px] sm:pt-[128px] lg:pt-[144px] pb-12 sm:pb-24">
        <div className="mx-auto grid max-w-7xl min-w-0 items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          {/* Left Column: Headlines & Dual CTAs */}
          <div className="min-w-0 lg:col-span-6 text-left">
            {/* <Reveal>
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-mono font-bold text-[#2563eb] dark:text-blue-400 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="min-w-0 whitespace-normal leading-tight">SYLLABUS-ALIGNED ACADEMIC WORKSPACE</span>
              </div>
            </Reveal> */}

            <Reveal delay={80}>
              <h1 className="mt-4 sm:mt-5 font-[Manrope] text-[30px] sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] sm:leading-[1.08]">
                Master Every Course.
                <span className="block mt-1 bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#10b981] bg-clip-text text-transparent">
                  Grounded in Your Syllabus.
                </span>
                <span className="block mt-1 text-slate-700 dark:text-slate-300 text-xl sm:text-4xl font-bold">
                  Engineered for Exam Confidence.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-3.5 sm:mt-5 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                Turn dense lecture slides, messy PDF handouts, and past questions into structured study summaries, practice quiz arenas, and an adaptive study buddy. Strictly grounded in your course materials, across Web and Android.
              </p>
            </Reveal>

            <Reveal delay={240}>
              {/* Dual Primary Conversion Buttons */}
              <div className="mt-6 sm:mt-8 flex min-w-0 flex-col gap-3 sm:flex-row items-stretch sm:items-center">
                {/* 1. Web CTA */}
                <Link
                  to="/register"
                  className="group inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#2563eb] px-3.5 py-3.5 text-[13px] font-extrabold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/40 sm:w-auto sm:gap-2.5 sm:px-7 sm:text-sm"
                >
                  <Laptop size={17} className="shrink-0" />
                  <span className="min-w-0">Get Started on Web</span>
                  <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* 2. Android APK CTA */}
                <button
                  type="button"
                  onClick={() => setApkOpen(true)}
                  className="group inline-flex w-full min-w-0 flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-3.5 text-[13px] font-bold text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#10b981] hover:shadow-md sm:w-auto sm:flex-nowrap sm:gap-2.5 sm:px-5 sm:text-sm"
                >
                  <Smartphone size={17} className="shrink-0 text-[#10b981]" />
                  <span className="min-w-0">Download Android App</span>
                  <span className="whitespace-nowrap rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                    APK v1.0.0
                  </span>
                </button>
              </div>
            </Reveal>
            
          </div>

          {/* Right Column: 3D Scene + Floating Live Student Chips inside Frame */}
          <div className="min-w-0 lg:col-span-6 relative mt-4 lg:mt-0">
            <Reveal delay={180}>
              <div className="relative mx-auto max-w-[540px] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white/90 via-slate-50/50 to-white/90 dark:from-slate-900/90 dark:via-slate-900/40 dark:to-slate-900/90 p-3 sm:p-5 shadow-xl shadow-blue-500/5 backdrop-blur-sm">
                {/* 3D Canvas Container */}
                <div className="relative h-[250px] sm:h-[380px] lg:h-[440px] w-full">
                  {/* Subtle ambient backdrop */}
                  <div className="absolute inset-4 rounded-3xl bg-gradient-to-tr from-blue-100/60 via-indigo-50/40 to-emerald-50/60 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-emerald-900/20 blur-xl -z-10" />

                  {/* 3D Canvas */}
                  <HeroScene3D />

                  {/* Floating Live Badge 1: Streak (Desktop only) */}
                  <div className="hidden sm:flex ls-float pointer-events-none absolute left-0 top-6 items-center gap-2.5 rounded-2xl border border-white/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-3.5 py-2.5 shadow-xl shadow-blue-500/10 backdrop-blur sm:left-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 border border-amber-200/60 dark:border-amber-800/60">
                      <Flame size={18} />
                    </span>
                    <div className="leading-tight">
                      <b className="block text-[13px] font-[Manrope] text-slate-900 dark:text-white">14-Day Streak</b>
                      <span className="text-[11px] font-mono text-slate-400">+2,450 XP earned</span>
                    </div>
                  </div>

                  {/* Floating Live Badge 2: Study Brief (Desktop only) */}
                  <div className="hidden sm:flex ls-float-alt pointer-events-none absolute right-0 top-16 items-center gap-2.5 rounded-2xl border border-white/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-3.5 py-2.5 shadow-xl shadow-blue-500/10 backdrop-blur sm:right-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563eb] dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                      <BookOpen size={18} />
                    </span>
                    <div className="leading-tight">
                      <b className="block text-[13px] font-[Manrope] text-slate-900 dark:text-white">Study Brief Ready</b>
                      <span className="text-[11px] font-mono text-slate-400">BIO201 · 3 min read</span>
                    </div>
                  </div>

                  {/* Floating Live Badge 3: Quiz Score (Desktop only) */}
                  <div className="hidden sm:flex ls-float-slow pointer-events-none absolute bottom-4 left-4 items-center gap-2.5 rounded-2xl border border-white/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-3.5 py-2.5 shadow-xl shadow-emerald-500/10 backdrop-blur sm:left-6">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#10b981] border border-emerald-200/60 dark:border-emerald-800/60">
                      <Check size={18} />
                    </span>
                    <div className="leading-tight">
                      <b className="block text-[13px] font-[Manrope] text-slate-900 dark:text-white">Quiz Score: 9/10</b>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">+50 XP rewarded</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Feature Chips (Clean 3-pill deck docked inside card, 0 horizontal overflow) */}
                <div className="sm:hidden mt-2 grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-150 dark:border-slate-800">
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 text-center">
                    <span className="text-amber-500 mb-0.5"><Flame size={15} /></span>
                    <b className="text-[11px] font-[Manrope] text-slate-900 dark:text-white leading-tight">Streak</b>
                    <span className="text-[9px] font-mono text-slate-400">14 Days</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 text-center">
                    <span className="text-[#2563eb] dark:text-blue-400 mb-0.5"><FileText size={15} /></span>
                    <b className="text-[11px] font-[Manrope] text-slate-900 dark:text-white leading-tight">Summaries</b>
                    <span className="text-[9px] font-mono text-slate-400">Study Brief</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 text-center">
                    <span className="text-[#10b981] mb-0.5"><CheckCircle2 size={15} /></span>
                    <b className="text-[11px] font-[Manrope] text-slate-900 dark:text-white leading-tight">Quizzes</b>
                    <span className="text-[9px] font-mono text-slate-400">95% Score</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. INFINITE COURSE MATERIAL MARQUEE
          ========================================================================= */}
      <section aria-label="Supported Study Materials" className="border-y border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b0f19] py-4.5 overflow-hidden">
        <div className="ls-marquee-wrap relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="ls-marquee flex gap-3">
            {[...MATERIAL_TAGS, ...MATERIAL_TAGS, ...MATERIAL_TAGS].map((tag, idx) => (
              <span
                key={idx}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm"
              >
                <FileText size={13} className="text-[#2563eb] dark:text-blue-400" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. CORE PLATFORM FEATURE SHOWCASE ("THE SLOTSTUDY WORKSPACE")
          ========================================================================= */}
      <section id="strata" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Interactive Study Environment"
            title={
              <>
                The SlotStudy <span className="text-[#2563eb] dark:text-blue-400">Workspace</span>
              </>
            }
            text="Explore the live simulations below to see how SlotStudy accelerates reading, comprehension, and verified exam revision."
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
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500 hover:text-[#2563eb]'
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
      <section id="features" className="scroll-mt-20 py-20 sm:py-28 bg-white dark:bg-[#0b0f19] border-y border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Purpose-Built Academic Tools"
            title={
              <>
                Built for How University Students <span className="text-[#2563eb] dark:text-blue-400">Actually Study</span>
              </>
            }
            text="No distractions, no hallucinated internet trivia. Just the structured study tools you need to stay on top of your semester."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <Reveal key={feat.title} delay={(i % 3) * 90}>
                <article className="ls-card-hover h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-6 flex flex-col justify-between">
                  <div>
                    <span className={`ls-icon-wiggle mb-5 grid h-12 w-12 place-items-center rounded-xl ${feat.tone}`}>
                      <feat.icon size={22} />
                    </span>
                    <h3 className="font-[Manrope] text-lg font-extrabold text-slate-900 dark:text-white">{feat.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feat.text}</p>
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
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white dark:bg-slate-900 text-[10px] font-mono font-extrabold text-[#2563eb] dark:text-blue-400 shadow ring-1 ring-slate-200 dark:ring-slate-700">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-[Manrope] text-lg font-extrabold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          7. CROSS-PLATFORM ECOSYSTEM: WEB + ANDROID
          ========================================================================= */}
      <section id="mobile" className="scroll-mt-20 overflow-hidden bg-gradient-to-b from-white to-blue-50/40 dark:from-[#070a13] dark:to-slate-950 py-20 sm:py-28 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Smartphone size={13} className="text-emerald-600 dark:text-emerald-400" /> Web + Android Ecosystem
            </span>
            <h2 className="mt-4 font-[Manrope] text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Study at Your Desk or On the Go
            </h2>
            <p className="mt-3.5 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-300">
              Upload dense lecture slides on your laptop at the library, then review flash summaries and practice quizzes on your phone while commuting. Your streak and progress stay synchronized with zero latency.
            </p>

            <ul className="mt-6 space-y-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              {[
                'Single account synchronizes across all devices',
                '14-day streak, XP, and quiz scores never reset',
                'Direct Android APK download — no app store account needed',
                'Lightweight 28 MB package with instant offline access',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
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
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/20 dark:shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:bg-slate-800 dark:hover:bg-blue-500"
              >
                <Smartphone size={17} className="text-[#10b981] dark:text-white" />
                <span>Download Android APK</span>
              </button>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 transition-all hover:-translate-y-0.5 hover:border-[#2563eb]"
              >
                <span>Launch Web Workspace</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          {/* Dual Device Graphic Mockup */}
          <Reveal delay={150} className="relative mx-auto h-[420px] w-full max-w-md">
            {/* Desktop window card */}
            <div className="ls-float-slow absolute left-0 top-6 w-[82%] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-blue-500/10">
              <div className="flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <img src="/images/slotstudy-icon.png" alt="" className="h-7 w-7" />
                  <b className="text-sm font-[Manrope] text-slate-900 dark:text-white">Dashboard • BIO201</b>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['14', 'Streak'],
                    ['2,450', 'XP'],
                    ['Level 6', 'Rank'],
                  ].map(([num, lbl]) => (
                    <div key={lbl} className="rounded-lg bg-blue-50/60 dark:bg-slate-800 p-2 text-center">
                      <b className="block font-[Manrope] text-base text-[#2563eb] dark:text-blue-400">{num}</b>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{lbl}</span>
                    </div>
                  ))}
                </div>
                <div className="ls-bar">
                  <span style={{ ['--w' as string]: '78%', background: 'linear-gradient(90deg,#2563eb,#10b981)' }} />
                </div>
              </div>
            </div>

            {/* Mobile Android frame mockup */}
            <div className="ls-float absolute bottom-0 right-0 w-[48%] rounded-[2rem] border-[6px] border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xl shadow-slate-900/30">
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="space-y-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 p-3">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={12} className="text-[#2563eb]" />
                  <b className="text-[11px] font-[Manrope] text-slate-900 dark:text-white">Today's Study Plan</b>
                </div>
                {['Read BIO201 brief', 'Practice Quiz', 'Ask Study Buddy'].map((task, i) => (
                  <div key={task} className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-900 p-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                    <span className={`grid h-4 w-4 place-items-center rounded-full ${i < 2 ? 'bg-[#10b981] text-white' : 'border border-slate-300 dark:border-slate-700'}`}>
                      {i < 2 && <Check size={9} />}
                    </span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Sync Badge */}
            <div className="absolute left-[16%] top-[50%] flex items-center gap-2 rounded-full border border-white dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-[11px] font-bold text-[#10b981] shadow-xl">
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
                    className={`rounded-2xl border bg-white dark:bg-slate-900 transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'border-[#2563eb] shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left transition-colors"
                    >
                      <span className={`text-[15px] font-extrabold font-[Manrope] transition-colors ${isOpen ? 'text-[#2563eb] dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-[#2563eb] dark:text-blue-400 transition-transform duration-300 ease-out ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Smooth Accordion Animation via CSS Grid */}
                    <div className={`ls-accordion-content ${isOpen ? 'is-open' : ''}`}>
                      <div className="ls-accordion-inner">
                        <p className="px-6 pb-5 pt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-100/80 dark:border-slate-800">
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
      <section className="px-4 pb-12 sm:px-6 lg:px-8">
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
              Ready to Master Your Courses with Confidence?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-base sm:text-lg text-blue-100 leading-relaxed">
              Join university students turning messy lecture slides into structured study briefs and top exam grades with SlotStudy on Web and Android.
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
          10. FOOTER WITH WAITLIST & SOCIAL ICONS
          ========================================================================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070a13] transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-12">
          {/* Top Row: Waitlist Card connected to the DB */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-6 sm:p-10 shadow-sm">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#2563eb] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-3 py-1 rounded-full">
                  Early Access Updates
                </span>
                <h3 className="font-[Manrope] text-2xl font-extrabold text-slate-900 dark:text-white">
                  Join the SlotStudy Student Community
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                  Be first to receive new interactive study tools, subject exam readiness diagnostics, and upcoming Android APK releases.
                </p>
              </div>

              {/* Waitlist Form */}
              <div className="lg:col-span-6">
                <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="email"
                      required
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="Enter your student email (e.g. alex@university.edu)"
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    />
                    <button
                      type="submit"
                      disabled={waitlistLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#10b981] px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-60"
                    >
                      {waitlistLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Joining…</span>
                        </>
                      ) : (
                        <>
                          <span>Join Waitlist</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>

                  {waitlistSuccess && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#10b981] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-lg">
                      <CheckCircle2 size={15} className="shrink-0" />
                      <span>{waitlistSuccess}</span>
                    </div>
                  )}

                  {waitlistError && (
                    <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 p-2.5 rounded-lg">
                      {waitlistError}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Middle Row: Links & Social Icons */}
          <div className="grid max-w-7xl gap-10 md:grid-cols-4">
            <div className="md:col-span-2 space-y-4">
              <SlotStudyBrandLogo size="md" />
              <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Your personal academic workspace — structured lecture briefs, adaptive practice quizzes, and a grounded study buddy for every university course.
              </p>

              {/* Social Media Icons (LinkedIn, X, Instagram, TikTok, Telegram) */}
              <div className="pt-2">
                <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Connect With Us
                </span>
                <div className="flex items-center gap-2.5">
                  {SOCIAL_LINKS.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="group grid h-9 w-9 place-items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#2563eb] dark:hover:border-blue-500 hover:text-[#2563eb] dark:hover:text-blue-400 hover:shadow-md"
                    >
                      <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Get Started
              </h4>
              <ul className="space-y-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <li>
                  <Link to="/login" className="hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors">
                    Create free account
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors">
                    Terms and Conditions
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

          {/* Bottom Bar: Copyright & Screen Theme Indicator */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400 dark:text-slate-500">
            <div>© {new Date().getFullYear()} SlotStudy for students</div>
            <div className="flex items-center gap-3">
              <p className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 dark:text-slate-400">
                All rights reserved
              </p>
            </div>
          </div>
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
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <div className="ls-pop relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setApkOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img src="/images/slotstudy-icon.png" alt="SlotStudy" className="h-12 w-12 object-contain" />
              <div>
                <h3 id="apk-title" className="font-[Manrope] text-lg font-extrabold text-slate-900 dark:text-white">
                  SlotStudy for Android
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  Official APK Release • v1.0.0 (28 MB)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
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
            <ol className="mt-5 space-y-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 text-[12px] text-slate-600 dark:text-slate-400">
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
