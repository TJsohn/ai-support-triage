export type AIProvider = 'openai' | 'gemini'

export interface TicketInput {
  customerName?: string
  customerEmail?: string
  message: string
}

export interface TriageResult {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  draftEmail: string
  provider: AIProvider | 'fallback'
}
