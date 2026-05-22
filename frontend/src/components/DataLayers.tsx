'use client'

import { useState } from 'react'

interface Layer {
  id: string
  label: string
  count: number
  total: number
  active: boolean
  items: string[]
}

const defaultLayers: Layer[] = [
  { id: 'aviation', label: 'AVIATION', count: 0, total: 4, active: false, items: ['Commercial', 'Private', 'Private Jets', 'Military'] },
  { id: 'maritime', label: 'MARITIME & SPACE', count: 0, total: 2, active: false, items: ['Maritime / Naval', 'Satellites'] },
  { id: 'surveillance', label: 'SURVEILLANCE', count: 3, total: 3, active: true, items: ['CCTV Cameras', 'Live News Feeds', 'SIGINT News (RSS)'] },
  { id: 'hazards', label: 'NATURAL HAZARDS', count: 1, total: 3, active: true, items: ['Earthquakes (24h)', 'Active Fires', 'Severe Weather'] },
  { id: 'threats', label: 'THREATS & INFRA', count: 1, total: 3, active: false, items: ['Nuclear Facilities', 'Global Incidents', 'GPS Jamming'] },
  { id: 'display', label: 'DISPLAY', count: 0, total: 1, active: false, items: ['Day / Night Cycle'] },
]

export default function DataLayers() {
  const [layers, setLayers] = useState<Layer[]>(defaultLayers)

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    )
  }

  const activeCount = layers.filter((l) => l.active).length

  return (
    <div className="panel animate-fade-in">
      <div className="panel-header">DATA LAYERS &mdash; {activeCount}/6 ENT</div>

      <div className="space-y-2">
        {layers.map((layer) => (
          <div key={layer.id}>
            <button
              onClick={() => toggleLayer(layer.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded border text-xs font-mono transition-all ${
                layer.active
                  ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]'
                  : 'bg-transparent border-[#1e293b] text-[#475569] hover:text-[#94a3b8]'
              }`}
            >
              <span>{layer.label}</span>
              <span className="text-[10px]">
                {layer.count}/{layer.total}
              </span>
            </button>
            {layer.active && (
              <div className="ml-3 mt-1 space-y-0.5">
                {layer.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[10px] font-mono text-[#475569] py-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#00ff88]" />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
