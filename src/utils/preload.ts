/**
 * Preload strategy for WASM modules and heavy assets.
 * Loads critical modules first, then defers non-critical ones.
 */
export function initPreloadStrategy() {
  // Phase 1: Critical - sql.js WASM (needed for any data access)
  preloadWasm('/sql-wasm.wasm', 'sql-wasm')

  // Phase 2: Deferred - Audio/ML models (loaded when entering practice)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadWasm('/essentia-wasm.wasm', 'essentia')
    })
  }
}

function preloadWasm(url: string, label: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'fetch'
  link.href = url
  link.crossOrigin = 'anonymous'
  link.onerror = () => console.warn(`[preload] ${label} not found, skipping`)
  document.head.appendChild(link)
}

/** Preload practice-related assets when user navigates to library */
export function preloadPracticeAssets() {
  const chunks = ['/assets/practice', '/assets/score-viewer']
  for (const c of chunks) {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = c
    document.head.appendChild(link)
  }
}
