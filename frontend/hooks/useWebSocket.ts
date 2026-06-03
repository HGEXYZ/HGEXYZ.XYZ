"use client"
import { useEffect, useRef, useCallback } from "react"
import { io, Socket } from "socket.io-client"

export function useWebSocket(channel = "global", onMessage?: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null)
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000", { transports: ["websocket"] })
    socketRef.current = socket
    socket.on("connect", () => socket.emit("join", { channel }))
    if (onMessage) socket.on("message", onMessage)
    return () => { socket.disconnect() }
  }, [channel])
  const send = useCallback((data: any) => { socketRef.current?.emit("message", data) }, [])
  return { send, socket: socketRef.current }
}
