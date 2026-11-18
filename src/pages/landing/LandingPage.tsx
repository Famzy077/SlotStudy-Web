import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Flame,
  FolderKanban,
  Gift,
  GraduationCap,
  Headphones,
  Laptop,
  Layers,
  Loader2,
  Menu,
  MessageSquare,
  Mic,
  Moon,
  RefreshCw,
  School,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Upload,
  UserCheck,
  UserPlus,
  Users,
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

interface CapabilityCard {
  icon: typeof FileText;
  eyebrow: string;
  title: string;
  text: string;
  tone: string;
  accentGradient: string;
  chips: string[];
  metaLabel: string;
  metaValue: string;
}

const CAPABILITY_CARDS: CapabilityCard[] = [
  {
    icon: FileText,
    eyebrow: 'Study Briefs',
    title: 'Handouts to Structured Briefs',
    text: 'Upload PDFs, lecture slides, or clear PNG/JPG handout photos up to 50 MB. Get structured executive summaries with difficulty levels, reading time estimates, core formulas, and a "Keep These in Mind" checklist.',
    tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-800/70',
    accentGradient: 'from-blue-500/15 via-indigo-500/5 to-transparent',
    chips: ['PDF · PNG · JPG ≤ 50 MB', '3 min read · Intermediate'],
    metaLabel: 'One-click next step',
    metaValue: 'Quiz · Study Room · Copy Notes',
  },
  {
    icon: BookOpenCheck,
    eyebrow: 'Practice & Test Modes',
    title: 'Dual-Mode Exam Quizzes',
    text: 'Generate 5, 10, or 15 exam-style questions directly from any Study Brief. Train stress-free in untimed Practice Mode for instant rationales, or switch to Timed Test Mode with a live countdown clock.',
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70',
    accentGradient: 'from-emerald-500/15 via-teal-500/5 to-transparent',
    chips: ['Practice Mode', 'Timed Test Mode'],
    metaLabel: 'Question deck sizes',
    metaValue: '5 · 10 · 15 MCQs',
  },
  {
    icon: Target,
    eyebrow: 'Result Diagnostics',
    title: 'Mistakes-Only Review & Score Gauge',
    text: 'Every quiz ends with a percentage grade gauge, time taken, and XP earned. Toggle the Mistakes-Only filter to isolate every missed question alongside your pick, the right answer, and its explanation.',
    tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/70 dark:border-cyan-800/70',
    accentGradient: 'from-cyan-500/15 via-sky-500/5 to-transparent',
    chips: ['Grade A–C Gauge', 'Mistakes-Only Filter'],
    metaLabel: 'Review breakdown',
    metaValue: 'Your pick vs. Correct answer',
  },
  {
    icon: FolderKanban,
    eyebrow: 'Course & Uni Setup',
    title: 'Institution-Aware Course Spaces',
    text: 'Configure your university, degree programme, and year of study (Year 1 to Year 6+) during setup. Every handout, study brief, and quiz stays neatly filed under its exact course code.',
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/70',
    accentGradient: 'from-amber-500/15 via-orange-500/5 to-transparent',
    chips: ['University + Programme', 'Year 1 – 6+'],
    metaLabel: 'Per-course tabs',
    metaValue: 'Materials · Summaries · Quizzes',
  },
  {
    icon: Flame,
    eyebrow: 'Streaks & Analytics',
    title: 'Study Hours, XP & Subject Mastery',
    text: 'Stay consistent through TMA and exam weeks with daily streak tracking, 7-day study-hour bar charts, XP level milestones, and per-subject accuracy percentages showing which courses need focus.',
    tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/70 dark:border-orange-800/70',
    accentGradient: 'from-orange-500/15 via-amber-500/5 to-transparent',
    chips: ['7-Day Hours Chart', 'Subject Mastery %'],
    metaLabel: 'Consistency engine',
    metaValue: 'Daily Streak + XP Levels',
  },
  {
    icon: Bell,
    eyebrow: 'Live Presence & Sync',
    title: 'Real-Time Alerts & Referral Invites',
    text: 'Get instant alerts for incoming Study Buddy friend requests, unread coursemate messages, and study milestones. Share your personal referral code to bring classmates from your department directly into your network.',
    tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200/70 dark:border-violet-800/70',
    accentGradient: 'from-violet-500/15 via-indigo-500/5 to-transparent',
    chips: ['Socket Live Presence', 'Referral Link'],
    metaLabel: 'Cross-device sync',
    metaValue: 'Web Workspace ↔ Android APK',
  },
];

const STEPS = [
  {
    icon: Upload,
    num: '01',
    title: 'Set Your Course & Upload Notes',
    text: 'Pick your university, programme, and year of study, then drop PDF handouts, lecture slides, or clear photos (up to 50 MB) into your course workspace.',
  },
  {
    icon: Layers,
    num: '02',
    title: 'Read Briefs & Enter the Study Room',
    text: 'Turn dense handouts into structured Study Briefs, then attach up to 10 notes in your Study Room to ask your Tutor questions with page citations, Pidgin mode, or Read Aloud.',
  },
  {
    icon: Trophy,
    num: '03',
    title: 'Quiz Yourself & Link With Coursemates',
    text: 'Drill timed or untimed MCQs with Mistakes-Only review, track your XP and study hours, and connect with Open University peers via Study Buddy.',
  },
];

const FAQS = [
  {
    q: 'What is the difference between Study Buddy and Study Room?',
    a: 'Study Buddy is our peer-to-peer student network built to help you discover, add, and chat 1-on-1 in real time with actual students across Open & Distance Learning universities (such as NOUN, Miva Open University, UNILAG DLI, UI DLC, and UNN CDeL). Study Room is your dedicated AI Tutor workspace where you attach up to 10 course PDFs and ask questions strictly grounded in your uploaded handouts.',
  },
  {
    q: 'What types of study materials can I upload?',
    a: 'You can upload PDF lecture slides, handouts, textbook chapters, past questions, or clear PNG and JPG photos of printed notes up to 50 MB. SlotStudy extracts key concepts, difficulty level, estimated reading time, and "Keep These in Mind" exam takeaways.',
  },
  {
    q: 'How does the Study Room Tutor use my course materials?',
    a: 'When you start a Study Room session, you pick up to 10 materials from your courses. Your Senior Coursemate Tutor answers solely from those notes—showing clickable source citations with file names and page numbers, plus Quick Module Jump Links (MOD 1–4) inside the workspace drawer.',
  },
  {
    q: 'Can the Study Room Tutor speak, listen, or explain in Nigerian Pidgin?',
    a: 'Yes! Inside the Study Room, you can click prompt chips for Nigerian Pidgin explanations or everyday Naija analogies, dictate questions hands-free with Nigerian English (en-NG) voice input, or click Read Aloud to listen to any explanation.',
  },
  {
    q: 'How do Practice Mode, Test Mode, and Mistakes-Only Review work?',
    a: 'From any Study Brief, generate 5, 10, or 15 multiple-choice questions. Choose Practice Mode to see answer rationales immediately as you go, or Timed Test Mode for an exam-style countdown. Afterward, toggle "Mistakes to review only" on your results page to study only what you missed.',
  },
  {
    q: 'Which universities are supported in Academic Setup & Study Buddy?',
    a: 'SlotStudy supports Nigerian Open & Distance Learning and conventional universities including National Open University of Nigeria (NOUN), Miva Open University, University of Lagos (UNILAG DLI), University of Ibadan (UI DLC), University of Nigeria Nsukka (UNN CDeL), and Ahmadu Bello University (ABU), letting you filter peers by institution and shared courses.',
  },
  {
    q: 'How does the Android APK sync with the web version?',
    a: 'Everything syncs in real time to your SlotStudy account. Materials uploaded on your laptop, Study Room threads, Study Buddy chats, quizzes, XP, and daily streaks stay updated on your Android phone.',
  },
  {
    q: 'Is SlotStudy free for students to get started?',
    a: 'Yes, creating an account takes under 30 seconds and gives you free access to course setup, Study Briefs, Study Room sessions, Study Buddy networking, practice quizzes, and the Android mobile app.',
  },
];

const MATERIAL_TAGS = [
  'Lecture Slides (PDF)',
  'Handout Photos (PNG / JPG ≤ 50 MB)',
  'Past Exam Questions',
  'TMA Prep & Study Guides',
  'Module Jump Links (MOD 1–4)',
  'Formula & Definition Briefs',
  'NOUN & Miva Course Codes',
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
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600">
                <FileText size={15} />
              </span>
              <span className="font-mono text-[11px] truncate">BIO201_Cell_Respiration.pdf</span>
            </div>
            <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
              24 pages
            </span>
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
        </div>
        <div className="mt-5 space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-semibold">PDF / PNG / JPG</span>
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-semibold">Up to 50 MB</span>
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-semibold">Course: BIO 201</span>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
            <span>Extracting formulas &amp; key points…</span>
            <span className="text-[#10b981] font-bold">Ready</span>
          </div>
        </div>
      </div>

      <div className="ls-panel rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#2563eb] dark:text-blue-400 font-mono">
            <BookOpenCheck size={12} /> STUDY BRIEF
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/60">
              Intermediate
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Clock size={11} /> 3 min read
            </span>
          </div>
        </div>
        <h4 className="font-[Manrope] text-base font-extrabold text-slate-900 dark:text-white">
          Cellular Respiration: High-Yield Breakdown
        </h4>
        <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
          {[
            'Glycolysis converts glucose into 2 pyruvate molecules (+2 net ATP, cytoplasm).',
            'Krebs Cycle oxidizes acetyl-CoA, producing NADH and FADH2 carriers (mitochondria).',
            'Electron Transport Chain utilizes proton gradient to yield 32–34 ATP with oxygen.',
          ].map((item, idx) => (
            <li key={idx} className="flex gap-2 items-start">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#10b981]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 px-3.5 py-2.5 text-[12px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
          <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">Keep in Mind:</span>
          <span>Compare total aerobic vs. anaerobic ATP yields for short-answer exam questions.</span>
        </div>
        <div className="mt-3.5 flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] text-white px-2.5 py-1">
            <BookOpenCheck size={12} /> Take a quiz
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1">
            <GraduationCap size={12} className="text-purple-500" /> Open in Study Room
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1">
            <Copy size={12} /> Copy notes
          </span>
        </div>
      </div>
    </div>
  );
}

const TUTOR_MODES = {
  standard: {
    label: 'Grounded Response',
    citation: 'BIO201_Handout_3.pdf · Page 14',
    lead: 'Think of the Krebs cycle as an energy extraction refinery rather than the main power generator:',
    points: [
      'Its primary role is not direct ATP synthesis — it strips high-energy electrons from acetyl-CoA.',
      'Those electrons are packed into carrier coenzymes NADH and FADH2 inside the mitochondrial matrix.',
      'Both carriers feed the Electron Transport Chain, which drives over 90% of your total ATP output.',
    ],
  },
  pidgin: {
    label: 'Nigerian Pidgin',
    citation: 'BIO201_Handout_3.pdf · Page 14',
    lead: 'No worry, make we break am down sharp-sharp! Krebs cycle na like crude oil refinery, no be the NEPA turbine:',
    points: [
      'E no dey produce big ATP direct — im main work na to harvest plenty high-energy electrons from glucose.',
      'E go package those electrons inside special battery packs wey dem call NADH and FADH2.',
      'Na when NADH and FADH2 reach Electron Transport Chain na im 32–34 ATP go drop at once!',
    ],
  },
  analogy: {
    label: 'Everyday Naija Analogy',
    citation: 'BIO201_Handout_3.pdf · Page 14',
    lead: 'Imagine fetching fuel at a depot (Krebs cycle) versus burning it in your generator (ETC):',
    points: [
      'At the depot, you only get 2 small tokens (2 direct ATP), which looks tiny on the surface.',
      'But you are filling two massive jerrycans — NADH and FADH2 — with high-octane energy.',
      'Back home, pouring those jerrycans into the Electron Transport Chain powers the entire building.',
    ],
  },
} as const;

function StudyRoomPreview() {
  const [tutorMode, setTutorMode] = useState<keyof typeof TUTOR_MODES>('standard');
  const [activeMod, setActiveMod] = useState<'MOD 1' | 'MOD 2'>('MOD 2');
  const activeCopy = TUTOR_MODES[tutorMode];

  return (
    <div className="grid md:grid-cols-12 bg-slate-50/70 dark:bg-slate-950">
      {/* Left Course Sources & Module Jump Drawer */}
      <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Course Workspace
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 text-[10px] font-mono font-extrabold text-[#2563eb] dark:text-blue-400">
                BIO 201
              </span>
              <b className="text-xs font-[Manrope] text-slate-900 dark:text-white">Cell Respiration</b>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
            2 / 10 PDFs
          </span>
        </div>

        <div className="space-y-2">
          <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Active Course Notes
          </span>
          {['BIO201_Handout_3.pdf', 'Metabolism_Past_Qs.pdf'].map((file) => (
            <div
              key={file}
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-2"
            >
              <FileText size={13} className="text-[#2563eb] dark:text-blue-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[11px] text-slate-800 dark:text-slate-200">{file}</b>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 size={10} /> Grounded in Tutor
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Quick Module Jump Links
            </span>
            <span className="text-[9px] text-slate-400">Click to focus</span>
          </div>
          {[
            { code: 'MOD 1' as const, title: 'Glycolysis & Cytoplasm ATP' },
            { code: 'MOD 2' as const, title: 'Krebs Cycle & Electron Carriers' },
          ].map((mod) => (
            <button
              key={mod.code}
              type="button"
              onClick={() => setActiveMod(mod.code)}
              className={`w-full flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                activeMod === mod.code
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200'
              }`}
            >
              <span className="rounded bg-[#2563eb] px-1.5 py-0.5 text-[9px] font-mono font-bold text-white shrink-0">
                {mod.code}
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                {mod.title}
              </span>
              <ChevronRight size={12} className="text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Right Tutor Chat Area */}
      <div className="md:col-span-8 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
        <div className="space-y-3.5">
          <div className="ls-panel flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#2563eb] px-4 py-2.5 text-[12.5px] text-white shadow-md shadow-blue-500/20 font-medium">
              Why does {activeMod === 'MOD 1' ? 'Glycolysis' : 'the Krebs cycle'} matter if it only makes 2 ATP directly?
            </div>
          </div>

          <div className="ls-panel flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#4f46e5] text-white shadow-md">
              <GraduationCap size={15} />
            </span>
            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3.5 text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-300 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <b className="text-xs font-[Manrope] text-slate-900 dark:text-white">SlotStudy Tutor</b>
                  <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    Senior Coursemate
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 px-2 py-0.5 text-[10px] font-mono font-bold text-[#2563eb] dark:text-blue-400">
                  <BookOpenCheck size={11} /> {activeCopy.citation}
                </span>
              </div>

              <p className="font-medium text-slate-800 dark:text-slate-200">{activeCopy.lead}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-slate-600 dark:text-slate-400">
                {activeCopy.points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ol>

              {/* Interactive Prompt Mode Switcher + Read Aloud */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTutorMode('standard')}
                    className={`rounded-lg px-2.5 py-1 text-[10.5px] font-semibold transition ${
                      tutorMode === 'standard'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    📘 Academic English
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorMode('pidgin')}
                    className={`rounded-lg px-2.5 py-1 text-[10.5px] font-semibold transition ${
                      tutorMode === 'pidgin'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    🇳🇬 Explain in Pidgin
                  </button>
                  <button
                    type="button"
                    onClick={() => setTutorMode('analogy')}
                    className={`rounded-lg px-2.5 py-1 text-[10.5px] font-semibold transition ${
                      tutorMode === 'analogy'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    💡 Naija Analogy
                  </button>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300">
                  <Headphones size={12} className="text-[#2563eb] dark:text-blue-400" /> Read aloud (en-NG)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-[12px] text-slate-400 shadow-sm">
          <span className="truncate">Ask your Study Room Tutor about your uploaded PDFs…</span>
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" title="Voice input (en-NG)">
              <Mic size={13} />
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2563eb] text-white">
              <Send size={13} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEMO_BUDDIES = [
  {
    id: 'b1',
    name: 'Tunde Adeyemi',
    school: 'NOUN',
    schoolFull: 'National Open University (NOUN)',
    program: 'B.Sc. Computer Science · Year 3',
    courses: ['CIT 303', 'GST 204', 'MTH 211'],
    bio: 'Preparing for CIT 303 & GST 204 e-exams. Happy to swap summaries and quiz together.',
    online: true,
    initials: 'TA',
  },
  {
    id: 'b2',
    name: 'Chidinma Okafor',
    school: 'Miva',
    schoolFull: 'Miva Open University',
    program: 'B.Sc. Software Engineering · Year 2',
    courses: ['GST 204', 'BIO 201', 'CSC 201'],
    bio: 'Looking for study accountability buddies for weekend past-question drills.',
    online: true,
    initials: 'CO',
  },
  {
    id: 'b3',
    name: 'Sadiq Bello',
    school: 'UNILAG DLI',
    schoolFull: 'University of Lagos (DLI)',
    program: 'B.Sc. Business Admin · Year 3',
    courses: ['BUS 301', 'GST 204', 'ECO 202'],
    bio: 'Working professional revising evenings 8–10 PM WAT. Let’s stay consistent.',
    online: false,
    initials: 'SB',
  },
];

function StudyBuddyPreview() {
  const [schoolFilter, setSchoolFilter] = useState<'All' | 'NOUN' | 'Miva' | 'UNILAG DLI'>('All');
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  const visibleStudents = DEMO_BUDDIES.filter(
    (s) => schoolFilter === 'All' || s.school === schoolFilter,
  );

  const toggleRequest = (id: string) => {
    setSentRequests((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-5 sm:p-7 bg-slate-50/70 dark:bg-slate-950 space-y-5">
      {/* Top School Filter & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'NOUN', 'Miva', 'UNILAG DLI'] as const).map((school) => (
            <button
              key={school}
              type="button"
              onClick={() => setSchoolFilter(school)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                schoolFilter === school
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <School size={11} />
              <span>{school === 'All' ? 'All Open Universities' : school}</span>
            </button>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800 px-2.5 py-1 text-[10.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
          <Gift size={12} /> Referral Invite Ready
        </span>
      </div>

      {/* Discovery Cards + Live Peer Chat */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-3">
          {visibleStudents.map((student) => {
            const isSent = !!sentRequests[student.id];
            return (
              <div
                key={student.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                        {student.initials}
                      </div>
                      {student.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <b className="truncate text-sm font-[Manrope] text-slate-900 dark:text-white">
                          {student.name}
                        </b>
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                          {student.school}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {student.program}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleRequest(student.id)}
                    className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                      isSent
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isSent ? (
                      <>
                        <Clock size={12} /> Pending
                      </>
                    ) : (
                      <>
                        <UserPlus size={12} /> Add Buddy
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{student.bio}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {student.courses.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300"
                    >
                      <BookOpen size={10} /> {code}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live 1-on-1 Peer Chat */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                  CO
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
              </div>
              <div className="min-w-0">
                <b className="block truncate text-xs font-[Manrope] text-slate-900 dark:text-white">
                  Chidinma Okafor
                </b>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Online · Miva Open University
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              <UserCheck size={11} /> Connected
            </span>
          </div>

          <div className="my-4 space-y-2.5 text-[12px]">
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-slate-700 dark:text-slate-200">
              Hey! Did you already cover GST 204 Module 3 informal fallacies for this week’s TMA?
            </div>
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-indigo-600 px-3.5 py-2 text-white">
              Yes! Just ran a 10-question timed quiz from the brief. Want to compare notes at 8 PM?
              <span className="mt-1 flex items-center justify-end gap-1 text-[9px] text-indigo-100">
                8:14 PM <CheckCheck size={11} />
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] text-slate-500 dark:text-slate-400">
              <span>Chidinma is typing</span>
              <span className="inline-flex gap-0.5">
                <span className="ls-dot h-1 w-1 rounded-full bg-slate-400" />
                <span className="ls-dot h-1 w-1 rounded-full bg-slate-400" />
                <span className="ls-dot h-1 w-1 rounded-full bg-slate-400" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-[11px] text-slate-400">
            <span>Message Chidinma…</span>
            <span className="ml-auto grid h-6 w-6 place-items-center rounded-lg bg-indigo-600 text-white">
              <Send size={11} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizPreview() {
  const options = ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'];
  const correct = 1;
  const [picked, setPicked] = useState<number | null>(null);
  const [quizMode, setQuizMode] = useState<'practice' | 'test'>('practice');
  const answered = picked !== null;

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Question 3 of 10 · BIO201
          </span>
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setQuizMode('practice')}
              className={`rounded-md px-2 py-1 transition ${
                quizMode === 'practice'
                  ? 'bg-white dark:bg-slate-900 text-[#2563eb] dark:text-blue-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Practice Mode
            </button>
            <button
              type="button"
              onClick={() => setQuizMode('test')}
              className={`rounded-md px-2 py-1 transition ${
                quizMode === 'test'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Timed Test Mode
            </button>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3 py-1 font-mono font-bold text-amber-700 dark:text-amber-400">
          {quizMode === 'test' ? (
            <>
              <Clock size={13} className="text-amber-500" /> 14:42 remaining
            </>
          ) : (
            <>
              <Flame size={13} className="text-amber-500" /> Instant Feedback
            </>
          )}
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
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <b className={picked === correct ? 'text-[#10b981]' : 'text-red-600'}>
              {picked === correct ? '✓ Correct! +50 XP added' : '✗ Flagged for Mistakes-Only Review'}
            </b>
            <span className="text-[10px] font-mono text-slate-400">5 · 10 · 15 question decks</span>
          </div>
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
          👆 Pick an option or switch between Practice Mode &amp; Timed Test Mode above.
        </p>
      )}
    </div>
  );
}

function ProgressPreview() {
  const days = [40, 65, 30, 85, 60, 95, 75];
  const courses = [
    { name: 'BIO 201: Cell Biology', pct: 82, color: '#2563eb' },
    { name: 'GST 204: Philosophy & Logic', pct: 74, color: '#10b981' },
    { name: 'CHM 202: Organic Chemistry II', pct: 48, color: '#f59e0b' },
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
          <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 font-mono uppercase">
            <span>Weekly Study Hours</span>
            <span className="text-[#2563eb] dark:text-blue-400">11.4 hrs</span>
          </div>
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-sm font-extrabold text-slate-900 dark:text-white font-[Manrope]">Subject Mastery &amp; Quiz Accuracy</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
            <Target size={12} /> 78% Overall Accuracy
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
  { id: 'summary', label: 'Study Briefs', icon: FileText, url: 'slotstudyonline.com/ai', Comp: SummaryPreview },
  { id: 'room', label: 'Study Room & Tutor', icon: GraduationCap, url: 'slotstudyonline.com/study-room', Comp: StudyRoomPreview },
  { id: 'buddy', label: 'Study Buddy Network', icon: Users, url: 'slotstudyonline.com/study-buddy', Comp: StudyBuddyPreview },
  { id: 'quiz', label: 'Quizzes & Review', icon: BookOpenCheck, url: 'slotstudyonline.com/quizzes', Comp: QuizPreview },
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
                Turn dense lecture slides, handout photos, and past questions into structured Study Briefs, practice &amp; timed quiz decks, and a{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-100">Study Room</strong> with a grounded Senior Coursemate Tutor—plus{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-100">Study Buddy</strong> to connect and chat with real coursemates across Open Universities.
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
                Inside the SlotStudy <span className="text-[#2563eb] dark:text-blue-400">Workspace</span>
              </>
            }
            text="Switch through all five core spaces below—Study Briefs, Study Room with your Tutor, Study Buddy peer network, Dual-Mode Quizzes, and Progress Analytics."
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
              <div key={active.id} role="tabpanel" className="min-h-[380px]">
                <ActivePreview />
              </div>
            </BrowserFrame>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURES BENTO & CAPABILITY SHOWCASE
          ========================================================================= */}
      <section id="features" className="scroll-mt-20 py-20 sm:py-28 bg-white dark:bg-[#0b0f19] border-y border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Complete Academic Toolkit"
            title={
              <>
                Built for Real Courses, Real Exams &amp; <span className="text-[#2563eb] dark:text-blue-400">Real Coursemates</span>
              </>
            }
            text="Every feature inside SlotStudy solves a specific semester bottleneck—from finding Open University peers in Study Buddy to drilling cited course notes in the Study Room."
          />

          {/* Tier 1: Flagship Interactive Bento Cards */}
          <div className="grid gap-6 lg:grid-cols-12 mb-6">
            {/* Flagship Card A: Study Buddy (Open University Peer Network) */}
            <Reveal className="lg:col-span-7 min-w-0">
              <article className="ls-card-hover relative h-full overflow-hidden rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 flex flex-col justify-between shadow-lg shadow-indigo-500/5">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      <Users size={12} /> Study Buddy • Peer Network
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Real-Time Student Chat
                    </span>
                  </div>

                  <h3 className="mt-4 font-[Manrope] text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
                    Connect With Open University Coursemates — Never Study Solo
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
                    Distance learning shouldn&apos;t mean studying in isolation. Discover verified students across Open &amp; Distance Learning universities taking your exact course codes, send friend requests, chat 1-on-1 with read receipts &amp; typing indicators, or share referral invites.
                  </p>

                  {/* Institution Support Strip */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {['NOUN', 'Miva Open University', 'UNILAG DLI', 'UI DLC', 'UNN CDeL', 'ABU'].map((uni) => (
                      <span
                        key={uni}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-2xs"
                      >
                        <School size={11} className="text-indigo-500" />
                        {uni}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Embedded High-Craft Peer Discovery + Live Chat UI */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {/* Mini Student Profile Cards */}
                  <div className="space-y-2.5">
                    {[
                      {
                        initials: 'TA',
                        name: 'Tunde A.',
                        meta: 'NOUN · B.Sc. Info Tech · 300L',
                        codes: ['CIT 303', 'GST 204'],
                        status: 'Connected',
                        statusTone: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                      },
                      {
                        initials: 'CO',
                        name: 'Chidinma O.',
                        meta: 'Miva Open Uni · Software Eng · 200L',
                        codes: ['GST 204', 'CSC 201'],
                        status: '+ Add Buddy',
                        statusTone: 'bg-indigo-600 text-white border-indigo-600',
                      },
                    ].map((peer) => (
                      <div
                        key={peer.name}
                        className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300">
                                {peer.initials}
                              </span>
                              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500" />
                            </div>
                            <div className="min-w-0">
                              <b className="block truncate text-xs font-[Manrope] text-slate-900 dark:text-white">{peer.name}</b>
                              <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">{peer.meta}</span>
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-bold ${peer.statusTone}`}>
                            {peer.status}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {peer.codes.map((c) => (
                            <span key={c} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9.5px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mini Live 1-on-1 Peer Chat Preview */}
                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-3.5 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-100">
                        <MessageSquare size={12} className="text-indigo-500" /> 1-on-1 Buddy Chat
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        <Gift size={10} /> Invite Classmates
                      </span>
                    </div>
                    <div className="my-2.5 space-y-2 text-[11px]">
                      <div className="rounded-xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-200">
                        Finished the GST 204 Module 3 brief — want to compare TMA notes?
                      </div>
                      <div className="ml-auto max-w-[90%] rounded-xl rounded-br-sm bg-indigo-600 px-3 py-2 text-white">
                        Yes! Let&apos;s drill the 10-question quiz at 8 PM.
                        <span className="mt-0.5 flex items-center justify-end gap-1 text-[9px] text-indigo-100">
                          Read <CheckCheck size={10} />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Filter by school · course · online</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Report / Block safe</span>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Flagship Card B: Study Room (Grounded Tutor) */}
            <Reveal delay={90} className="lg:col-span-5 min-w-0">
              <article className="ls-card-hover relative h-full overflow-hidden rounded-3xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/70 via-white to-emerald-50/40 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 flex flex-col justify-between shadow-lg shadow-blue-500/5">
                <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563eb] dark:text-blue-300">
                      <GraduationCap size={12} /> Study Room • Grounded Tutor
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                      Up to 10 PDFs / session
                    </span>
                  </div>

                  <h3 className="mt-4 font-[Manrope] text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
                    Study Room With Your Senior Coursemate Tutor
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Attach up to 10 handouts and jump straight to topics via Quick Module Links (<span className="font-mono text-xs font-semibold">MOD 1–4</span>). Get page-cited explanations strictly from your slides—in Academic English, Nigerian Pidgin, or Naija analogies, with Voice Dictation and Read Aloud.
                  </p>
                </div>

                {/* Embedded Tutor Response & Audio/Pidgin Controls */}
                <div className="mt-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                      <span className="rounded bg-[#2563eb] px-1 py-0.2 text-[9px] text-white">MOD 2</span>
                      Logic &amp; Validity
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 px-2.5 py-1 text-[10px] font-mono font-bold text-[#2563eb] dark:text-blue-400">
                      <BookOpenCheck size={11} /> Handout 2 · Page 19
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#4f46e5] text-white">
                          <Sparkles size={13} />
                        </span>
                        <div>
                          <b className="block text-xs font-[Manrope] text-slate-900 dark:text-white">SlotStudy Tutor</b>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Cited From Your PDFs</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800 px-2 py-0.5 text-[9.5px] font-bold text-purple-700 dark:text-purple-300">
                        Senior Coursemate
                      </span>
                    </div>

                    <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
                      &ldquo;Validity checks if the conclusion strictly follows the premises—even before checking real-world truth. See <b className="text-slate-800 dark:text-white">GST204_Mod2.pdf (p. 19)</b>.&rdquo;
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        🇳🇬 Explain in Pidgin
                      </span>
                      <span className="rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800 px-2 py-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                        💡 Naija Analogy
                      </span>
                    </div>

                    {/* Voice Dictation & Read Aloud Bar */}
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 px-3 py-2">
                      <div className="flex items-center gap-2 text-[10.5px] font-semibold text-slate-700 dark:text-slate-200">
                        <Headphones size={13} className="text-[#2563eb] dark:text-blue-400" />
                        <span>Read Aloud</span>
                        <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
                          {[45, 85, 60, 100, 50, 75].map((h, idx) => (
                            <span
                              key={idx}
                              className="w-0.5 rounded-full bg-[#2563eb] dark:bg-blue-400"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                        <Mic size={11} className="text-rose-500" /> en-NG Voice Input
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>

          {/* Tier 2: 6 Detailed Capability Cards with Micro-UI Spec Strips */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITY_CARDS.map((card, i) => (
              <Reveal key={card.title} delay={(i % 3) * 80}>
                <article className="ls-card-hover group relative h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-6 flex flex-col justify-between">
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${card.accentGradient} opacity-80`} />

                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span className={`ls-icon-wiggle grid h-11 w-11 place-items-center rounded-xl ${card.tone}`}>
                        <card.icon size={20} />
                      </span>
                      <span className="rounded-full border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                        {card.eyebrow}
                      </span>
                    </div>

                    <h3 className="font-[Manrope] text-lg font-extrabold text-slate-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {card.text}
                    </p>
                  </div>

                  {/* Embedded Micro-UI Spec Footer */}
                  <div className="relative mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {card.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-md bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 px-2 py-0.5 text-[10.5px] font-mono font-semibold text-slate-700 dark:text-slate-200"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 dark:text-slate-500">{card.metaLabel}</span>
                      <b className="text-slate-800 dark:text-slate-200">{card.metaValue}</b>
                    </div>
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
              Upload dense lecture slides on your laptop at the library, then review Study Briefs, drill practice quizzes, ask your Study Room Tutor, or message Open University peers in Study Buddy right from your Android phone.
            </p>

            <ul className="mt-6 space-y-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              {[
                'Single account syncs courses, briefs, and Study Room threads',
                '14-day streak, XP levels, and quiz history stay updated',
                'Real-time Study Buddy chats & friend-request alerts on mobile',
                'Direct 28 MB Android APK — no app store account needed',
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
                {['Read BIO201 brief', 'Study Room Tutor Q&A', 'Chat NOUN Study Buddy'].map((task, i) => (
                  <div key={task} className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-900 p-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${i < 2 ? 'bg-[#10b981] text-white' : 'border border-slate-300 dark:border-slate-700'}`}>
                      {i < 2 && <Check size={9} />}
                    </span>
                    <span className="truncate">{task}</span>
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
              <span>Cloud Sync • Web &amp; Android</span>
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
                Your complete academic workspace — structured Study Briefs, dual-mode practice quizzes, a cited Study Room Tutor, and Study Buddy peer connections across Open Universities.
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
