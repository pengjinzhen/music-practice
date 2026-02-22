import { useEffect, useRef, useState } from 'react'
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'

export interface ScoreViewerProps {
  /** MusicXML content string, full URL, or relative path like "piano/twinkle.xml" */
  musicXml: string
  zoom?: number
  onReady?: (osmd: OSMD) => void
  className?: string
}

async function resolveXml(input: string): Promise<string> {
  if (!input) return ''
  // Already XML content
  if (input.trimStart().startsWith('<') || input.trimStart().startsWith('<?xml')) return input
  // Relative path — resolve to /scores/ prefix
  const url = input.startsWith('http') ? input : `/scores/${input}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

export function ScoreViewer({ musicXml, zoom = 1.0, onReady, className }: ScoreViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const osmdRef = useRef<OSMD | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const doInit = async () => {
      if (!containerRef.current || !musicXml) return
      try {
        setLoading(true)
        setError(null)
        if (osmdRef.current) osmdRef.current.clear()
        const xmlContent = await resolveXml(musicXml)
        if (cancelled) return
        const osmd = new OSMD(containerRef.current, {
          autoResize: true, drawTitle: true, drawComposer: true, drawingParameters: 'default',
        })
        osmd.zoom = zoom
        osmdRef.current = osmd
        await osmd.load(xmlContent)
        if (cancelled) return
        osmd.render()
        setLoading(false)
        onReady?.(osmd)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load score')
          setLoading(false)
        }
      }
    }
    doInit()
    return () => {
      cancelled = true
      osmdRef.current?.clear()
    }
  }, [musicXml, zoom, onReady])

  useEffect(() => {
    if (osmdRef.current) {
      osmdRef.current.zoom = zoom
      osmdRef.current.render()
    }
  }, [zoom])

  return (
    <div className={className}>
      {loading && <div className="flex items-center justify-center p-8 text-muted-foreground">Loading score...</div>}
      {error && <div className="p-4 text-red-500">Error: {error}</div>}
      <div ref={containerRef} className={loading ? 'hidden' : ''} />
    </div>
  )
}
