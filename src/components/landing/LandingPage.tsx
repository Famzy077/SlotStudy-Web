import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BrainCircuit,
  BookOpenCheck,
  Flame,
  Trophy,
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Laptop,
  Smartphone,
  Menu,
  X,
  QrCode,
  FileText,
  Send,
  HelpCircle,
} from 'lucide-react';
import ThreeKnowledgeCore from './ThreeKnowledgeCore';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summaries' | 'buddy' | 'quiz' | 'workspace'>('summaries');
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Close download modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDownloadModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const features = [
    {
      id: 'summaries',
      title: '01 · AI Document Summarizer',
      badge: 'Cognitive Engine',
      description: 'Transform 60-page PDF slides, research papers, and complex lecture transcripts into executive study briefs, core formulas, and key exam flashpoints in seconds.',
      icon: <FileText size={20} className="text-blue-400" />,
    },
    {
      id: 'buddy',
      title: '02 · Virtual AI Study Buddy',
      badge: '24/7 Academic Mentor',
      description: 'Stuck on a challenging concept at 2 AM? Ask your custom AI tutor for intuitive analogies, mathematical breakdowns, and step-by-step problem resolutions.',
      icon: <BrainCircuit size={20} className="text-purple-400" />,
    },
    {
      id: 'quiz',
      title: '03 · Adaptive Practice Quizzes',
      badge: 'Exam Simulation',
      description: 'Automatically generate high-yield multiple-choice and conceptual practice questions directly from your syllabus with instant feedback and pedagogical rationales.',
      icon: <BookOpenCheck size={20} className="text-emerald-400" />,
    },
    {
      id: 'workspace',
      title: '04 · Academic Workspace & Gamification',
      badge: 'Habit Mastery',
      description: 'Stay accountable with automated daily streak milestones, XP rewards, course progress telemetry, and synchronized revision countdowns.',
      icon: <Trophy size={20} className="text-amber-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden">
      {/* Background Architectural Grid & Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/12 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 right-10 w-[500px] h-[350px] bg-purple-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[300px] bg-emerald-600/8 rounded-full blur-[120px]" />
      </div>

      {/* =========================================================================
          1. STICKY GLASS NAVBAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070a13]/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                SlotStudy<span className="text-blue-500">.</span>
              </span>
              <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase -mt-1">
                AI Learning Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <a href="#features" className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors">
              Features
            </a>
            <a href="#strata" className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors">
              AI Strata
            </a>
            <a href="#ecosystem" className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors">
              Android APK
            </a>
            <a href="#metrics" className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors">
              Impact
            </a>
            <a href="#faq" className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDownloadModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 transition-colors"
            >
              <Smartphone size={13} />
              <span>Get APK (v1.0.0)</span>
            </button>

            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight size={13} />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 bg-[#0b0f19] border-b border-slate-800 space-y-3">
            <div className="flex flex-col space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
              >
                Features
              </a>
              <a
                href="#strata"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
              >
                AI Strata
              </a>
              <a
                href="#ecosystem"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
              >
                Android APK
              </a>
              <a
                href="#metrics"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
              >
                Impact
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
              >
                FAQ
              </a>
            </div>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDownloadModalOpen(true);
                }}
                className="w-full text-center py-2.5 rounded-xl font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30"
              >
                Download Android APK (v1.0.0)
              </button>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started on Web
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION & THREE.JS 3D CANVAS
          ========================================================================= */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Dual CTAs */}
            <div className="lg:col-span-6 text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-emerald-400">NEXT-GEN STUDY ENGINE</span>
                <span className="text-slate-600">•</span>
                <span>AI-POWERED ACADEMIC ACCELERATOR</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                Master Every Course.
                <span className="block mt-2 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Powered by AI.
                </span>
                <span className="block mt-1 text-slate-300 font-medium text-3xl sm:text-4xl lg:text-5xl">
                  Engineered for Top Grades.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mb-8">
                Transform messy lecture slides, 100-page textbooks, and complex syllabi into instant structured summaries, intelligent practice quizzes, and interactive AI study room sessions. Fully synchronized across Web and Android.
              </p>

              {/* Dual Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
                {/* 1. Primary Web CTA */}
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02]"
                >
                  <Laptop size={17} />
                  <span>Get Started on Web</span>
                  <ArrowRight size={15} />
                </Link>

                {/* 2. Secondary Mobile APK CTA */}
                <button
                  type="button"
                  onClick={() => setDownloadModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 backdrop-blur-md shadow-md transition-all hover:border-slate-600"
                >
                  <Smartphone size={17} className="text-emerald-400" />
                  <span>Download Android App</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    APK v1.0.0
                  </span>
                </button>
              </div>

              {/* Micro Social Proof / Tech Specs */}
              <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400 pt-4 border-t border-slate-800/70">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-blue-400" />
                  <span>Real-time cross-device sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-purple-400" />
                  <span>Offline study on mobile</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Three.js Knowledge Core */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900/40 via-slate-900/80 to-[#0b0f19] border border-slate-800/80 shadow-2xl p-2">
                <ThreeKnowledgeCore />
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Conduit Pulse to next section */}
        <div className="relative mx-auto mt-16 h-12 w-px bg-slate-800 overflow-hidden">
          <span className="block w-full h-6 bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-pulse" />
        </div>
      </section>

      {/* =========================================================================
          3. SOCIAL PROOF & METRICS STRIP
          ========================================================================= */}
      <section id="metrics" className="relative z-10 py-12 border-y border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <span className="block text-3xl sm:text-4xl font-extrabold text-white font-mono mb-1">
                10,000+
              </span>
              <span className="text-xs sm:text-sm text-slate-400">
                Study Questions Generated
              </span>
            </div>
            <div className="p-4 border-l border-slate-800/60">
              <span className="block text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono mb-1">
                99.4%
              </span>
              <span className="text-xs sm:text-sm text-slate-400">
                Concept Comprehension Rate
              </span>
            </div>
            <div className="p-4 border-l border-slate-800/60">
              <span className="block text-3xl sm:text-4xl font-extrabold text-purple-400 font-mono mb-1">
                &lt; 3.0s
              </span>
              <span className="text-xs sm:text-sm text-slate-400">
                AI Synthesis Latency
              </span>
            </div>
            <div className="p-4 border-l border-slate-800/60">
              <span className="block text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono mb-1">
                100%
              </span>
              <span className="text-xs sm:text-sm text-slate-400">
                Offline First Mobile Sync
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. CORE PLATFORM FEATURE SHOWCASE: "THE SLOTSTUDY STRATA"
          ========================================================================= */}
      <section id="strata" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              ACADEMIC INTELLIGENCE SUITE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4">
              The SlotStudy Strata
            </h2>
            <p className="text-base text-slate-400">
              Four specialized academic tools engineered into a unified, distraction-free study environment.
            </p>
          </div>

          {/* Interactive Strata Tab Controller */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {features.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-500'
                    : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.title.split('·')[1]}</span>
              </button>
            ))}
          </div>

          {/* Interactive Feature Live Simulation Card */}
          <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden bg-slate-900/80 border border-slate-800/90 shadow-2xl p-6 sm:p-10 backdrop-blur-xl">
            {/* Feature 1: AI Document Summaries */}
            {activeTab === 'summaries' && (
              <div className="grid lg:grid-cols-12 gap-8 items-center animate-fadeIn">
                <div className="lg:col-span-5 space-y-4">
                  <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Cognitive Synthesis
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    Extract High-Yield Exam Insights in Seconds
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Upload dense lecture PDFs, textbook chapters, or raw lecture notes. SlotStudy automatically detects definitions, algorithms, and key exam flashpoints.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400 pt-2 font-mono">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Automatic Markdown &amp; MathJax formula rendering</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>High-yield exam takeaway highlights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Export directly to mobile flashcards</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Link to="/register" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300">
                      <span>Try document synthesis free</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Live Mockup */}
                <div className="lg:col-span-7 rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-300 ml-2">CS301_Distributed_Systems_Lec4.pdf</span>
                    </div>
                    <span className="text-emerald-400 font-bold">SYNTHESIS READY (1.8s)</span>
                  </div>
                  <div className="space-y-3 text-slate-300 leading-relaxed">
                    <p className="text-white font-bold text-sm font-sans">
                      📌 Executive Brief: Paxos vs Raft Consensus
                    </p>
                    <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-200">
                      <strong>Core Concept:</strong> Both protocols guarantee safety under Asynchronous Network Partitions. Raft achieves equivalence to Paxos by decomposing consensus into Leader Election, Log Replication, and Safety invariants.
                    </div>
                    <div className="space-y-1 text-slate-300">
                      <span className="text-xs font-bold text-amber-300 font-sans block">Exam Takeaways:</span>
                      <p>• Split-vote prevention is mitigated via randomized election timeouts (150ms - 300ms).</p>
                      <p>• Majority quorum formula: <code className="text-emerald-300">Q = ⌊N/2⌋ + 1</code></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feature 2: AI Study Buddy */}
            {activeTab === 'buddy' && (
              <div className="grid lg:grid-cols-12 gap-8 items-center animate-fadeIn">
                <div className="lg:col-span-5 space-y-4">
                  <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    24/7 AI Mentor
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    Conversational AI Trained on Your Course Materials
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Ask questions in plain English. Your Study Buddy breaks down hard theorems into intuitive step-by-step logic, generates practice scenarios, and tests your understanding.
                  </p>
                  <div className="pt-4">
                    <Link to="/register" className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300">
                      <span>Start a study session</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Live Mock Chat */}
                <div className="lg:col-span-7 rounded-2xl bg-slate-950 border border-slate-800 p-5 text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <BrainCircuit size={14} className="text-purple-400" />
                      <span className="text-white font-bold">Study Buddy // Room #4</span>
                    </div>
                    <span className="text-emerald-400">● AI Mentor Active</span>
                  </div>
                  <div className="space-y-3 font-sans">
                    <div className="flex gap-2.5 items-start justify-end">
                      <div className="p-3 rounded-2xl bg-blue-600 text-white max-w-sm rounded-tr-none">
                        Can you explain Byzantine Fault Tolerance using a simple real-world analogy?
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-300">
                        <Sparkles size={13} />
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 max-w-md rounded-tl-none space-y-2">
                        <p>
                          Think of 4 generals surrounding a city. They must all attack at the same time to win, communicating only via messenger.
                        </p>
                        <p className="text-slate-300">
                          If 1 general is a traitor sending contradictory messages (telling 2 generals to attack and 1 to retreat), a <strong>Byzantine Fault Tolerant</strong> system still agrees on the right plan as long as more than 2/3 of nodes are honest (<code className="text-purple-300 font-mono">3f + 1</code>).
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <input
                      type="text"
                      disabled
                      placeholder="Ask your syllabus anything..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 focus:outline-none"
                    />
                    <button className="p-2 rounded-lg bg-purple-600 text-white">
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Feature 3: Interactive Practice Quizzes */}
            {activeTab === 'quiz' && (
              <div className="grid lg:grid-cols-12 gap-8 items-center animate-fadeIn">
                <div className="lg:col-span-5 space-y-4">
                  <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active Recall Arena
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    Test Your Knowledge With Adaptive Question Banks
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Test yourself before exam day. SlotStudy analyzes your weakest topics and dynamically crafts targeted questions to reinforce your memory.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Quiz Streak</span>
                      <span className="text-amber-400 font-bold">🔥 6 in a row</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>XP Earned</span>
                      <span className="text-emerald-400 font-bold">+120 XP</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Quiz Simulation */}
                <div className="lg:col-span-7 rounded-2xl bg-slate-950 border border-slate-800 p-6 text-xs font-sans shadow-inner">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <span>QUESTION 3 OF 10 // BIOLOGY 201</span>
                    <span className="text-blue-400 font-bold">REWARD: +50 XP</span>
                  </div>

                  <p className="text-base font-bold text-white mb-4">
                    Which enzyme is primarily responsible for unwinding the DNA double helix during replication?
                  </p>

                  <div className="space-y-2 mb-4">
                    {[
                      { id: 0, text: 'A) DNA Polymerase III' },
                      { id: 1, text: 'B) DNA Helicase', correct: true },
                      { id: 2, text: 'C) RNA Primase' },
                      { id: 3, text: 'D) Topoisomerase' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setQuizSelectedOption(opt.id);
                          setQuizSubmitted(true);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                          quizSelectedOption === opt.id
                            ? opt.correct
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                              : 'bg-rose-950/60 border-rose-500 text-rose-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs leading-relaxed animate-fadeIn">
                      <strong>✓ Correct!</strong> DNA Helicase breaks the hydrogen bonds between complementary base pairs, creating the replication fork.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Feature 4: Academic Workspace & Gamification */}
            {activeTab === 'workspace' && (
              <div className="grid lg:grid-cols-12 gap-8 items-center animate-fadeIn">
                <div className="lg:col-span-5 space-y-4">
                  <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Habit Architecture
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    Gamified Accountability That Keeps You Consistent
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Build unstoppable study momentum with automated streak tracking, course completion milestones, and leaderboard rankings with fellow coursemates.
                  </p>
                  <div className="pt-2">
                    <Link to="/register" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300">
                      <span>Join academic workspace</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Workspace Cards Mockup */}
                <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                      <span>Daily Streak</span>
                      <Flame size={18} className="text-amber-400 animate-bounce" />
                    </div>
                    <div className="text-3xl font-extrabold text-white font-mono">
                      14 Days
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-4/5 rounded-full" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Top 5% consistency in your cohort
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                      <span>Total Scholar XP</span>
                      <Trophy size={18} className="text-purple-400" />
                    </div>
                    <div className="text-3xl font-extrabold text-white font-mono">
                      2,450 XP
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full w-3/5 rounded-full" />
                    </div>
                    <p className="text-[11px] text-purple-300">
                      Level 4: Academic Researcher
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CROSS-PLATFORM ECOSYSTEM: WEB + ANDROID
          ========================================================================= */}
      <section id="ecosystem" className="relative z-10 py-24 bg-gradient-to-b from-transparent via-slate-950/80 to-transparent border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Cross Platform Features & Direct APK Download */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                <Smartphone size={14} />
                <span>CROSS-PLATFORM SYNC // ZERO LATENCY</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Study Seamlessly on Desktop.
                <span className="block text-emerald-400">Review Anywhere on Android.</span>
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                Generate extensive study summaries and quizzes on your laptop at your desk. When you're commuting or in transit, open the native Android app to review offline flashcards, track streaks, and take rapid-fire quizzes without missing a beat.
              </p>

              {/* Download Card Box */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white">
                      SlotStudy for Android (Universal APK)
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      v1.0.0 Stable • Android 8.0+ Supported • 28MB
                    </p>
                  </div>
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck size={24} />
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="/downloads/SlotStudy-v1.0.0.apk"
                    download="SlotStudy-v1.0.0.apk"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    <Download size={15} />
                    <span>Download Official APK</span>
                  </a>

                  <button
                    onClick={() => setDownloadModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                  >
                    <QrCode size={15} />
                    <span>Scan QR Code</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Verified clean SHA-256 build: 4e91...b82f</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Device Mockups */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Desktop Window Frame */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-mono text-slate-400 ml-2">slotstudyonline.com/dashboard</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-3 border-b border-slate-800">
                      <span>WORKSPACE ACTIVE</span>
                      <span className="text-emerald-400 font-bold">● CLOUD SYNCED</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-white font-semibold">Engineering Mathematics II</span>
                        <span className="text-blue-400 font-mono">92% Mastery</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-white font-semibold">Organic Chemistry Fundamentals</span>
                        <span className="text-purple-400 font-mono">88% Mastery</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Mobile Phone Mockup Overlay */}
                <div className="absolute -bottom-8 -right-4 w-44 sm:w-52 rounded-3xl bg-slate-950 border-2 border-slate-700 shadow-2xl p-2.5 transform translate-y-4 hover:translate-y-2 transition-transform">
                  <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-[10px]">
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span>Android App</span>
                      <span className="text-emerald-400">Ready</span>
                    </div>
                    <p className="font-bold text-white text-xs">
                      🔥 14-Day Streak Live
                    </p>
                    <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-900 text-blue-200">
                      Flashcard deck ready for offline review
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FAQ SECTION
          ========================================================================= */}
      <section id="faq" className="relative z-10 py-20 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the Android APK sync with the Web app?',
                a: 'SlotStudy uses real-time encrypted cloud sync. Any lecture summary or quiz generated on the Web workspace is immediately synchronized with your Android device for offline revision.',
              },
              {
                q: 'What document formats can I upload for AI summaries?',
                a: 'You can upload PDF lecture slides, syllabus documents, PowerPoint exports, Word files, and raw text. The AI parses diagrams, tables, and mathematical notations.',
              },
              {
                q: 'How accurate are the generated practice quizzes?',
                a: 'The quiz engine is specifically tuned for academic standards. It generates questions based strictly on the content of your uploaded materials, preventing hallucinations.',
              },
              {
                q: 'Can I install the Android APK directly on my phone?',
                a: 'Yes! Simply download the .apk file from the button above, allow installation from unknown sources in your Android security settings, and open the app.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-sm">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <HelpCircle size={16} className="text-blue-400 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-slate-400 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FINAL CALL TO ACTION
          ========================================================================= */}
      <section className="relative z-10 py-24 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-[#070a13] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <Sparkles size={28} className="text-white" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Accelerate Your Academic Journey?
          </h2>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Join thousands of university students mastering their degrees with AI summaries, interactive quiz arenas, and habit tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
            >
              <span>Get Started Free on Web</span>
              <ArrowRight size={15} />
            </Link>
            <button
              onClick={() => setDownloadModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              <Smartphone size={16} className="text-emerald-400" />
              <span>Download Android APK</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-800/80 bg-[#070a13] py-12 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white font-sans text-sm">SlotStudy.</span>
            <span>&copy; {new Date().getFullYear()} SlotStudy Online. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <button onClick={() => setDownloadModalOpen(true)} className="hover:text-slate-300 transition-colors">
              Android APK v1.0.0
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Web &amp; Android Ecosystem</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          9. ANDROID APK DOWNLOAD / QR MODAL
          ========================================================================= */}
      {downloadModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setDownloadModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#0b0f19] border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    SlotStudy for Android
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Direct APK Release • v1.0.0
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDownloadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Code Placeholder Graphic */}
            <div className="text-center p-6 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-center">
              <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-md flex items-center justify-center">
                <QrCode size={120} className="text-slate-900" />
              </div>
              <p className="text-xs text-slate-400 mt-3 font-mono">
                Scan with your phone camera to download
              </p>
            </div>

            {/* Direct Download Button */}
            <div className="space-y-3">
              <a
                href="/downloads/SlotStudy-v1.0.0.apk"
                download="SlotStudy-v1.0.0.apk"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Download size={16} />
                <span>Download APK Directly (28 MB)</span>
              </a>

              <div className="p-3 rounded-xl bg-slate-900 text-[11px] text-slate-400 font-mono space-y-1">
                <p>1. Tap Download APK directly to your device.</p>
                <p>2. Open the downloaded file &amp; allow installation.</p>
                <p>3. Log in with your SlotStudy account to sync.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
