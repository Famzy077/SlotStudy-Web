import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Users,
  UserCheck,
  MessageSquare,
  Search,
  School,
  BookOpen,
  UserPlus,
  Clock,
  Check,
  CheckCheck,
  CheckCircle2,
  Send,
  MoreVertical,
  AlertTriangle,
  UserX,
  ShieldAlert,
  Gift,
  Settings2,
  Copy,
  X,
  RotateCcw,
  ArrowLeft,
  Smile,
  Mic,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import { StudentProfileModal } from './StudentProfileModal';
import { useSocket } from '../../../hooks/useSocket';
import { useClickOutside } from '../../../hooks/useClickOutside';
import api, { getErrorMessage } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import {
  studyBuddyService,
  type StudyBuddyStudent,
  type ConversationItem,
  type ChatMessage,
  type FriendRequestItem,
  type ReferralInfo,
  type StudyBuddySettings,
} from '../../../lib/studyBuddy';

const POPULAR_SCHOOLS = [
  'All Schools',
  'National Open University (NOUN)',
  'Miva Open University',
  'University of Lagos (UNILAG)',
  'Ahmadu Bello University (ABU)',
];
const CHAT_EMOJIS = ['😀', '😂', '😊', '😍', '👍', '🙏', '🎉', '❤️'];

function getBlockedStorageKey(): string {
  const userId = useAuth.getState().user?.id;
  return userId ? `slotstudy-blocked-users-${userId}` : 'slotstudy-blocked-users';
}

function readBlockedCache(): StudyBuddyStudent[] {
  try {
    const raw = localStorage.getItem(getBlockedStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBlockedCache(users: StudyBuddyStudent[]) {
  try {
    localStorage.setItem(getBlockedStorageKey(), JSON.stringify(users));
  } catch {
    // Ignore storage quota errors
  }
}

function formatAudioDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function parseVoiceNoteText(text: string): { duration: number; url: string } | null {
  const match = text.match(/^\[VOICE_NOTE:(\d+)\](.+)$/s);
  if (!match) return null;
  const duration = Number(match[1]) || 1;
  const rawUrl = match[2].trim();
  if (rawUrl.startsWith('local://')) {
    const key = rawUrl.slice('local://'.length);
    try {
      const stored = localStorage.getItem(key);
      if (stored) return { duration, url: stored };
    } catch {
      // Ignore storage error
    }
  }
  return { duration, url: rawUrl };
}

function formatLastMessagePreview(lastMessage: string | null): string {
  if (!lastMessage) return 'Connected. Say hello!';
  if (lastMessage.startsWith('[VOICE_NOTE:')) return '🎤 Voice note';
  return lastMessage;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to encode audio'));
    };
    reader.onerror = () => reject(new Error('Failed to read audio'));
    reader.readAsDataURL(blob);
  });
}

const WAVE_BARS = [35, 65, 90, 50, 80, 100, 60, 45, 85, 70, 95, 55, 75, 40, 65, 50];

function VoiceNotePlayer({
  url,
  duration,
  isMine,
}: {
  url: string;
  duration: number;
  isMine?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(duration);
  const [playError, setPlayError] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [url]);

  const togglePlay = async () => {
    if (url.startsWith('local://')) {
      setPlayError(true);
      return;
    }

    if (!audioRef.current) {
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setActualDuration(audio.duration);
        }
      };
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      audio.onended = () => {
        setPlaying(false);
        setCurrentTime(0);
      };
      audio.onerror = () => {
        setPlaying(false);
        setPlayError(true);
      };
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        setPlayError(false);
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
        setPlayError(true);
      }
    }
  };

  const total = actualDuration > 0 ? actualDuration : duration || 1;
  const progress = Math.min(1, currentTime / total);

  return (
    <div className="flex min-w-[200px] items-center gap-2.5 py-0.5">
      <button
        type="button"
        onClick={() => void togglePlay()}
        aria-label={playing ? 'Pause voice note' : 'Play voice note'}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
          isMine
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex h-5 items-center gap-[3px]" aria-hidden="true">
          {WAVE_BARS.map((height, idx) => {
            const active = idx / WAVE_BARS.length <= progress;
            return (
              <span
                key={idx}
                className={`w-[3px] rounded-full transition-colors ${
                  isMine
                    ? active
                      ? 'bg-white'
                      : 'bg-white/40'
                    : active
                      ? 'bg-indigo-600 dark:bg-indigo-400'
                      : 'bg-slate-300 dark:bg-slate-600'
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        <div
          className={`flex items-center justify-between text-[10px] font-mono ${
            isMine ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>{playError ? 'Audio unavailable' : formatAudioDuration(playing ? currentTime : total)}</span>
        </div>
      </div>
    </div>
  );
}

export function StudyBuddyPage() {
  const {
    isUserOnline,
    isUserTyping,
    sendMessage,
    markConversationRead,
    startTyping,
    stopTyping,
    addMessageListener,
    addNotificationListener,
  } = useSocket();

  const [activeTab, setActiveTab] = useState<'chats' | 'discover' | 'requests'>('chats');

  // Discover state
  const [students, setStudents] = useState<StudyBuddyStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('All Schools');
  const [discoverStatusFilter, setDiscoverStatusFilter] = useState<'all' | 'pending' | 'available'>('all');
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [pendingFriendIds, setPendingFriendIds] = useState<Set<string>>(new Set());
  const [actioningUserIds, setActioningUserIds] = useState<Set<string>>(new Set());

  // Requests state
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<StudyBuddyStudent[]>(() => readBlockedCache());
  const [requestSegment, setRequestSegment] = useState<'all' | 'incoming' | 'outgoing' | 'blocked'>('all');
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Chats state
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<StudyBuddyStudent | null>(null);
  const [alsoBlockOnReport, setAlsoBlockOnReport] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [blockConfirmTarget, setBlockConfirmTarget] = useState<StudyBuddyStudent | null>(null);
  const [unfriendConfirmTarget, setUnfriendConfirmTarget] = useState<StudyBuddyStudent | null>(null);
  const [confirmActionLoading, setConfirmActionLoading] = useState(false);
  const [confirmActionError, setConfirmActionError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [cancelConfirmTarget, setCancelConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [declineConfirmTarget, setDeclineConfirmTarget] = useState<FriendRequestItem | null>(null);
  const [profileTarget, setProfileTarget] = useState<StudyBuddyStudent | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [settings, setSettings] = useState<StudyBuddySettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const userClosedChatRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingDurationRef = useRef(0);
  const recordingDiscardRef = useRef(false);
  const pendingVoiceBlobsRef = useRef<
    Map<string, { blob: Blob; duration: number; previewUrl: string }>
  >(new Map());

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useClickOutside(menuRef, closeMenu, menuOpen);

  const handleCloseChat = useCallback(() => {
    userClosedChatRef.current = true;
    setMenuOpen(false);
    setEmojiPickerOpen(false);
    setActiveConversation(null);
    setMessages([]);
  }, []);

  const handleSelectConversation = useCallback((conv: ConversationItem) => {
    userClosedChatRef.current = false;
    setMenuOpen(false);
    setEmojiPickerOpen(false);
    setActiveConversation(conv);
  }, []);

  const insertChatEmoji = (emoji: string) => {
    const input = messageInputRef.current;
    const start = input?.selectionStart ?? inputText.length;
    const end = input?.selectionEnd ?? start;
    const nextText = `${inputText.slice(0, start)}${emoji}${inputText.slice(end)}`;
    setInputText(nextText);
    setEmojiPickerOpen(false);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  // ──────────────────────────────────────────────
  // Fetch Discover
  // ──────────────────────────────────────────────
  const fetchDiscover = useCallback(async () => {
    try {
      setLoadingDiscover(true);
      const schoolParam = selectedSchool === 'All Schools' ? 'all' : selectedSchool;
      const [data, requestsData] = await Promise.all([
        studyBuddyService.discover({
          school: schoolParam,
          q: searchQuery.trim() || undefined,
          limit: 30,
        }),
        studyBuddyService.getRequests().catch(() => null),
      ]);

      const outgoingMap = new Map<string, { friendshipId: string; user: StudyBuddyStudent }>();
      const incomingMap = new Map<string, { friendshipId: string; user: StudyBuddyStudent }>();

      if (requestsData) {
        setIncomingRequests(requestsData.incoming);
        setOutgoingRequests(requestsData.outgoing);
        for (const req of requestsData.outgoing || []) {
          outgoingMap.set(req.user.id, { friendshipId: req.id, user: req.user });
        }
        for (const req of requestsData.incoming || []) {
          incomingMap.set(req.user.id, { friendshipId: req.id, user: req.user });
        }
      }

      const enriched = data.users.map((u) => {
        if (outgoingMap.has(u.id)) {
          return {
            ...u,
            friendshipStatus: 'PENDING_SENT' as const,
            friendshipId: outgoingMap.get(u.id)!.friendshipId,
          };
        }
        if (incomingMap.has(u.id)) {
          return {
            ...u,
            friendshipStatus: 'PENDING_RECEIVED' as const,
            friendshipId: incomingMap.get(u.id)!.friendshipId,
          };
        }
        return u;
      });

      const existingIds = new Set(enriched.map((u) => u.id));
      const missingPending: StudyBuddyStudent[] = [];
      for (const [uid, entry] of outgoingMap.entries()) {
        if (!existingIds.has(uid)) {
          const matchesQuery =
            !searchQuery.trim() ||
            entry.user.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            (entry.user.bio || '').toLowerCase().includes(searchQuery.trim().toLowerCase());
          if (matchesQuery) {
            missingPending.push({
              ...entry.user,
              friendshipStatus: 'PENDING_SENT',
              friendshipId: entry.friendshipId,
            });
          }
        }
      }

      setStudents([...missingPending, ...enriched]);
    } catch (err) {
      console.error('Discover error:', err);
    } finally {
      setLoadingDiscover(false);
    }
  }, [selectedSchool, searchQuery]);

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchDiscover();
    }
  }, [activeTab, fetchDiscover]);

  // ──────────────────────────────────────────────
  // Fetch Requests & Blocked Users
  // ──────────────────────────────────────────────
  const fetchBlockedUsers = useCallback(async () => {
    try {
      const data = await studyBuddyService.getBlockedUsers();
      if (Array.isArray(data)) {
        const users = data.map((item) => item.user).filter(Boolean);
        setBlockedUsers(users);
        writeBlockedCache(users);
      }
    } catch {
      // If backend doesn't expose GET /friends/blocked yet, keep existing/cached list
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const data = await studyBuddyService.getRequests();
      setIncomingRequests(data.incoming);
      setOutgoingRequests(data.outgoing);
      if (Array.isArray(data.blocked)) {
        const users = data.blocked.map((item) => item.user).filter(Boolean);
        setBlockedUsers(users);
        writeBlockedCache(users);
      } else {
        void fetchBlockedUsers();
      }
    } catch (err) {
      console.error('Requests error:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [fetchBlockedUsers]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab, fetchRequests]);

  // ──────────────────────────────────────────────
  // Fetch Conversations
  // ──────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingChats(true);
      const data = await studyBuddyService.getConversations();
      setConversations(data);
      setActiveConversation((current) => {
        if (current) {
          const updatedMatch = data.find((c) => c.id === current.id);
          if (updatedMatch) return updatedMatch;
        }
        if (userClosedChatRef.current) return null;
        return data.length > 0 && window.innerWidth >= 768 ? data[0] : null;
      });
    } catch (err) {
      console.error('Conversations error:', err);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'chats') {
      fetchConversations();
    }
  }, [activeTab, fetchConversations]);

  const activeConversationId = activeConversation?.id;

  useEffect(() => {
    setMenuOpen(false);
    setEmojiPickerOpen(false);
    setRecordingError(null);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      recordingDiscardRef.current = true;
      mediaRecorderRef.current.stop();
    }
  }, [activeConversationId]);

  useEffect(() => {
    const pendingBlobs = pendingVoiceBlobsRef.current;
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        recordingDiscardRef.current = true;
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      pendingBlobs.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      pendingBlobs.clear();
    };
  }, []);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversationId) return;

    let cancelled = false;
    async function load() {
      try {
        setLoadingMessages(true);
        const data = await studyBuddyService.getMessages(activeConversationId!, undefined, 50);
        if (!cancelled) {
          const ordered = [...data.messages].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          setMessages(ordered);
          await studyBuddyService.markConversationRead(activeConversationId!);
          markConversationRead(activeConversationId!);
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c)),
          );
          window.dispatchEvent(new Event('slotstudy-buddy-updated'));
        }
      } catch (err) {
        console.error('Messages error:', err);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeConversationId, markConversationRead]);

  // Real-time live listeners
  useEffect(() => {
    const unsubMsg = addMessageListener((msg) => {
      // If it belongs to currently active conversation
      if (activeConversation && msg.conversationId === activeConversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          const optimisticIndex = prev.findIndex(
            (m) => m.isOutgoing && m.status === 'sending' && m.text === msg.text,
          );
          if (optimisticIndex !== -1) {
            return prev.map((m, index) =>
              index === optimisticIndex
                ? {
                    ...m,
                    id: msg.id,
                    senderId: msg.senderId,
                    readAt: msg.readAt,
                    createdAt: msg.createdAt,
                    status: 'sent',
                    error: undefined,
                  }
                : m,
            );
          }
          return [
            ...prev,
            {
              id: msg.id,
              conversationId: msg.conversationId,
              senderId: msg.senderId,
              text: msg.text,
              readAt: msg.readAt,
              createdAt: msg.createdAt,
              isOutgoing: msg.senderId !== activeConversation.otherUser.id,
              status: 'sent',
            },
          ];
        });
        void studyBuddyService.markConversationRead(activeConversation.id).then(() => {
          window.dispatchEvent(new Event('slotstudy-buddy-updated'));
        });
        markConversationRead(activeConversation.id);
      }

      // Update conversations list preview
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === msg.conversationId);
        if (index !== -1) {
          const updated = [...prev];
          const conv = { ...updated[index] };
          conv.lastMessage = msg.text;
          conv.lastMessageAt = msg.createdAt;
          if (msg.senderId === conv.otherUser.id && activeConversation?.id !== conv.id) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }
          updated.splice(index, 1);
          return [conv, ...updated];
        }
        return prev;
      });
    });

    const unsubNotif = addNotificationListener((notif) => {
      if (notif.type.includes('friend')) {
        fetchRequests();
      }
    });

    return () => {
      unsubMsg();
      unsubNotif();
    };
  }, [activeConversation, addMessageListener, addNotificationListener, fetchRequests, markConversationRead]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ──────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────
  const handleSendFriendRequest = async (userId: string) => {
    try {
      setActioningUserIds((prev) => new Set(prev).add(userId));
      await studyBuddyService.sendFriendRequest(userId);
      setPendingFriendIds((prev) => new Set(prev).add(userId));
      setStudents((prev) =>
        prev.map((s) =>
          s.id === userId ? { ...s, friendshipStatus: 'PENDING_SENT' } : s,
        ),
      );
      fetchRequests();
    } catch (err) {
      console.warn('Friend request error:', err);
    } finally {
      setActioningUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleCancelFriendRequest = async (userId: string) => {
    try {
      setActioningUserIds((prev) => new Set(prev).add(userId));
      await studyBuddyService.unfriend(userId);
      setPendingFriendIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === userId ? { ...s, friendshipStatus: 'NONE', friendshipId: null } : s,
        ),
      );
      setOutgoingRequests((prev) => prev.filter((r) => r.user.id !== userId));
      setCancelConfirmTarget(null);
    } catch (err) {
      console.warn('Cancel request error:', err);
    } finally {
      setActioningUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await studyBuddyService.acceptFriendRequest(id);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
      fetchDiscover();
      userClosedChatRef.current = false;
      setActiveTab('chats');
      fetchConversations();
      window.dispatchEvent(new Event('slotstudy-buddy-updated'));
    } catch (err) {
      console.warn('Accept error:', err);
    }
  };

  const handleDeclineRequest = async (id: string): Promise<boolean> => {
    try {
      await studyBuddyService.declineFriendRequest(id);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
      fetchDiscover();
      window.dispatchEvent(new Event('slotstudy-buddy-updated'));
      return true;
    } catch (err) {
      console.warn('Decline error:', err);
      return false;
    }
  };

  const sendVoiceNoteMessage = useCallback(
    async (
      convId: string,
      recipientId: string,
      audioBlob: Blob,
      duration: number,
      previewUrl: string,
      existingTempId?: string,
    ) => {
      const tempId = existingTempId || `voice-${Date.now()}`;
      pendingVoiceBlobsRef.current.set(tempId, { blob: audioBlob, duration, previewUrl });
      const placeholderText = `[VOICE_NOTE:${duration}]${previewUrl}`;

      if (!existingTempId) {
        const optimistic: ChatMessage = {
          id: tempId,
          conversationId: convId,
          senderId: 'me',
          text: placeholderText,
          createdAt: new Date().toISOString(),
          isOutgoing: true,
          status: 'sending',
        };
        setMessages((prev) => [...prev, optimistic]);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, status: 'sending', error: undefined } : m,
          ),
        );
      }

      const finishVoiceSend = (saved: {
        id: string;
        text?: string;
        createdAt: string;
        readAt?: string | null;
      }) => {
        const finalText = saved.text || placeholderText;
        setMessages((prev) => {
          const alreadySynced = prev.some((m) => m.id === saved.id && m.id !== tempId);
          if (alreadySynced) return prev.filter((m) => m.id !== tempId);
          return prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: saved.id,
                  text: finalText,
                  createdAt: saved.createdAt,
                  readAt: saved.readAt ?? m.readAt,
                  status: 'sent',
                  error: undefined,
                }
              : m,
          );
        });
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === convId);
          if (index === -1) return prev;
          const updated = [...prev];
          const conv = {
            ...updated[index],
            lastMessage: finalText,
            lastMessageAt: saved.createdAt,
          };
          updated.splice(index, 1);
          return [conv, ...updated];
        });
        pendingVoiceBlobsRef.current.delete(tempId);
        URL.revokeObjectURL(previewUrl);
      };

      try {
        const saved = await studyBuddyService.sendVoiceNote(
          convId,
          recipientId,
          audioBlob,
          duration,
        );
        finishVoiceSend(saved);
      } catch (err) {
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status === 404 || status === 405) {
          try {
            const dataUrl = await blobToDataUrl(audioBlob);
            const storageKey = `slotstudy-vn-${Date.now()}`;
            localStorage.setItem(storageKey, dataUrl);
            const fallbackText = `[VOICE_NOTE:${duration}]local://${storageKey}`;
            const saved = await studyBuddyService.sendMessage(convId, recipientId, fallbackText);
            finishVoiceSend(saved);
            return;
          } catch {
            // Fall through to mark failed
          }
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, status: 'failed', error: getErrorMessage(err) }
              : m,
          ),
        );
      }
    },
    [],
  );

  const stopRecordingResources = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, []);

  const startVoiceRecording = async () => {
    if (!activeConversation || isRecording) return;
    setRecordingError(null);

    if (
      typeof MediaRecorder === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setRecordingError('Voice note recording is not supported in this browser.');
      return;
    }

    const convId = activeConversation.id;
    const recipientId = activeConversation.otherUser.id;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
      ];
      const mimeType = preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recordingDiscardRef.current = false;
      recordingDurationRef.current = 0;
      setRecordingDuration(0);
      setEmojiPickerOpen(false);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const shouldDiscard = recordingDiscardRef.current;
        const duration = Math.max(1, recordingDurationRef.current);
        const chunks = [...audioChunksRef.current];
        const recordedType = recorder.mimeType || mimeType || 'audio/webm';
        audioChunksRef.current = [];
        stopRecordingResources();

        if (shouldDiscard || chunks.length === 0) return;

        const audioBlob = new Blob(chunks, { type: recordedType });
        const previewUrl = URL.createObjectURL(audioBlob);
        void sendVoiceNoteMessage(convId, recipientId, audioBlob, duration, previewUrl);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);

      recordingTimerRef.current = setInterval(() => {
        recordingDurationRef.current += 1;
        setRecordingDuration(recordingDurationRef.current);
        if (recordingDurationRef.current >= 180) {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 1000);
    } catch {
      stopRecordingResources();
      setRecordingError('Microphone access is needed to record a voice note.');
    }
  };

  const cancelVoiceRecording = () => {
    recordingDiscardRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      stopRecordingResources();
    }
  };

  const stopAndSendVoiceRecording = () => {
    recordingDiscardRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      stopRecordingResources();
    }
  };

  const handleSendMessage = async (retryMsg?: ChatMessage) => {
    if (!activeConversation) return;
    if (retryMsg && pendingVoiceBlobsRef.current.has(retryMsg.id)) {
      const pending = pendingVoiceBlobsRef.current.get(retryMsg.id)!;
      void sendVoiceNoteMessage(
        activeConversation.id,
        activeConversation.otherUser.id,
        pending.blob,
        pending.duration,
        pending.previewUrl,
        retryMsg.id,
      );
      return;
    }
    const textToSend = retryMsg ? retryMsg.text : inputText.trim();
    if (!textToSend) return;

    if (!retryMsg) setInputText('');
    stopTyping(activeConversation.otherUser.id);

    const tempId = retryMsg ? retryMsg.id : `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      conversationId: activeConversation.id,
      senderId: 'me',
      text: textToSend,
      createdAt: new Date().toISOString(),
      isOutgoing: true,
      status: 'sending',
    };

    if (!retryMsg) {
      setMessages((prev) => [...prev, optimistic]);
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, status: 'sending', error: undefined }
            : m,
        ),
      );
    }

    const convId = activeConversation.id;
    const recipientId = activeConversation.otherUser.id;

    const finalizeSent = (saved: { id: string; createdAt: string; readAt?: string | null }) => {
      setMessages((prev) => {
        const alreadySyncedBySocket = prev.some((m) => m.id === saved.id && m.id !== tempId);
        if (alreadySyncedBySocket) {
          return prev.filter((m) => m.id !== tempId);
        }
        return prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: saved.id,
                createdAt: saved.createdAt,
                readAt: saved.readAt ?? m.readAt,
                status: 'sent',
                error: undefined,
              }
            : m,
        );
      });
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === convId);
        if (index === -1) return prev;
        const updated = [...prev];
        const conv = {
          ...updated[index],
          lastMessage: textToSend,
          lastMessageAt: saved.createdAt,
        };
        updated.splice(index, 1);
        return [conv, ...updated];
      });
    };

    try {
      const saved = await studyBuddyService.sendMessage(convId, recipientId, textToSend);
      finalizeSent(saved);
    } catch (httpErr) {
      const status = axios.isAxiosError(httpErr) ? httpErr.response?.status : undefined;
      if (status === 404 || status === 405) {
        // Fallback when backend REST message endpoint is unavailable
        try {
          await api.get('/conversations');
        } catch {
          // Ignore refresh probe error and let socket fallback try
        }
        try {
          const res = await sendMessage(recipientId, textToSend);
          if (res.success && res.data) {
            finalizeSent(res.data);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempId
                  ? { ...m, status: 'failed', error: res.error || 'Failed to send message.' }
                  : m,
              ),
            );
          }
        } catch {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { ...m, status: 'failed', error: 'Message could not be sent. Please retry.' }
                : m,
            ),
          );
        }
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, status: 'failed', error: getErrorMessage(httpErr) }
            : m,
        ),
      );
    }
  };

  const removeConversationForUser = useCallback(
    (targetUserId: string) => {
      const remaining = conversations.filter((c) => c.otherUser.id !== targetUserId);
      setConversations(remaining);
      setActiveConversation((current) => {
        if (current && current.otherUser.id !== targetUserId) {
          return current;
        }
        return remaining.length > 0 && window.innerWidth >= 768 ? remaining[0] : null;
      });
      if (activeConversation?.otherUser.id === targetUserId) {
        setMessages([]);
      }
    },
    [conversations, activeConversation],
  );

  const addBlockedUserToList = useCallback((student: StudyBuddyStudent) => {
    setBlockedUsers((prev) => {
      const next = [
        { ...student, friendshipStatus: 'BLOCKED' as const },
        ...prev.filter((u) => u.id !== student.id),
      ];
      writeBlockedCache(next);
      return next;
    });
  }, []);

  const handleUnblockUser = async (student: StudyBuddyStudent) => {
    if (actioningUserIds.has(student.id)) return;
    try {
      setActioningUserIds((prev) => new Set(prev).add(student.id));
      await studyBuddyService.unblockUser(student.id);
      setBlockedUsers((prev) => {
        const next = prev.filter((u) => u.id !== student.id);
        writeBlockedCache(next);
        return next;
      });
      setActionBanner({
        message: `${student.name} has been unblocked. You can reconnect in Discover.`,
        type: 'success',
      });
      void fetchDiscover();
      void fetchRequests();
    } catch (err) {
      setActionBanner({
        message: getErrorMessage(err),
        type: 'error',
      });
    } finally {
      setActioningUserIds((prev) => {
        const next = new Set(prev);
        next.delete(student.id);
        return next;
      });
    }
  };

  const handleConfirmBlockUser = async () => {
    if (!blockConfirmTarget || confirmActionLoading) return;
    const target = blockConfirmTarget;
    try {
      setConfirmActionLoading(true);
      setConfirmActionError(null);
      await studyBuddyService.blockUser(target.id);
      removeConversationForUser(target.id);
      addBlockedUserToList(target);
      setStudents((prev) => prev.filter((s) => s.id !== target.id));
      setIncomingRequests((prev) => prev.filter((r) => r.user.id !== target.id));
      setOutgoingRequests((prev) => prev.filter((r) => r.user.id !== target.id));
      setPendingFriendIds((prev) => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
      setBlockConfirmTarget(null);
      setActionBanner({
        message: `${target.name} has been blocked.`,
        type: 'success',
      });
      void fetchConversations();
      window.dispatchEvent(new Event('slotstudy-buddy-updated'));
    } catch (err) {
      setConfirmActionError(getErrorMessage(err));
    } finally {
      setConfirmActionLoading(false);
    }
  };

  const handleConfirmUnfriendUser = async () => {
    if (!unfriendConfirmTarget || confirmActionLoading) return;
    const target = unfriendConfirmTarget;
    try {
      setConfirmActionLoading(true);
      setConfirmActionError(null);
      await studyBuddyService.unfriend(target.id);
      removeConversationForUser(target.id);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === target.id ? { ...s, friendshipStatus: 'NONE', friendshipId: null } : s,
        ),
      );
      setPendingFriendIds((prev) => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
      setUnfriendConfirmTarget(null);
      setActionBanner({
        message: `${target.name} was removed from your study buddies.`,
        type: 'success',
      });
      void fetchConversations();
      window.dispatchEvent(new Event('slotstudy-buddy-updated'));
    } catch (err) {
      setConfirmActionError(getErrorMessage(err));
    } finally {
      setConfirmActionLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = reportTarget || activeConversation?.otherUser;
    if (!targetUser || submittingReport) return;

    const trimmedReason = reportReason.trim();
    if (trimmedReason.length < 3) {
      setReportError('Please provide at least 3 characters describing the issue.');
      return;
    }

    try {
      setSubmittingReport(true);
      setReportError(null);
      await studyBuddyService.createReport({
        reportedId: targetUser.id,
        reason: trimmedReason,
      });

      let blockedToo = false;
      if (alsoBlockOnReport) {
        await studyBuddyService.blockUser(targetUser.id);
        removeConversationForUser(targetUser.id);
        addBlockedUserToList(targetUser);
        setStudents((prev) => prev.filter((s) => s.id !== targetUser.id));
        setIncomingRequests((prev) => prev.filter((r) => r.user.id !== targetUser.id));
        setOutgoingRequests((prev) => prev.filter((r) => r.user.id !== targetUser.id));
        blockedToo = true;
        void fetchConversations();
      }

      setReportModalOpen(false);
      setReportTarget(null);
      setReportReason('');
      setAlsoBlockOnReport(false);
      setActionBanner({
        message: blockedToo
          ? `Report submitted and ${targetUser.name} has been blocked.`
          : 'Report submitted. Our safety team will review it.',
        type: 'success',
      });
    } catch (err) {
      setReportError(getErrorMessage(err));
    } finally {
      setSubmittingReport(false);
    }
  };

  const openInviteModal = async () => {
    setInviteModalOpen(true);
    try {
      const info = await studyBuddyService.getReferralInfo();
      setReferralInfo(info);
    } catch (err) {
      console.warn('Referral error:', err);
    }
  };

  const openSettingsModal = async () => {
    setSettingsModalOpen(true);
    void fetchBlockedUsers();
    try {
      const data = await studyBuddyService.getSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Settings error:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSavingSettings(true);
      await studyBuddyService.updateSettings({
        visible: settings.visible,
        bio: settings.bio || '',
        courses: settings.courses,
      });
      setSettingsModalOpen(false);
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="study-buddy-page mx-auto max-w-7xl py-6">
      {/* Top Banner & Header */}
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="min-w-0 md:min-w-[55%]">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            Study Buddy
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Find coursemates from NOUN, Miva, and other open distance universities. Connect & chat in real time.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2.5 md:w-auto md:min-w-[40%] md:flex-nowrap">
          <button
            onClick={openInviteModal}
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 md:flex-initial"
          >
            <Gift size={16} />
            <span>Invite Friend</span>
          </button>

          <button
            onClick={openSettingsModal}
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 md:flex-initial"
          >
            <Settings2 size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* 3 Main Navigation Tabs */}
      <div className="mb-6 flex w-full border-b border-slate-200 dark:border-slate-800">
        {(() => {
          const totalUnreadChats = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          return (
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 text-xs font-semibold transition sm:gap-2 sm:px-5 sm:text-sm ${
                activeTab === 'chats'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <MessageSquare size={16} className="shrink-0 sm:h-[17px] sm:w-[17px]" />
              <span className="sm:hidden">Chats</span>
              <span className="hidden sm:inline">Active Chats</span>
              {totalUnreadChats > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  {totalUnreadChats}
                </span>
              )}
            </button>
          );
        })()}

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 text-xs font-semibold transition sm:gap-2 sm:px-5 sm:text-sm ${
            activeTab === 'discover'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Users size={16} className="shrink-0 sm:h-[17px] sm:w-[17px]" />
          <span className="sm:hidden">Discover</span>
          <span className="hidden sm:inline">Discover Coursemates</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 text-xs font-semibold transition sm:gap-2 sm:px-5 sm:text-sm ${
            activeTab === 'requests'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <UserCheck size={16} className="shrink-0 sm:h-[17px] sm:w-[17px]" />
          <span>Requests</span>
          {incomingRequests.length + outgoingRequests.length > 0 && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
              {incomingRequests.length + outgoingRequests.length}
            </span>
          )}
        </button>
      </div>

      {actionBanner && (
        <div
          role={actionBanner.type === 'error' ? 'alert' : 'status'}
          className={`mb-5 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-sm ${
            actionBanner.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {actionBanner.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="truncate">{actionBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          TAB 1: DISCOVER
          ────────────────────────────────────────────── */}
      {activeTab === 'discover' && (() => {
        const pendingCount = students.filter(
          (s) =>
            s.friendshipStatus === 'PENDING_SENT' ||
            s.friendshipStatus === 'PENDING_RECEIVED' ||
            pendingFriendIds.has(s.id),
        ).length;
        const availableCount = students.length - pendingCount;
        const filteredStudents = students.filter((s) => {
          const isPending =
            s.friendshipStatus === 'PENDING_SENT' ||
            s.friendshipStatus === 'PENDING_RECEIVED' ||
            pendingFriendIds.has(s.id);
          if (discoverStatusFilter === 'pending') return isPending;
          if (discoverStatusFilter === 'available') return !isPending;
          return true;
        });

        return (
          <div className="space-y-5">
            {/* Filters Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
                  <input
                    type="text"
                    placeholder="Search by student name or bio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                  />
                </div>

                <div className="flex w-full min-w-0 items-center gap-2 md:w-auto">
                  <School size={16} className="text-slate-400" />
                  <select
                    aria-label="Filter by institution"
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 md:w-auto md:flex-initial"
                  >
                    {POPULAR_SCHOOLS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Status:
                </span>
                <button
                  onClick={() => setDiscoverStatusFilter('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    discoverStatusFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setDiscoverStatusFilter('pending')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    discoverStatusFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}
                >
                  <Clock size={12} />
                  <span>Pending ({pendingCount})</span>
                </button>
                <button
                  onClick={() => setDiscoverStatusFilter('available')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    discoverStatusFilter === 'available'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <UserPlus size={12} />
                  <span>Available ({availableCount})</span>
                </button>
              </div>
            </div>

            {/* Student Grid */}
            {loadingDiscover ? (
              <div className="py-20 text-center text-sm text-slate-500">
                Finding coursemates near you...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
                <Users size={36} className="mx-auto text-slate-400" />
                <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-100">
                  {discoverStatusFilter === 'pending'
                    ? 'No pending friend requests'
                    : 'No coursemates found'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {discoverStatusFilter === 'pending'
                    ? "You haven't sent any pending friend requests yet. Switch to All to find study buddies!"
                    : 'Try selecting "All Schools" or invite your classmates with your referral link!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student) => {
                  const isOnline = isUserOnline(student.id);
                  const isPendingSent =
                    student.friendshipStatus === 'PENDING_SENT' ||
                    pendingFriendIds.has(student.id);
                  const isPendingReceived =
                    student.friendshipStatus === 'PENDING_RECEIVED';
                  const isBusy = actioningUserIds.has(student.id);

                  return (
                    <div
                      key={student.id}
                      className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-slate-900 ${
                        isPendingSent
                          ? 'border-amber-200 dark:border-amber-900/50'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setProfileTarget(student)}
                            aria-label={`View ${student.name}'s profile`}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <div className="relative">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt=""
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              {isOnline && (
                                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="truncate font-bold text-slate-900 dark:text-slate-50">
                                {student.name}
                              </h4>
                              {student.school && (
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <School size={12} />
                                  <span className="min-w-0 truncate">{student.school}</span>
                                </div>
                              )}
                              <span className="mt-1 inline-block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                View profile
                              </span>
                            </div>
                          </button>

                          {/* Friend Action Button */}
                          {isPendingSent ? (
                            <div className="flex shrink-0 items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                <Clock size={12} />
                                <span>Pending</span>
                              </span>
                              <button
                                disabled={isBusy}
                                onClick={() => setCancelConfirmTarget({ id: student.id, name: student.name })}
                                title="Cancel friend request"
                                className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
                              >
                                {isBusy ? '...' : 'Cancel'}
                              </button>
                            </div>
                          ) : isPendingReceived ? (
                            <button
                              onClick={() => {
                                setRequestSegment('incoming');
                                setActiveTab('requests');
                              }}
                              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                            >
                              <UserCheck size={13} />
                              <span>Respond</span>
                            </button>
                          ) : (
                            <button
                              disabled={isBusy}
                              onClick={() => handleSendFriendRequest(student.id)}
                              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                            >
                              <UserPlus size={13} />
                              <span>{isBusy ? 'Sending...' : 'Add'}</span>
                            </button>
                          )}
                        </div>

                        {student.bio && (
                          <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {student.bio}
                          </p>
                        )}
                      </div>

                      <div>
                        {student.courses && student.courses.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                            {student.courses.slice(0, 3).map((c, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              >
                                <BookOpen size={11} />
                                <span>{c}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {isPendingSent && (
                          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-[11px] dark:border-amber-900/40 dark:bg-amber-950/20">
                            <span className="font-medium text-amber-800 dark:text-amber-300">
                              Request sent • Waiting for approval
                            </span>
                            {/* <button
                              disabled={isBusy}
                              onClick={() => setCancelConfirmTarget({ id: student.id, name: student.name })}
                              className="font-bold text-rose-600 hover:underline dark:text-rose-400"
                            >
                              Cancel Request
                            </button> */}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────
          TAB 2: REQUESTS
          ────────────────────────────────────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Segment Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setRequestSegment('all')}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  requestSegment === 'all'
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                All Pending ({incomingRequests.length + outgoingRequests.length})
              </button>
              <button
                onClick={() => setRequestSegment('incoming')}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  requestSegment === 'incoming'
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Received ({incomingRequests.length})
              </button>
              <button
                onClick={() => setRequestSegment('outgoing')}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  requestSegment === 'outgoing'
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Sent ({outgoingRequests.length})
              </button>
              <button
                onClick={() => setRequestSegment('blocked')}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  requestSegment === 'blocked'
                    ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Blocked ({blockedUsers.length})
              </button>
            </div>
          </div>

          {loadingRequests ? (
            <div className="py-20 text-center text-sm text-slate-500">Loading requests...</div>
          ) : (
            <div className="space-y-8">
              {/* RECEIVED REQUESTS SECTION */}
              {(requestSegment === 'all' || requestSegment === 'incoming') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Received Friend Requests ({incomingRequests.length})
                    </h3>
                  </div>

                  {incomingRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
                      No incoming friend requests right now.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {incomingRequests.map((req) => {
                        const isOnline = isUserOnline(req.user.id);
                        return (
                          <div
                            key={req.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => setProfileTarget(req.user)}
                                  aria-label={`View ${req.user.name}'s profile`}
                                  className="flex min-w-0 items-center gap-3 text-left"
                                >
                                  <div className="relative shrink-0">
                                    {req.user.avatarUrl ? (
                                      <img
                                        src={req.user.avatarUrl}
                                        alt={req.user.name}
                                        className="h-12 w-12 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                                        {req.user.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    {isOnline && (
                                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="truncate font-bold text-slate-900 dark:text-slate-50">
                                      {req.user.name}
                                    </h4>
                                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                      <School size={12} className="shrink-0" />
                                      <span className="truncate">
                                        {req.user.school || 'Coursemate'}
                                      </span>
                                    </div>
                                  </div>
                                </button>

                                <div className="flex shrink-0 items-center gap-2">
                                  <button
                                    onClick={() => handleAcceptRequest(req.id)}
                                    className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => setDeclineConfirmTarget(req)}
                                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>

                              {req.user.bio && (
                                <p className="mt-3 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                                  {req.user.bio}
                                </p>
                              )}
                            </div>

                            {req.user.courses && req.user.courses.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                                {req.user.courses.slice(0, 3).map((c, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                  >
                                    <BookOpen size={10} />
                                    <span>{c}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SENT (OUTGOING PENDING) REQUESTS SECTION */}
              {(requestSegment === 'all' || requestSegment === 'outgoing') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      People You Sent Requests To — Pending ({outgoingRequests.length})
                    </h3>
                  </div>

                  {outgoingRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
                      You have no outgoing pending friend requests.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {outgoingRequests.map((req) => {
                        const isOnline = isUserOnline(req.user.id);
                        const isCancelling = actioningUserIds.has(req.user.id);
                        return (
                          <div
                            key={req.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() => setProfileTarget(req.user)}
                                  aria-label={`View ${req.user.name}'s profile`}
                                  className="flex min-w-0 items-center gap-3 text-left"
                                >
                                  <div className="relative shrink-0">
                                    {req.user.avatarUrl ? (
                                      <img
                                        src={req.user.avatarUrl}
                                        alt={req.user.name}
                                        className="h-12 w-12 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                        {req.user.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    {isOnline && (
                                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="truncate font-bold text-slate-900 dark:text-slate-50">
                                      {req.user.name}
                                    </h4>
                                    {req.user.school && (
                                      <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                        <School size={12} className="shrink-0" />
                                        <span className="truncate">{req.user.school}</span>
                                      </div>
                                    )}
                                    <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                      <Clock size={11} />
                                      <span>Pending approval</span>
                                    </div>
                                  </div>
                                </button>

                                <button
                                  disabled={isCancelling}
                                  onClick={() => setCancelConfirmTarget({ id: req.user.id, name: req.user.name })}
                                  className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400"
                                >
                                  {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                                </button>
                              </div>

                              {req.user.bio && (
                                <p className="mt-3 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                                  {req.user.bio}
                                </p>
                              )}
                            </div>

                            {req.user.courses && req.user.courses.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                                {req.user.courses.slice(0, 3).map((c, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                  >
                                    <BookOpen size={10} />
                                    <span>{c}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* BLOCKED STUDENTS SECTION */}
              {requestSegment === 'blocked' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Blocked Students ({blockedUsers.length})
                    </h3>
                  </div>

                  {blockedUsers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
                      You have not blocked any students.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {blockedUsers.map((student) => {
                        const isUnblocking = actioningUserIds.has(student.id);
                        return (
                          <div
                            key={student.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt={student.name}
                                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="truncate font-bold text-slate-900 dark:text-slate-50">
                                  {student.name}
                                </h4>
                                <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                  <School size={12} className="shrink-0" />
                                  <span className="truncate">
                                    {student.school || 'Coursemate'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isUnblocking}
                              onClick={() => handleUnblockUser(student)}
                              className="shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
                            >
                              {isUnblocking ? 'Unblocking...' : 'Unblock'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────
          TAB 3: TWO-PANE CHAT LAYOUT
          ────────────────────────────────────────────── */}
      {activeTab === 'chats' && (
        <div         className="study-buddy-chat flex h-[720px] min-h-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Left Pane: Conversations List */}
          <div
            className={`flex w-full flex-col border-r border-slate-200 dark:border-slate-800 md:w-80 md:flex-shrink-0 ${
              activeConversation ? 'hidden md:block' : 'block'
            }`}
          >
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-50">Conversations</h3>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {loadingChats ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading chats...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No active chats yet. Connect in the Discover tab!
                </div>
              ) : (
                conversations.map((conv) => {
                  const isOnline = isUserOnline(conv.otherUser.id);
                  const isTyping = isUserTyping(conv.otherUser.id);
                  const isSelected = activeConversation?.id === conv.id;

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => handleSelectConversation(conv)}
                      className={`mb-1.5 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {conv.otherUser.avatarUrl ? (
                          <img
                            src={conv.otherUser.avatarUrl}
                            alt={conv.otherUser.name}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900">
                            {conv.otherUser.name.charAt(0)}
                          </div>
                        )}
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="truncate font-semibold text-slate-900 dark:text-slate-50 text-sm">
                            {conv.otherUser.name}
                          </h4>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center justify-between">
                          <p className="truncate text-xs text-slate-500">
                            {isTyping ? (
                              <span className="font-semibold text-indigo-600">Typing...</span>
                            ) : (
                              formatLastMessagePreview(conv.lastMessage)
                            )}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Chat Window */}
          <div
            className={`flex flex-1 flex-col ${
              !activeConversation ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCloseChat}
                      aria-label="Back to conversations"
                      className="mr-1 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setProfileTarget(activeConversation.otherUser)}
                      aria-label={`View ${activeConversation.otherUser.name}'s profile`}
                      className="flex items-center gap-3 rounded-xl text-left hover:opacity-80"
                    >
                      <div className="relative">
                        {activeConversation.otherUser.avatarUrl ? (
                          <img
                            src={activeConversation.otherUser.avatarUrl}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                            {activeConversation.otherUser.name.charAt(0)}
                          </div>
                        )}
                        {isUserOnline(activeConversation.otherUser.id) && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm">
                          {activeConversation.otherUser.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {isUserTyping(activeConversation.otherUser.id)
                            ? 'Typing...'
                            : isUserOnline(activeConversation.otherUser.id)
                              ? 'Online'
                              : activeConversation.otherUser.school || 'Coursemate'}
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <div ref={menuRef} className="relative">
                      <button
                        type="button"
                        aria-label="Conversation actions"
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {menuOpen && (
                        <div
                          role="menu"
                          className="absolute right-0 top-10 z-20 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={handleCloseChat}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <X size={14} className="text-slate-400" />
                            <span>Close chat</span>
                          </button>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuOpen(false);
                              setReportTarget(activeConversation.otherUser);
                              setReportReason('');
                              setReportError(null);
                              setAlsoBlockOnReport(false);
                              setReportModalOpen(true);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <ShieldAlert size={14} className="text-amber-500" />
                            <span>Report user</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuOpen(false);
                              setConfirmActionError(null);
                              setBlockConfirmTarget(activeConversation.otherUser);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <AlertTriangle size={14} />
                            <span>Block user</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuOpen(false);
                              setConfirmActionError(null);
                              setUnfriendConfirmTarget(activeConversation.otherUser);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            <UserX size={14} />
                            <span>Unfriend</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseChat}
                      aria-label="Close chat"
                      title="Close chat"
                      className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                  {loadingMessages ? (
                    <div className="py-20 text-center text-xs text-slate-500">
                      Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-20 text-center text-xs text-slate-400">
                      Say hello to {activeConversation.otherUser.name}! 👋
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMine = m.isOutgoing;
                      const isFailed = m.status === 'failed';
                      const voiceNote = parseVoiceNoteText(m.text);

                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                              isMine
                                ? isFailed
                                  ? 'bg-rose-600 text-white rounded-br-none'
                                  : 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-bl-none'
                            }`}
                          >
                            {voiceNote ? (
                              <VoiceNotePlayer
                                url={voiceNote.url}
                                duration={voiceNote.duration}
                                isMine={isMine}
                              />
                            ) : (
                              <p className="break-words leading-relaxed whitespace-pre-wrap">{m.text}</p>
                            )}
                            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-75">
                              <span>
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isMine && (
                                isFailed ? (
                                  <button
                                    onClick={() => handleSendMessage(m)}
                                    className="flex items-center gap-0.5 underline font-bold"
                                  >
                                    <RotateCcw size={10} />
                                    <span>Retry</span>
                                  </button>
                                ) : m.status === 'sending' ? (
                                  <Clock size={12} aria-label="Sending" />
                                ) : m.readAt ? (
                                  <CheckCheck size={13} className="text-cyan-200" />
                                ) : (
                                  <Check size={13} />
                                )
                              )}
                            </div>
                            {isFailed && m.error && (
                              <p className="mt-1 text-[10px] leading-4 text-rose-100">{m.error}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="relative border-t border-slate-200 p-3 dark:border-slate-800">
                  {recordingError && (
                    <div
                      role="alert"
                      className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                    >
                      <span>{recordingError}</span>
                      <button
                        type="button"
                        onClick={() => setRecordingError(null)}
                        aria-label="Dismiss microphone error"
                        className="rounded p-0.5 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                  {emojiPickerOpen && !isRecording && (
                    <div className="absolute bottom-full right-3 mb-2 flex gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                      {CHAT_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          aria-label={`Insert ${emoji}`}
                          onClick={() => insertChatEmoji(emoji)}
                          className="rounded-lg p-1.5 text-lg transition hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {isRecording ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 px-3.5 py-2 dark:border-rose-900/60 dark:bg-rose-950/30">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600" />
                      </span>
                      <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-300">
                        Recording {formatAudioDuration(recordingDuration)}
                      </span>
                      <div className="flex flex-1 items-center gap-1 overflow-hidden h-4" aria-hidden="true">
                        {WAVE_BARS.slice(0, 12).map((h, idx) => (
                          <span
                            key={idx}
                            className="w-1 rounded-full bg-rose-400/70 dark:bg-rose-500/70 animate-pulse"
                            style={{ height: `${h}%`, animationDelay: `${idx * 75}ms` }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={cancelVoiceRecording}
                        aria-label="Discard voice note"
                        title="Discard voice note"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-rose-600 transition hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/40"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={stopAndSendVoiceRecording}
                        aria-label="Send voice note"
                        title="Send voice note"
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white transition hover:bg-indigo-700"
                      >
                        <Send size={14} />
                        <span>Send</span>
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        ref={messageInputRef}
                        type="text"
                        placeholder="Type a message..."
                        value={inputText}
                        maxLength={2000}
                        onChange={(e) => {
                          setInputText(e.target.value);
                          startTyping(activeConversation.otherUser.id);
                          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                          typingTimerRef.current = setTimeout(() => {
                            stopTyping(activeConversation.otherUser.id);
                          }, 2000);
                        }}
                        className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                      />

                      <button
                        type="button"
                        aria-label="Choose an emoji"
                        aria-expanded={emojiPickerOpen}
                        onClick={() => setEmojiPickerOpen((open) => !open)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                      >
                        <Smile size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Record voice note"
                        title="Record voice note"
                        onClick={() => void startVoiceRecording()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                      >
                        <Mic size={18} />
                      </button>
                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
                  <MessageSquare size={32} />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 dark:text-slate-100 text-base">
                  Select a Conversation
                </h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Choose a chat from the left pane or discover coursemates from your university to start studying together!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          INVITE MODAL
          ────────────────────────────────────────────── */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                Invite a Coursemate 🎁
              </h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                Share your personal referral link. When your coursemates sign up, you will both be instantly connected as study buddies!
              </p>

              <div className="mt-4 rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
                <span className="text-xs font-semibold text-slate-400 uppercase">Referral Code</span>
                <p className="text-2xl font-bold tracking-wider text-indigo-700 dark:text-indigo-300">
                  {referralInfo?.referralCode || 'SLOT-BUDDY'}
                </p>
              </div>

              <div className="mt-4 flex items-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <span className="truncate flex-1">{referralInfo?.referralLink}</span>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    if (referralInfo?.referralLink) {
                      navigator.clipboard.writeText(referralInfo.referralLink);
                      setCopiedReferral(true);
                      setTimeout(() => setCopiedReferral(false), 2000);
                    }
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {copiedReferral ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedReferral ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                {referralInfo?.totalReferrals || 0} coursemates joined via your link
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          SETTINGS MODAL
          ────────────────────────────────────────────── */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                Study Buddy Settings
              </h3>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 py-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    Discovery Visibility
                  </h4>
                  <p className="text-xs text-slate-500">Allow coursemates to discover your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.visible ?? true}
                  onChange={(e) =>
                    setSettings((prev) => (prev ? { ...prev, visible: e.target.checked } : null))
                  }
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Study Bio & Goals
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. 200L Software Eng student focusing on Data Structures & Algorithms..."
                  value={settings?.bio || ''}
                  onChange={(e) =>
                    setSettings((prev) => (prev ? { ...prev, bio: e.target.value } : null))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Courses (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GST101, MTH201, CSC205"
                  value={(settings?.courses || []).join(', ')}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev
                        ? {
                            ...prev,
                            courses: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          }
                        : null,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>

            {/* Blocked Students Management */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="mb-2.5 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Blocked Students ({blockedUsers.length})
                </h4>
              </div>
              {blockedUsers.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  No blocked students right now.
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {blockedUsers.map((student) => {
                    const isUnblocking = actioningUserIds.has(student.id);
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="min-w-0">
                          <b className="block truncate text-xs text-slate-900 dark:text-slate-100">
                            {student.name}
                          </b>
                          <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {student.school || 'Coursemate'}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={isUnblocking}
                          onClick={() => handleUnblockUser(student)}
                          className="shrink-0 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-900/50 dark:bg-slate-900 dark:text-indigo-300"
                        >
                          {isUnblocking ? 'Unblocking...' : 'Unblock'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          REPORT MODAL
          ────────────────────────────────────────────── */}
      {reportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!submittingReport) setReportModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h3 id="report-modal-title" className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                    Report {reportTarget?.name || activeConversation?.otherUser.name || 'User'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Help keep Study Buddy academic and respectful.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={submittingReport}
                onClick={() => setReportModalOpen(false)}
                aria-label="Close report modal"
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
              {reportError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  {reportError}
                </div>
              )}

              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Common reasons
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Spam or commercial links',
                    'Harassment or abusive language',
                    'Inappropriate academic conduct',
                    'Fake profile / impersonation',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={submittingReport}
                      onClick={() => {
                        setReportReason(preset);
                        setReportError(null);
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                        reportReason === preset
                          ? 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="report-reason-textarea"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Details
                </label>
                <textarea
                  id="report-reason-textarea"
                  rows={4}
                  required
                  minLength={3}
                  maxLength={1000}
                  disabled={submittingReport}
                  placeholder="Describe what occurred (at least 3 characters)..."
                  value={reportReason}
                  onChange={(e) => {
                    setReportReason(e.target.value);
                    if (reportError) setReportError(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <input
                  type="checkbox"
                  disabled={submittingReport}
                  checked={alsoBlockOnReport}
                  onChange={(e) => setAlsoBlockOnReport(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span>
                  Also block{' '}
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">
                    {reportTarget?.name || activeConversation?.otherUser.name || 'this user'}
                  </strong>{' '}
                  and remove chat
                </span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submittingReport}
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          BLOCK USER CONFIRMATION MODAL
          ────────────────────────────────────────────── */}
      {blockConfirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!confirmActionLoading) setBlockConfirmTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertTriangle size={28} />
              </div>

              <h3 id="block-confirm-title" className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">
                Block {blockConfirmTarget.name}?
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                They will no longer be able to message you, send friend requests, or discover your profile in Study Buddy, and this conversation will be removed.
              </p>
            </div>

            {confirmActionError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                {confirmActionError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={confirmActionLoading}
                onClick={() => setBlockConfirmTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmActionLoading}
                onClick={handleConfirmBlockUser}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {confirmActionLoading ? 'Blocking...' : 'Block user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          UNFRIEND CONFIRMATION MODAL
          ────────────────────────────────────────────── */}
      {unfriendConfirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!confirmActionLoading) setUnfriendConfirmTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="unfriend-confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <UserX size={28} />
              </div>

              <h3 id="unfriend-confirm-title" className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">
                Remove {unfriendConfirmTarget.name}?
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                This will remove{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {unfriendConfirmTarget.name}
                </span>{' '}
                from your study buddies and close this chat. You can always reconnect later in Discover.
              </p>
            </div>

            {confirmActionError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                {confirmActionError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={confirmActionLoading}
                onClick={() => setUnfriendConfirmTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Keep Buddy
              </button>
              <button
                type="button"
                disabled={confirmActionLoading}
                onClick={handleConfirmUnfriendUser}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {confirmActionLoading ? 'Removing...' : 'Unfriend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          CANCEL FRIEND REQUEST CONFIRMATION MODAL
          ────────────────────────────────────────────── */}
      {cancelConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertTriangle size={28} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">
                Withdraw friend request?
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                This will withdraw your pending request to{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {cancelConfirmTarget.name}
                </span>
                . You can send a new request later.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={actioningUserIds.has(cancelConfirmTarget.id)}
                onClick={() => setCancelConfirmTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Keep Request
              </button>
              <button
                type="button"
                disabled={actioningUserIds.has(cancelConfirmTarget.id)}
                onClick={() => handleCancelFriendRequest(cancelConfirmTarget.id)}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {actioningUserIds.has(cancelConfirmTarget.id)
                  ? 'Withdrawing...'
                  : 'Withdraw request'}
              </button>
            </div>
          </div>
        </div>
      )}
      {declineConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <AlertTriangle size={28} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">
                Decline friend request?
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Decline the request from{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {declineConfirmTarget.user.name}
                </span>
                ? They can send you another request later.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={actioningUserIds.has(declineConfirmTarget.id)}
                onClick={() => setDeclineConfirmTarget(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Keep Request
              </button>
              <button
                type="button"
                disabled={actioningUserIds.has(declineConfirmTarget.id)}
                onClick={async () => {
                  if (await handleDeclineRequest(declineConfirmTarget.id)) {
                    setDeclineConfirmTarget(null);
                  }
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {actioningUserIds.has(declineConfirmTarget.id)
                  ? 'Declining...'
                  : 'Decline request'}
              </button>
            </div>
          </div>
        </div>
      )}
      <StudentProfileModal
        student={profileTarget}
        isOnline={profileTarget ? isUserOnline(profileTarget.id) : false}
        onClose={() => setProfileTarget(null)}
      />
    </div>
  );
}

// export default StudyBuddyPage;
