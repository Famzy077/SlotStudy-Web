import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, ChevronRight, FileText,
  MessageSquare, PanelLeftClose, Plus, Sparkles, X, CheckCircle2,
} from 'lucide-react';
import type { Course, DataObject, Material } from '../../../types';
import { getPath } from '../../../hooks/useApiQuery';

interface StudyRoomDrawerProps {
  sessionId: string;
  sessionTitle: string;
  courseId?: string;
  courses: Course[];
  materials: Material[];
  sessionMaterials: DataObject[];
  sessions: DataObject[];
  isOpen: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onSelectModulePrompt: (promptText: string) => void;
  onOpenSourcesModal: () => void;
}

export function StudyRoomDrawer({
  sessionId,
  sessionTitle,
  courseId,
  courses,
  materials,
  sessionMaterials,
  sessions,
  isOpen,
  onClose,
  onToggleCollapse,
  onSelectModulePrompt,
  onOpenSourcesModal,
}: StudyRoomDrawerProps) {
  const [activeTab, setActiveTab] = useState<'sources' | 'history'>('sources');

  // Active display materials: use sessionMaterials or fallback to course materials
  const displayMaterials = useMemo(() => {
    if (sessionMaterials.length > 0) return sessionMaterials;
    if (courseId) {
      return materials.filter(
        (m) =>
          getPath(m, 'courseId') === courseId ||
          getPath(m, 'course.id') === courseId,
      );
    }
    return [];
  }, [sessionMaterials, materials, courseId]);

  // Find linked course or extract course code (e.g. GST 204)
  const currentCourse = useMemo(() => {
    if (courseId) {
      return courses.find((c) => c.id === courseId);
    }
    return courses.find((c) =>
      displayMaterials.some(
        (m) =>
          getPath(m, 'courseId') === c.id ||
          getPath(m, 'course.id') === c.id ||
          getPath(m, 'material.courseId') === c.id,
      ),
    );
  }, [courseId, courses, displayMaterials]);

  // Extract or infer course code (e.g. GST 204, BIO 101, etc.)
  const courseCode = useMemo(() => {
    const searchString = `${sessionTitle} ${currentCourse?.title || ''} ${displayMaterials
      .map((m) => String(m.fileName || m.filename || m.title || ''))
      .join(' ')}`;
    const match = searchString.match(/\b([A-Za-z]{2,4}\s*\d{3})\b/i);
    return match ? match[1].toUpperCase() : currentCourse?.title?.slice(0, 7) || 'GST 204';
  }, [sessionTitle, currentCourse, displayMaterials]);

  // Generate dynamic module jump links based on course code / title
  const moduleJumpLinks = useMemo(() => {
    const isGST204 =
      courseCode.includes('GST') ||
      courseCode.includes('204') ||
      sessionTitle.toLowerCase().includes('philosophy') ||
      sessionTitle.toLowerCase().includes('logic');

    if (isGST204) {
      return [
        {
          id: 'mod-1',
          code: 'MOD 1',
          title: 'Definition & Branches of Philosophy',
          prompt: `Summarize the core definitions and major branches of philosophy from our GST 204 notes.`,
        },
        {
          id: 'mod-2',
          code: 'MOD 2',
          title: 'Logic, Proposition & Validity',
          prompt: `Explain deductive vs. inductive arguments and how validity is determined in logic from our notes.`,
        },
        {
          id: 'mod-3',
          code: 'MOD 3',
          title: 'Informal Fallacies in Reasoning',
          prompt: `List the common informal fallacies mentioned in our GST 204 course material with everyday Nigerian examples.`,
        },
        {
          id: 'mod-4',
          code: 'MOD 4',
          title: 'African Philosophy & Critical Thinking',
          prompt: `What are the key arguments and perspectives in African Philosophy according to our study guide?`,
        },
      ];
    }

    // Generic fallback course modules
    return [
      {
        id: 'mod-1',
        code: 'MOD 1',
        title: 'Foundations & Core Principles',
        prompt: `Summarize the foundational definitions and core principles introduced in this material.`,
      },
      {
        id: 'mod-2',
        code: 'MOD 2',
        title: 'Key Concepts & Theories',
        prompt: `Explain the most critical theories and formulas discussed in these notes.`,
      },
      {
        id: 'mod-3',
        code: 'MOD 3',
        title: 'Exam Focus & Common Pitfalls',
        prompt: `What are the highest-yield exam topics and common student pitfalls in this course?`,
      },
      {
        id: 'mod-4',
        code: 'MOD 4',
        title: 'Practice Question Breakdown',
        prompt: `Give me a realistic university exam question from this material and explain the solution step by step.`,
      },
    ];
  }, [courseCode, sessionTitle]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="drawer-backdrop"
          onClick={onClose}
          aria-label="Close sources drawer"
        />
      )}

      <aside className={`study-room-drawer ${isOpen ? 'drawer-open' : 'drawer-closed'}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-eyebrow">COURSE WORKSPACE</span>
            <div className="drawer-course-tag">
              <span className="course-code-pill">{courseCode}</span>
              <h3 title={sessionTitle}>{sessionTitle || 'Study Session'}</h3>
            </div>
          </div>
          <div className="drawer-header-actions">
            <button
              type="button"
              className="drawer-icon-btn mobile-only"
              onClick={onClose}
              title="Close drawer"
              aria-label="Close drawer"
            >
              <X size={16} />
            </button>
            <button
              type="button"
              className="drawer-icon-btn desktop-only"
              onClick={onToggleCollapse}
              title="Collapse drawer"
              aria-label="Collapse drawer"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="drawer-tabs">
          <button
            type="button"
            className={`drawer-tab-btn ${activeTab === 'sources' ? 'drawer-tab-active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            <BookOpen size={14} />
            <span>Course Sources</span>
          </button>
          <button
            type="button"
            className={`drawer-tab-btn ${activeTab === 'history' ? 'drawer-tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <MessageSquare size={14} />
            <span>Chat History</span>
            {sessions.length > 0 && (
              <span className="drawer-tab-badge">{sessions.length}</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="drawer-body">
          {activeTab === 'sources' ? (
            <div className="drawer-sources-pane">
              {/* Active Materials Section */}
              <div className="drawer-section">
                <div className="drawer-section-header">
                  <span className="drawer-section-title">ACTIVE COURSE NOTES</span>
                  {displayMaterials.length > 0 && (
                    <button
                      type="button"
                      className="drawer-sub-action"
                      onClick={onOpenSourcesModal}
                    >
                      View citations
                    </button>
                  )}
                </div>

                {displayMaterials.length > 0 ? (
                  <div className="drawer-materials-list">
                    {displayMaterials.map((row, index) => {
                      const material = (row.material || row) as DataObject;
                      const title = String(
                        material.fileName ||
                          material.filename ||
                          material.title ||
                          `${courseCode} Course Material.pdf`,
                      );
                      return (
                        <div
                          className="drawer-material-card"
                          key={String(material.id || index)}
                        >
                          <div className="material-card-icon">
                            <FileText size={16} />
                          </div>
                          <div className="material-card-info">
                            <b title={title}>{title}</b>
                            <div className="material-card-meta">
                              <span className="grounded-status">
                                <CheckCircle2 size={11} className="text-emerald-500 inline mr-1" />
                                Grounded in AI
                              </span>
                              <span className="meta-dot">·</span>
                              <span>PDF</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="drawer-empty-placeholder">
                    <FileText size={22} className="empty-placeholder-icon" />
                    <b>No notes attached yet</b>
                    <p>
                      Add a course PDF like <code>{courseCode}</code> so your AI tutor can reference exact slides & pages.
                    </p>
                    <Link
                      to="/materials/upload"
                      className="button button-outline drawer-empty-btn"
                    >
                      <Plus size={13} /> Upload notes
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Module Jump Links */}
              <div className="drawer-section">
                <div className="drawer-section-header">
                  <span className="drawer-section-title">QUICK MODULE JUMP LINKS</span>
                  <span className="drawer-section-hint">Click to ask</span>
                </div>

                <div className="module-jump-list">
                  {moduleJumpLinks.map((mod) => (
                    <button
                      key={mod.id}
                      type="button"
                      className="module-jump-item"
                      onClick={() => onSelectModulePrompt(mod.prompt)}
                      title={`Ask tutor: ${mod.prompt}`}
                    >
                      <span className="module-pill">{mod.code}</span>
                      <div className="module-details">
                        <b>{mod.title}</b>
                        <small className="module-prompt-preview">{mod.prompt}</small>
                      </div>
                      <ChevronRight size={13} className="module-chevron" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat History Tab */
            <div className="drawer-history-pane">
              <div className="drawer-history-header">
                <span className="drawer-section-title">PAST STUDY THREADS</span>
                <Link to="/study-room" className="new-thread-link">
                  <Plus size={13} /> New session
                </Link>
              </div>

              {sessions.length > 0 ? (
                <div className="drawer-sessions-list">
                  {sessions.map((item) => {
                    const isCurrent = String(item.id) === sessionId;
                    const sessionItemTitle = String(
                      item.title || `${courseCode} Study session`,
                    );
                    const dateStr = item.updatedAt
                      ? new Date(String(item.updatedAt)).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recent';

                    return (
                      <Link
                        key={String(item.id)}
                        to={`/study-room/${item.id}`}
                        onClick={onClose}
                        className={`drawer-session-item ${
                          isCurrent ? 'drawer-session-active' : ''
                        }`}
                      >
                        <div className="drawer-session-icon">
                          <MessageSquare size={14} />
                        </div>
                        <div className="drawer-session-content">
                          <b title={sessionItemTitle}>{sessionItemTitle}</b>
                          <div className="drawer-session-meta">
                            <span>{dateStr}</span>
                            {isCurrent && (
                              <span className="active-thread-tag">Active</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={13} className="session-chevron" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="drawer-empty-placeholder">
                  <MessageSquare size={22} className="empty-placeholder-icon" />
                  <b>No past threads yet</b>
                  <p>Your previous discussions with your AI tutor will be saved here.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer: Warm Nigerian Senior Coursemate Tip */}
        <div className="drawer-footer">
          <div className="drawer-tip-card">
            <div className="tip-card-header">
              <Sparkles size={13} className="tip-sparkle-icon" />
              <b>Naija Coursemate Tip</b>
            </div>
            <p>
              Ask in English or Nigerian Pidgin! Your tutor breaks down tough exam
              theorems with everyday analogies.
            </p>
          </div>
          <Link to="/study-room" className="button button-outline drawer-new-btn">
            <Plus size={14} /> Start new session
          </Link>
        </div>
      </aside>
    </>
  );
}
