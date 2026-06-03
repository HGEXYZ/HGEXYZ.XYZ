import { create } from "zustand"
import type { Conversation, Message } from "@/types"

interface ChatState {
  conversations: Conversation[]; currentConversationId: string | null; messages: Message[]; isLoading: boolean
  setConversations: (convs: Conversation[]) => void; setCurrentConversation: (id: string | null) => void
  setMessages: (msgs: Message[]) => void; addMessage: (msg: Message) => void; setLoading: (v: boolean) => void
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [], currentConversationId: null, messages: [], isLoading: false,
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (id) => set({ currentConversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (isLoading) => set({ isLoading }),
}))
