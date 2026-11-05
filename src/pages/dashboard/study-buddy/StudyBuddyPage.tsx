import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { StudentProfileModal } from './StudentProfileModal';
import { useSocket } from '../../../hooks/useSocket';
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

  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'chats'>('discover');

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
  const [requestSegment, setRequestSegment] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Chats state
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
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
  // Fetch Requests
  // ──────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const data = await studyBuddyService.getRequests();
      setIncomingRequests(data.incoming);
      setOutgoingRequests(data.outgoing);
    } catch (err) {
      console.error('Requests error:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

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
      if (data.length > 0 && !activeConversation && window.innerWidth >= 768) {
        setActiveConversation(data[0]);
      }
    } catch (err) {
      console.error('Conversations error:', err);
    } finally {
      setLoadingChats(false);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (activeTab === 'chats') {
      fetchConversations();
    }
  }, [activeTab, fetchConversations]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    let cancelled = false;
    async function load() {
      try {
        setLoadingMessages(true);
        const data = await studyBuddyService.getMessages(activeConversation!.id, undefined, 50);
        if (!cancelled) {
          setMessages(data.messages);
          studyBuddyService.markConversationRead(activeConversation!.id);
          markConversationRead(activeConversation!.id);
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
  }, [activeConversation, markConversationRead]);

  // Real-time live listeners
  useEffect(() => {
    const unsubMsg = addMessageListener((msg) => {
      // If it belongs to currently active conversation
      if (activeConversation && msg.conversationId === activeConversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
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
        studyBuddyService.markConversationRead(activeConversation.id);
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
      setActiveTab('chats');
      fetchConversations();
    } catch (err) {
      console.warn('Accept error:', err);
    }
  };

  const handleDeclineRequest = async (id: string): Promise<boolean> => {
    try {
      await studyBuddyService.declineFriendRequest(id);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
      fetchDiscover();
      return true;
    } catch (err) {
      console.warn('Decline error:', err);
      return false;
    }
  };

  const handleSendMessage = async (retryMsg?: ChatMessage) => {
    if (!activeConversation) return;
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
        prev.map((m) => (m.id === tempId ? { ...m, status: 'sending' } : m)),
      );
    }

    try {
      const res = await sendMessage(activeConversation.otherUser.id, textToSend);
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: res.data!.id,
                  createdAt: res.data!.createdAt,
                  status: 'sent',
                }
              : m,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)),
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)),
      );
    }
  };

  const handleBlockUser = async () => {
    if (!activeConversation) return;
    if (confirm(`Block ${activeConversation.otherUser.name}? They will not be able to message you.`)) {
      try {
        await studyBuddyService.blockUser(activeConversation.otherUser.id);
        setActiveConversation(null);
        fetchConversations();
      } catch (err) {
        console.error('Block error:', err);
      }
    }
  };

  const handleUnfriendUser = async () => {
    if (!activeConversation) return;
    if (confirm(`Remove ${activeConversation.otherUser.name} as a study buddy?`)) {
      try {
        await studyBuddyService.unfriend(activeConversation.otherUser.id);
        setActiveConversation(null);
        fetchConversations();
      } catch (err) {
        console.error('Unfriend error:', err);
      }
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !reportReason.trim()) return;
    try {
      await studyBuddyService.createReport({
        reportedId: activeConversation.otherUser.id,
        reason: reportReason.trim(),
      });
      setReportModalOpen(false);
      setReportReason('');
      alert('Report submitted. Our safety team will review it.');
    } catch (err) {
      console.error('Report error:', err);
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
        </button>
      </div>

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
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="relative">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt={student.name}
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
                            </div>
                          </div>

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
            <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
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
                      onClick={() => setActiveConversation(conv)}
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
                              conv.lastMessage || 'Connected. Say hello!'
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
                      onClick={() => setActiveConversation(null)}
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

                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 top-10 z-20 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setReportModalOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <ShieldAlert size={14} className="text-amber-500" />
                          <span>Report user</span>
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            handleBlockUser();
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <AlertTriangle size={14} />
                          <span>Block user</span>
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            handleUnfriendUser();
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <UserX size={14} />
                          <span>Unfriend</span>
                        </button>
                      </div>
                    )}
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
                            <p className="break-words leading-relaxed whitespace-pre-wrap">{m.text}</p>
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
                                ) : m.readAt ? (
                                  <CheckCheck size={13} className="text-cyan-200" />
                                ) : (
                                  <Check size={13} />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="border-t border-slate-200 p-3 dark:border-slate-800">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
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
                      type="submit"
                      disabled={!inputText.trim()}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
                    >
                      <Send size={16} />
                    </button>
                  </form>
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
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
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
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          REPORT MODAL
          ────────────────────────────────────────────── */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg">
              Report Safety Issue
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Help us maintain an academic, respectful community. Please describe the violation:
            </p>

            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
              <textarea
                rows={4}
                required
                maxLength={1000}
                placeholder="Describe what occurred (harassment, spam, inappropriate language)..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
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
