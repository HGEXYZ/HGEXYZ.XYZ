import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"

interface AuthState {
  user: User | null; access_token: string | null; refresh_token: string | null; isAuthenticated: boolean
  setAuth: (user: User, access: string, refresh: string) => void; logout: () => void; updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    user: null, access_token: null, refresh_token: null, isAuthenticated: false,
    setAuth: (user, access, refresh) => {
      localStorage.setItem("access_token", access); localStorage.setItem("refresh_token", refresh)
      set({ user, access_token: access, refresh_token: refresh, isAuthenticated: true })
    },
    logout: () => {
      localStorage.removeItem("access_token"); localStorage.removeItem("refresh_token")
      set({ user: null, access_token: null, refresh_token: null, isAuthenticated: false })
    },
    updateUser: (user) => set({ user }),
  }), { name: "auth-storage" })
)
