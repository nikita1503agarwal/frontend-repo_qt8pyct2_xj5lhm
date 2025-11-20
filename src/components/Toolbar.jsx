import { useState } from 'react'

const presetColors = [
  '#ff3b3b', '#ff9f1a', '#ffd60a', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#ec4899', '#ffffff', '#000000'
]

export default function Toolbar({ color, setColor, size, setSize, clearWall }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute left-4 top-4 z-20 flex flex-col gap-3">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-3 flex items-center gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
        >
          Färg
        </button>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-slate-200"
          />
          <input
            type="range"
            min="2"
            max="60"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-32"
          />
          <div className="w-8 h-8 rounded-full border border-slate-300" style={{ background: color }} />
        </div>
        <button
          onClick={clearWall}
          className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
        >
          Rensa
        </button>
      </div>

      {open && (
        <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-3 grid grid-cols-5 gap-2">
          {presetColors.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setOpen(false) }}
              className="w-8 h-8 rounded shadow-inner border border-slate-200"
              style={{ background: c }}
              aria-label={`Välj färg ${c}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
