"use client"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { useChatStore } from "@/store/chat"
import { MessageSquare, Send, Plus, Search, Trash2 } from "lucide-react"
import type { Conversation, Message } from "@/types"

export default function ChatPage() {
  const { conversations, currentConversationId, messages, isLoading, setConversations, setCurrentConversation, setMessages, addMessage, setLoading } = useChatStore()
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.user)

  useEffect(() => { api.chat.conversations().then(setConversations) }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const loadConversation = async (id: string) => {
    setCurrentConversation(id)
    const data = await api.chat.getConversation(id)
    setMessages(data.messages)
  }

  const newConversation = async () => {
    const conv = await api.chat.createConversation()
    setConversations([conv, ...conversations])
    setCurrentConversation(conv.id)
    setMessages([])
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    const msg = input.trim()
    setInput("")
    setLoading(true)
    addMessage({ id: "temp", role: "user", content: msg, created_at: new Date().toISOString() })
    try {
      const res = await api.chat.sendMessage({ conversation_id: currentConversationId, message: msg })
      setMessages([...useChatStore.getState().messages.filter((m) => m.id !== "temp"), res.message])
      if (res.conversation_id !== currentConversationId) {
        setCurrentConversation(res.conversation_id)
        api.chat.conversations().then(setConversations)
      }
    } catch { setLoading(false); return }
    setLoading(false)
  }

  const deleteConv = async (id: string) => {
    await api.chat.deleteConversation(id)
    setConversations(conversations.filter((c) => c.id !== id))
    if (currentConversationId === id) { setCurrentConversation(null); setMessages([]) }
  }

  const filteredConvs = conversations.filter((c) => !search || c.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Card className="w-72 shrink-0">
        <CardContent className="p-3 space-y-2">
          <Button onClick={newConversation} className="w-full justify-start gap-2" variant="outline"><Plus className="h-4 w-4" />New Chat</Button>
          <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats..." className="pl-8 h-9 text-sm" /></div>
          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
            {filteredConvs.map((conv) => (
              <div key={conv.id} className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm ${currentConversationId === conv.id ? "bg-secondary" : "hover:bg-secondary"}`} onClick={() => loadConversation(conv.id)}>
                <span className="truncate flex-1">{conv.title || "New Chat"}</span>
                <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteConv(conv.id) }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12"><MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h2 className="text-xl font-semibold mb-2">AI Trading Assistant</h2><p className="text-muted-foreground">Ask me about market analysis, trade ideas, risk assessment, or economic events.</p></div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="bg-secondary rounded-lg p-3"><div className="flex gap-1"><div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" /><div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-100" /><div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-200" /></div></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-border p-4">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about markets, strategies, or analysis..." className="flex-1" disabled={isLoading} />
              <Button type="submit" disabled={isLoading || !input.trim()}><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
