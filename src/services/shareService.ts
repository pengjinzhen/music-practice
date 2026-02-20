const JSONBIN_API = 'https://api.jsonbin.io/v3/b'

export interface SharePayload {
  trackName: string
  totalScore: number
  scores: { speed: number; rhythm: number; intonation: number; smoothness: number; completeness: number }
  date: string
  diagnostics: { problem: string; cause: string; solution: string }[]
}

export async function createShareLink(data: SharePayload): Promise<string> {
  const res = await fetch(JSONBIN_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Bin-Private': 'false' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create share link')
  const json = await res.json()
  const binId = json.metadata?.id
  if (!binId) throw new Error('No bin ID returned')
  return `${window.location.origin}/share/${binId}`
}

export async function fetchSharedReport(token: string): Promise<SharePayload> {
  const res = await fetch(`${JSONBIN_API}/${token}/latest`, {
    headers: { 'X-Bin-Meta': 'false' },
  })
  if (!res.ok) throw new Error('Failed to fetch shared report')
  return res.json()
}
