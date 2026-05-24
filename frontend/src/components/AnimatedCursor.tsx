'use client'

import { useEffect, useState } from 'react'

export default function AnimatedCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      if (!visible) setVisible(true)
    }
    const leave = () => setVisible(false)
    const enter = () => setVisible(true)
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', leave)
    document.addEventListener('mouseenter', enter)
    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
      document.removeEventListener('mouseenter', enter)
    }
  }, [visible])

  if (typeof window === 'undefined') return null

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-opacity duration-300"
      style={{
        left: pos.x - 150,
        top: pos.y - 150,
        width: 300,
        height: 300,
        opacity: visible ? 1 : 0,
        background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(0, 0)',
      }}
    />
  )
}
