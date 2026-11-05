import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, FileText, Headphones,
  MessageCircle, Mic, Plus, Send, Sparkles, Upload, X,
} from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import type { Course, DataObject, Material, StudyMessage } from '../../../types';
import { getPath, list, useApiQuery } from '../../../hooks/useApiQuery';
import { EmptyState, LoadingLine, Modal, PageTitle, QueryNotice } from '../../../components/common';
import { MarkdownContent } from '../../../components/common/MarkdownContent';

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

export function StudyRoomPage() {
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
  const [selectedIds, setSelectedIds] = useState<string[]>(
    params.get('materialId') ? [params.get('materialId')!] : [],
  );
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
  const filteredMaterials = materials.filter(
    (material) =>
      !courseId ||
      getPath(material, 'courseId') === courseId ||
      getPath(material, 'course.id') === courseId,
  );
  const streamController = useRef<AbortController | null>(null);
  const recognition = useRef<RecognitionController | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamText]);

  async function createSession(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!selectedIds.length) {
      setError('Select at least one material so your study buddy knows what you’re learning.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/study-sessions', {
        courseId: courseId || undefined,
        materialIds: selectedIds,
        title: sessionTitle || undefined,
      });
      const created = unwrap<DataObject>(data);
      await queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      navigate(`/study-room/${created.id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
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
      const response = await fetch(
        `${api.defaults.baseURL}/study-sessions/${id}/messages/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${useAuth.getState().accessToken}`,
          },
          body: JSON.stringify({ content: text, inputMode: 'TEXT' }),
          signal: controller.signal,
        },
      );
      if (!response.ok || !response.body) {
        throw new Error(`Streaming unavailable (${response.status}).`);
      }
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
          const parsed = JSON.parse(line.slice(5).trim()) as {
            type: string;
            data: unknown;
          };
          if (parsed.type === 'sources' && Array.isArray(parsed.data)) {
            setSources(parsed.data);
          }
          if (parsed.type === 'chunk' && typeof parsed.data === 'string') {
            completeText += parsed.data;
            setStreamText(completeText);
          }
          if (parsed.type === 'error') setError(String(parsed.data));
          if (parsed.type === 'done') {
            const final = parsed.data as StudyMessage;
            setOptimisticMessages((current) => [
              ...current,
              { ...final, role: 'ASSISTANT', content: completeText || final.content },
            ]);
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
          const { data } = await api.post(`/study-sessions/${id}/messages`, {
            content: text,
            inputMode: 'TEXT',
          });
          const result = unwrap<{
            assistantMessage?: StudyMessage;
            userMessage?: StudyMessage;
          }>(data);
          setOptimisticMessages((current) => [
            ...current,
            result.assistantMessage || {
              role: 'ASSISTANT',
              content: String(getPath(result, 'assistantMessage.content', '')),
            },
          ]);
          await queryClient.invalidateQueries({ queryKey: ['study-session', id] });
        } catch (fallbackError) {
          setError(getErrorMessage(fallbackError));
        }
      } else setError(getErrorMessage(requestError));
      setOptimisticMessages([]);
      setStreamText('');
    } finally {
      setBusy(false);
      streamController.current = null;
    }
  }

  function speak(content: string) {
    if (!('speechSynthesis' in window)) {
      setError('Read aloud is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      content
        .replace(/[#*_`>[]()]/g, '')
        .replace(/\p{Extended_Pictographic}/gu, ''),
    );
    utterance.lang = 'en-NG';
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((candidate) =>
        candidate.lang.toLowerCase().startsWith('en-ng'),
      ) ||
      voices.find((candidate) => candidate.lang.toLowerCase().startsWith('en'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  function dictate() {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const SpeechInput =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechInput) {
      setError('Speech input is not supported in this browser.');
      return;
    }
    const input = new SpeechInput();
    recognition.current = input;
    input.lang = 'en-NG';
    input.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript)
        setPrompt((current) => `${current}${current ? ' ' : ''}${transcript}`);
    };
    input.onerror = () =>
      setError('Could not hear that clearly. Please try again or type your question.');
    input.onend = () => setListening(false);
    setListening(true);
    input.start();
  }

  if (!id) {
    return (
      <div>
        <PageTitle
          eyebrow="YOUR AI STUDY BUDDY"
          title="Study room"
          subtitle="A friendly space to ask questions about the materials you’re studying."
        />
        <div className="study-setup-layout">
          <form className="study-setup-card" onSubmit={createSession}>
            <div className="study-setup-heading">
              <span className="setup-sparkle">
                <Sparkles size={20} />
              </span>
              <div>
                <h2>Start a study session</h2>
                <p>Choose your notes so answers stay grounded in what you’re learning.</p>
              </div>
            </div>
            {error && <div className="form-alert">{error}</div>}
            <label className="form-field">
              <span>
                Course <small>Optional</small>
              </span>
              <select
                className="select-input"
                value={courseId}
                onChange={(event) => {
                  setCourseId(event.target.value);
                  setSelectedIds([]);
                }}
              >
                <option value="">All my materials</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>
                Give your session a name <small>Optional</small>
              </span>
              <input
                value={sessionTitle}
                onChange={(event) => setSessionTitle(event.target.value)}
                placeholder="e.g. Reviewing cell biology"
                maxLength={120}
              />
            </label>
            <div className="material-picker-heading">
              <span className="form-label">Choose study materials</span>
              <span>{selectedIds.length} selected · select up to 10</span>
            </div>
            {materialsQuery.isLoading ? (
              <LoadingLine />
            ) : filteredMaterials.length ? (
              <div className="material-picker">
                {filteredMaterials.map((material) => {
                  const selected = selectedIds.includes(material.id);
                  const title = String(
                    material.fileName ||
                      material.filename ||
                      material.title ||
                      'Untitled material',
                  );
                  return (
                    <button
                      type="button"
                      className={`material-picker-item ${
                        selected ? 'material-picker-selected' : ''
                      }`}
                      key={material.id}
                      onClick={() =>
                        setSelectedIds((current) =>
                          selected
                            ? current.filter((value) => value !== material.id)
                            : current.length < 10
                            ? [...current, material.id]
                            : current,
                        )
                      }
                    >
                      <span className="picker-file">
                        <FileText size={17} />
                      </span>
                      <span>
                        <b>{title}</b>
                        <small>
                          {String(getPath(material, 'course.title', 'No course linked'))}
                        </small>
                      </span>
                      <span className="picker-check">
                        {selected && <Check size={14} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="Upload notes to get started"
                detail="Your study buddy needs at least one material to answer questions."
                action={
                  <Link className="button button-outline" to="/materials/upload">
                    <Upload size={15} /> Upload material
                  </Link>
                }
              />
            )}
            <button
              className="button button-primary create-session-button"
              disabled={busy || !selectedIds.length}
            >
              {busy ? 'Setting up…' : 'Start study session'}
              <ArrowRight size={16} />
            </button>
          </form>

          <aside className="study-session-history">
            <span className="eyebrow">RECENT SESSIONS</span>
            <h3>Pick up a conversation</h3>
            {sessionsQuery.error && <QueryNotice error={sessionsQuery.error} />}
            {sessions.map((item) => (
              <Link
                className="session-history-item"
                to={`/study-room/${item.id}`}
                key={String(item.id)}
              >
                <span>
                  <MessageCircle size={16} />
                </span>
                <div>
                  <b>{String(item.title || 'Study session')}</b>
                  <small>
                    {item.updatedAt
                      ? new Date(String(item.updatedAt)).toLocaleDateString()
                      : 'Open conversation'}
                  </small>
                </div>
                <ChevronRight size={15} />
              </Link>
            ))}
            {!sessionsQuery.isLoading && !sessions.length && (
              <p className="muted-copy">Your recent study sessions will appear here.</p>
            )}
          </aside>
        </div>
      </div>
    );
  }

  const history = list<StudyMessage>(session.messages);
  const visibleMessages = [...history, ...optimisticMessages];

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-heading">
          <Link to="/study-room" className="back-link">
            <ArrowLeft size={14} /> All sessions
          </Link>
          <span className="eyebrow">GROUNDED IN YOUR NOTES</span>
          <h3>{String(session.title || 'Study session')}</h3>
        </div>
        <div className="chat-grounded-label">
          <span className="grounded-dot" /> ACTIVE MATERIALS
        </div>
        {sessionMaterials.map((row, index) => {
          const material = (row.material || row) as DataObject;
          return (
            <div className="grounded-material" key={String(material.id || index)}>
              <FileText size={15} />
              <span>
                {String(
                  material.fileName ||
                    material.filename ||
                    material.title ||
                    'Untitled material',
                )}
              </span>
            </div>
          );
        })}
        <div className="chat-sidebar-tip">
          <span>✦</span>
          <b>Need another angle?</b>
          <p>
            Ask in English or Nigerian Pidgin. Your buddy is here to help you
            understand.
          </p>
        </div>
        <Link className="button button-outline new-session-button" to="/study-room">
          <Plus size={15} /> New session
        </Link>
      </aside>

      <section className="chat-main">
        <header className="chat-topbar">
          <div>
            <span className="online-indicator" />
            <b>Study Room</b>
            <span className="chat-topbar-divider">·</span>
            <small>Grounded in your notes</small>
          </div>
          <button
            className="icon-button"
            onClick={() => setShowSources(true)}
            aria-label="View sources"
          >
            <FileText size={17} />
          </button>
        </header>

        <div className="chat-messages">
          {sessionQuery.isLoading ? (
            <LoadingLine />
          ) : !visibleMessages.length ? (
            <div className="chat-welcome">
              <span className="chat-welcome-icon">
                <Sparkles size={23} />
              </span>
              <span className="eyebrow">A FRIENDLY PLACE TO GET UNSTUCK</span>
              <h2>
                What would you like
                <br />
                to understand?
              </h2>
              <p>
                Your study buddy uses the materials in this session to give you
                thoughtful, grounded answers.
              </p>
            </div>
          ) : (
            visibleMessages.map((message, index) => (
              <div
                key={message.id || `${message.role}-${index}`}
                className={`chat-message ${
                  String(message.role).toLowerCase() === 'user'
                    ? 'chat-message-user'
                    : 'chat-message-ai'
                }`}
              >
                <span className="message-avatar">
                  {String(message.role).toLowerCase() === 'user' ? (
                    useAuth.getState().user?.name?.slice(0, 1) || 'U'
                  ) : (
                    <Sparkles size={15} />
                  )}
                </span>
                <div className="message-body">
                  <span className="message-name">
                    {String(message.role).toLowerCase() === 'user'
                      ? 'You'
                      : 'SlotStudy Tutor'}
                  </span>
                  <div className="markdown-content">
                    <MarkdownContent>{String(message.content || '')}</MarkdownContent>
                  </div>
                  {String(message.role).toLowerCase() !== 'user' && message.content && (
                    <button
                      className="read-aloud-button"
                      onClick={() => speak(String(message.content))}
                    >
                      <Headphones size={14} /> Read aloud
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {busy && streamText && (
            <div className="chat-message chat-message-ai">
              <span className="message-avatar">
                <Sparkles size={15} />
              </span>
              <div className="message-body">
                <span className="message-name">Study buddy</span>
                <div className="markdown-content">
                  <MarkdownContent>{streamText}</MarkdownContent>
                  <span className="stream-cursor" />
                </div>
              </div>
            </div>
          )}
          {busy && !streamText && (
            <div className="typing-indicator">
              <span />
              <span />
              <span /> Thinking through your notes…
            </div>
          )}
          {error && <div className="chat-error">{error}</div>}
          <div ref={chatEnd} />
        </div>

        <div className="chat-composer-area">
          <div className="prompt-chips">
            {[
              [
                '🇳🇬 Explain in Pidgin',
                'Abeg break down this concept for me in Nigerian Pidgin!',
              ],
              [
                '💡 Naija analogy',
                'Give me a relatable everyday Nigerian analogy for this topic.',
              ],
              [
                '🎯 Quiz me',
                'Test my brain with one quick exam question from this material!',
              ],
              [
                '📝 Key takeaways',
                'What are the top exam takeaways I must remember from this material?',
              ],
            ].map(([label, text]) => (
              <button
                key={label}
                onClick={() => sendMessage(text)}
                disabled={busy}
              >
                {label}
              </button>
            ))}
          </div>

          <form
            className="chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask a question about your study materials…"
              rows={1}
            />
            <div className="composer-bottom">
              <span>
                {listening
                  ? 'Listening… speak your question'
                  : 'Answers are grounded in your selected notes'}
              </span>
              <div className="composer-actions">
                {!busy && (
                  <button
                    type="button"
                    className={`mic-button ${listening ? 'mic-button-active' : ''}`}
                    onClick={dictate}
                    aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                  >
                    <Mic size={15} />
                  </button>
                )}
                {busy ? (
                  <button
                    type="button"
                    className="button button-stop"
                    onClick={() => streamController.current?.abort()}
                  >
                    <X size={15} /> Stop generating
                  </button>
                ) : (
                  <button
                    className="send-button"
                    disabled={!prompt.trim()}
                    aria-label="Send message"
                  >
                    <Send size={17} />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {showSources && (
        <Modal title="Sources for this session" onClose={() => setShowSources(false)}>
          {sources.length ? (
            <div className="source-list">
              {sources.map((source, index) => {
                const filename = getPath(
                  source,
                  'fileName',
                  getPath(source, 'filename'),
                );
                const excerpt = getPath(source, 'excerpt', getPath(source, 'content'));
                return (
                  <div className="source-item" key={index}>
                    <span className="source-badge">Source {index + 1}</span>
                    <b>
                      {filename ? String(filename) : 'Filename unavailable'}
                      {getPath(source, 'pageNumber')
                        ? ` · Page ${String(getPath(source, 'pageNumber'))}`
                        : ''}
                    </b>
                    <p>{excerpt ? String(excerpt) : 'Excerpt unavailable.'}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted-copy">
              Source details appear after your study buddy references a note.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
