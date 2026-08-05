export interface TriageResponse {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  draftEmail: string
  provider: 'openai' | 'gemini' | 'fallback'
  receivedAt?: string
}

export interface TicketRequest {
  customerName: string
  customerEmail: string
  message: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function submitTicket(payload: TicketRequest): Promise<TriageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/triage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorPayload?.message || 'Failed to analyze the inquiry.')
  }

  return (await response.json()) as TriageResponse
}