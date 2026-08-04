export type ChatMember = {
  id: string;
  username: string;
  role: string | null;
  lastActiveAt: string | null;
  photos: Array<{ id: string; dataUrl: string; sortOrder: number }>;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string | null;
};

export type Conversation = {
  id: string;
  otherMember: ChatMember;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  blocked: boolean;
  updatedAt: string | null;
};
