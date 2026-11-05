import api, { unwrap } from './api';

export type FriendshipActionState = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED' | 'BLOCKED';

export interface StudyBuddyStudent {
  id: string;
  name: string;
  avatarUrl: string | null;
  school: string | null;
  program: string | null;
  yearOfStudy: number | null;
  courses: string[];
  bio: string | null;
  isOnline?: boolean;
  friendshipStatus?: FriendshipActionState;
  friendshipId?: string | null;
}

export interface DiscoverResponse {
  users: StudyBuddyStudent[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  activeSchoolFilter: string;
}

export interface FriendItem {
  friendshipId: string;
  user: StudyBuddyStudent;
  since: string;
}

export interface FriendRequestItem {
  id: string;
  createdAt: string;
  user: StudyBuddyStudent;
}

export interface FriendRequestsResponse {
  incoming: FriendRequestItem[];
  outgoing: FriendRequestItem[];
}

export interface ConversationItem {
  id: string;
  pairKey: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  otherUser: StudyBuddyStudent;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  readAt?: string | null;
  createdAt: string;
  isOutgoing?: boolean;
  status?: 'sending' | 'sent' | 'failed';
}

export interface MessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface StudyBuddySettings {
  visible: boolean;
  bio: string | null;
  courses: string[];
  school: string | null;
}

export interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
}

export const studyBuddyService = {
  discover: async (params: {
    school?: string;
    course?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<DiscoverResponse> => {
    const res = await api.get('/study-buddy/discover', { params });
    return unwrap<DiscoverResponse>(res.data);
  },

  getFriends: async (): Promise<FriendItem[]> => {
    const res = await api.get('/friends');
    return unwrap<FriendItem[]>(res.data);
  },

  getRequests: async (): Promise<FriendRequestsResponse> => {
    const res = await api.get('/friends/requests');
    return unwrap<FriendRequestsResponse>(res.data);
  },

  sendFriendRequest: async (userId: string) => {
    const res = await api.post('/friends/request', { userId });
    return unwrap<{ success: boolean; message: string; friendship: any }>(res.data);
  },

  acceptFriendRequest: async (friendshipId: string) => {
    const res = await api.post(`/friends/${friendshipId}/accept`);
    return unwrap<{ success: boolean; message: string; conversationId: string }>(res.data);
  },

  declineFriendRequest: async (friendshipId: string) => {
    const res = await api.post(`/friends/${friendshipId}/decline`);
    return unwrap<{ success: boolean; message: string }>(res.data);
  },

  blockUser: async (userId: string) => {
    const res = await api.post(`/friends/${userId}/block`);
    return unwrap<{ success: boolean; message: string }>(res.data);
  },

  unblockUser: async (userId: string) => {
    const res = await api.post(`/friends/${userId}/unblock`);
    return unwrap<{ success: boolean; message: string }>(res.data);
  },

  unfriend: async (userId: string) => {
    const res = await api.delete(`/friends/${userId}`);
    return unwrap<{ success: boolean; message: string }>(res.data);
  },

  getConversations: async (): Promise<ConversationItem[]> => {
    const res = await api.get('/conversations');
    return unwrap<ConversationItem[]>(res.data);
  },

  getMessages: async (
    conversationId: string,
    cursor?: string,
    limit = 30,
  ): Promise<MessagesResponse> => {
    const res = await api.get(`/conversations/${conversationId}/messages`, {
      params: { cursor, limit },
    });
    return unwrap<MessagesResponse>(res.data);
  },

  markConversationRead: async (conversationId: string) => {
    const res = await api.post(`/conversations/${conversationId}/read`);
    return unwrap<{ success: boolean }>(res.data);
  },

  createReport: async (data: { reportedId: string; messageId?: string; reason: string }) => {
    const res = await api.post('/reports', data);
    return unwrap<{ success: boolean; message: string; reportId: string }>(res.data);
  },

  getReferralInfo: async (): Promise<ReferralInfo> => {
    const res = await api.get('/referral');
    return unwrap<ReferralInfo>(res.data);
  },

  getSettings: async (): Promise<StudyBuddySettings> => {
    const res = await api.get('/study-buddy/settings');
    return unwrap<StudyBuddySettings>(res.data);
  },

  updateSettings: async (data: {
    visible?: boolean;
    bio?: string;
    courses?: string[];
  }): Promise<StudyBuddySettings> => {
    const res = await api.patch('/study-buddy/settings', data);
    return unwrap<StudyBuddySettings>(res.data);
  },

  markNotificationsRead: async (ids?: string[]) => {
    const res = await api.post('/notifications/read', { ids });
    return unwrap<{ success: boolean }>(res.data);
  },
};
