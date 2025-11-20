import { useEffect, useRef, useState } from 'react'

// Utility to load an image
function useBackgroundImage(src) {
  const [image, setImage] = useState(null)
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.src = src
  }, [src])
  return image
}

export default function GraffitiWall({ backendUrl, color, size }) {
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const wsRef = useRef(null)
  const [strokes, setStrokes] = useState([])
  const [drawing, setDrawing] = useState(false)
  const bg = useBackgroundImage('https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1600&auto=format&fit=crop')

  // Fit canvas to container
  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!canvas || !overlay) return

    const resize = () => {
      const rect = overlay.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      redraw()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(overlay)
    return () => ro.disconnect()
  }, [])

  // WebSocket connection
  useEffect(() => {
    const url = backendUrl.replace('http', 'ws') + '/ws'
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        if (msg.type === 'init') {
          setStrokes(msg.strokes || [])
        } else if (msg.type === 'stroke') {
          setStrokes((prev) => [...prev, msg.stroke])
        }
      } catch (_) {}
    }

    ws.onclose = () => {
      // try to reconnect after a delay
      setTimeout(() => {
        if (wsRef.current === ws) {
          wsRef.current = null
        }
      }, 1000)
    }

    return () => {
      ws.close()
    }
  }, [backendUrl])

  // Redraw whenever strokes or bg change
  useEffect(() => {
    redraw()
  }, [strokes, bg])

  const getCtx = () => canvasRef.current?.getContext('2d')

  function redraw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // draw background
    if (bg) {
      // cover background maintaining aspect ratio
      const cw = canvas.width
      const ch = canvas.height
      const iw = bg.width
      const ih = bg.height
      const scale = Math.max(cw / iw, ch / ih)
      const dw = iw * scale
      const dh = ih * scale
      const dx = (cw - dw) / 2
      const dy = (ch - dh) / 2
      ctx.drawImage(bg, dx, dy, dw, dh)
    } else {
      ctx.fillStyle = '#ddd'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // draw each stroke
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const s of strokes) {
      if (!s.points || s.points.length < 2) continue
      ctx.strokeStyle = s.color || '#ff0055'
      ctx.lineWidth = s.size || 8
      ctx.beginPath()
      ctx.moveTo(s.points[0][0], s.points[0][1])
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i][0], s.points[i][1])
      }
      ctx.stroke()
    }
  }

  function toCanvasCoords(e) {
    const rect = overlayRef.current.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }

  function start(e) {
    setDrawing(true)
    const p = toCanvasCoords(e)
    const stroke = { points: [p], color, size }
    setStrokes((prev) => [...prev, stroke])
  }

  function move(e) {
    if (!drawing) return
    const p = toCanvasCoords(e)
    setStrokes((prev) => {
      const copy = prev.slice()
      const last = copy[copy.length - 1]
      last.points.push(p)
      return copy
    })
  }

  function end() {
    if (!drawing) return
    setDrawing(false)
    const last = strokes[strokes.length - 1]
    if (wsRef.current && last && last.points.length > 1) {
      wsRef.current.send(JSON.stringify({ type: 'stroke', stroke: last }))
      // Also persist via REST for initial page loads fallback
      fetch(backendUrl + '/api/strokes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(last)
      }).catch(() => {})
    }
  }

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        ref={overlayRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
      />
      <div className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/40 px-2 py-1 rounded">
        Tips: Måla och bjud in vänner – ni ritar i realtid!
      </div>
    </div>
  )
}
