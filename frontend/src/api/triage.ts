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

export async function submitTicket(payload: TicketRequest): Promise<TriageResponse> {
  const response = await fetch('/api/triage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorPayload?.message || '문의 분석에 실패했습니다.')
  }

  return (await response.json()) as TriageResponse
}
