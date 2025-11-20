import { useMemo, useState } from 'react'
import GraffitiWall from './components/GraffitiWall'
import Toolbar from './components/Toolbar'

function App() {
  const backendUrl = useMemo(() => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  }, [])

  const [color, setColor] = useState('#ff3b3b')
  const [size, setSize] = useState(10)

  function clearWall() {
    // Soft clear: just reload strokes from backend (not implemented a delete endpoint), so refresh page
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.15),transparent_40%)]" />
      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/flame-icon.svg" className="w-8 h-8" alt="logo" />
          <h1 className="text-xl font-semibold">Graffiti Vägg</h1>
        </div>
        <div className="text-sm text-blue-200/80">Måla tillsammans i realtid</div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <Toolbar color={color} setColor={setColor} size={size} setSize={setSize} clearWall={clearWall} />
        <GraffitiWall backendUrl={backendUrl} color={color} size={size} />
      </main>

      <footer className="relative z-10 text-center text-blue-200/70 py-6 text-xs">
        Byggd med kärlek. Dela länken för att bjuda in vänner.
      </footer>
    </div>
  )
}

export default App
