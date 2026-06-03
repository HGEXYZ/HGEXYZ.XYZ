const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string> || {}) }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  if (res.status === 401 && token) {
    const refresh = localStorage.getItem("refresh_token")
    if (refresh) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: refresh }) })
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        localStorage.setItem("access_token", data.access_token)
        headers["Authorization"] = `Bearer ${data.access_token}`
        const retry = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
        if (!retry.ok) throw new Error(await retry.text())
        return retry.json()
      }
    }
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    if (typeof window !== "undefined") window.location.href = "/login"
    throw new Error("Session expired")
  }
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  auth: {
    register: (data: any) => request<any>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: any) => request<any>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    me: () => request<any>("/auth/me"),
    google: (id_token: string) => request<any>("/auth/google", { method: "POST", body: JSON.stringify({ id_token }) }),
    refresh: (refresh_token: string) => request<any>("/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token }) }),
    logout: () => request<any>("/auth/logout", { method: "POST" }),
  },
  chat: {
    conversations: () => request<any[]>("/chat/conversations"),
    search: (q: string) => request<any[]>(`/chat/conversations?search=${encodeURIComponent(q)}`),
    getConversation: (id: string) => request<any>(`/chat/conversations/${id}`),
    createConversation: (title?: string) => request<any>("/chat/conversations", { method: "POST", body: JSON.stringify({ title }) }),
    updateConversation: (id: string, title: string) => request<any>(`/chat/conversations/${id}`, { method: "PUT", body: JSON.stringify({ title }) }),
    deleteConversation: (id: string) => request<any>(`/chat/conversations/${id}`, { method: "DELETE" }),
    sendMessage: (data: any) => request<any>("/chat/messages", { method: "POST", body: JSON.stringify(data) }),
  },
  markets: {
    quote: (symbol: string) => request<any>(`/markets/quote/${symbol}`),
    history: (symbol: string, interval = "1h", limit = 200) => request<any>(`/markets/history/${symbol}?interval=${interval}&limit=${limit}`),
    movers: () => request<any>("/markets/movers"),
    search: (q: string, type?: string) => request<any>(`/markets/search?q=${encodeURIComponent(q)}${type ? `&asset_type=${type}` : ""}`),
    indices: () => request<any>("/markets/indices"),
  },
  scanner: {
    scan: (filters: any) => request<any[]>("/scanner/scan", { method: "POST", body: JSON.stringify(filters) }),
    smc: (symbol: string, timeframe = "1h") => request<any>(`/scanner/smc/${symbol}?timeframe=${timeframe}`),
  },
  backtest: {
    run: (data: any) => request<any>("/backtest/run", { method: "POST", body: JSON.stringify(data) }),
    history: () => request<any[]>("/backtest/history"),
    get: (id: string) => request<any>(`/backtest/${id}`),
    delete: (id: string) => request<any>(`/backtest/${id}`, { method: "DELETE" }),
  },
  portfolio: {
    get: () => request<any>("/portfolio"),
    addTrade: (data: any) => request<any>("/portfolio/trades", { method: "POST", body: JSON.stringify(data) }),
    closeTrade: (id: string, exit_price: number) => request<any>(`/portfolio/trades/${id}/close?exit_price=${exit_price}`, { method: "PUT" }),
  },
  news: {
    list: (limit = 20, symbol?: string) => request<any[]>(`/news?limit=${limit}${symbol ? `&symbol=${symbol}` : ""}`),
    calendar: (limit = 50) => request<any[]>("/news/economic-calendar"),
  },
  strategies: {
    generate: (data: any) => request<any>("/strategies/generate", { method: "POST", body: JSON.stringify(data) }),
    analyzeChart: (data: any) => request<any>("/strategies/analyze-chart", { method: "POST", body: JSON.stringify(data) }),
  },
  subscriptions: {
    plans: () => request<any>("/subscriptions/plans"),
    current: () => request<any>("/subscriptions/current"),
  },
  admin: {
    users: (page = 1, search?: string) => request<any>(`/admin/users?page=${page}${search ? `&search=${search}` : ""}`),
    stats: () => request<any>("/admin/stats"),
    updateSubscription: (userId: string, data: any) => request<any>(`/admin/users/${userId}/subscription`, { method: "PUT", body: JSON.stringify(data) }),
    logs: (page = 1) => request<any>(`/admin/logs?page=${page}`),
  },
}
