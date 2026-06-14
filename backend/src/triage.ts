import type { TicketInput, TriageResult } from './types.js'

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'
const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash'

function normalizeText(value: string): string {
  return value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
}

function extractJson<T>(text: string): T | null {
  const cleaned = normalizeText(text)
  const directParse = tryParseJson<T>(cleaned)
  if (directParse) {
    return directParse
  }

  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null
  }

  return tryParseJson<T>(cleaned.slice(firstBrace, lastBrace + 1))
}

function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function fallbackTriage(input: TicketInput): TriageResult {
  const message = input.message.toLowerCase()
  const severity =
    message.includes('refund') || message.includes('charge') || message.includes('cannot log in') ||
    message.includes("can't log in") || message.includes('login')
      ? 'high'
      : message.includes('bug') || message.includes('error')
        ? 'medium'
        : 'low'

  const category = message.includes('refund')
    ? 'Billing / Refund'
    : message.includes('login') || message.includes('log in')
      ? 'Account Access'
      : message.includes('error') || message.includes('bug')
        ? 'Technical Issue'
        : 'General Support'

  const summary = `Fallback triage for: ${input.message.slice(0, 120)}`
  const draftEmail = [
    `Hello${input.customerName ? ` ${input.customerName}` : ''},`,
    '',
    'Thanks for reaching out. I have reviewed your request and our team is looking into it now.',
    'If you can share any extra details or screenshots, that will help us resolve this faster.',
    '',
    'Best regards,',
    'Support Team',
  ].join('\n')

  return {
    category,
    severity,
    summary,
    draftEmail,
    provider: 'fallback',
  }
}

function buildPrompt(input: TicketInput): string {
  return [
    'You are a customer support triage assistant.',
    'Analyze the customer message and return only valid JSON with this shape:',
    '{"category":"string","severity":"low|medium|high|critical","summary":"string","draftEmail":"string"}',
    'Rules:',
    '- category should be short and business-friendly.',
    '- severity should reflect urgency and customer impact.',
    '- summary should be one concise sentence.',
    '- draftEmail should sound like a real support reply draft.',
    '- Use the customer name if provided.',
    '- Do not include markdown fences or extra commentary.',
    '',
    `Customer name: ${input.customerName || 'unknown'}`,
    `Customer email: ${input.customerEmail || 'unknown'}`,
    `Customer message: ${input.message}`,
  ].join('\n')
}

async function callOpenAI(input: TicketInput): Promise<TriageResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn('OpenAI API key missing, routing to immediate fallback.')
    return fallbackTriage(input)
  }

  try {
    const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: 'You produce precise support triage JSON.' },
            { role: 'user', content: buildPrompt(input) },
        ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API responded with status ${response.status}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = payload.choices?.[0]?.message?.content ?? ''
  const parsed = extractJson<{
    category: string
    severity: TriageResult['severity']
    summary: string
    draftEmail: string
  }>(content)

  if (!parsed) {
    throw new Error('OpenAI returned non-parseable raw text or structural anomaly')
  }

  return {
    ...parsed,
    provider: 'openai',
  }
} catch (error) {
    console.error('Detailed Error inside callOpenAI step:', error)
    throw error
    }
}

async function callGemini(input: TicketInput): Promise<TriageResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('Gemini API key missing, routing to immediate fallback.')
    return fallbackTriage(input)
  }

  try {
    const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: buildPrompt(input) }],
                    },
                ],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: 'application/json',
                },
            }),
        },
    )

    if (!response.ok) {
        throw new Error(`Gemini API responded with status ${response.status}`)
    }

    const payload = (await response.json()) as {
     candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }
  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const parsed = extractJson<{
    category: string
    severity: TriageResult['severity']
    summary: string
    draftEmail: string
  }>(content)

  if (!parsed) {
    throw new Error('Gemini returned non-parseable raw text or structural anomaly')
  }

  return {
    ...parsed,
    provider: 'gemini',
  }
} catch (error) {
    console.error('Detailed Error inside callGemini step:', error)
    throw error
}
}

export async function triageTicket(input: TicketInput): Promise<TriageResult> {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase()

  try {
    if (provider === 'gemini') {
      return await callGemini(input)
    }

    return await callOpenAI(input)
  } catch (error) {
    console.error('AI triage failed, using fallback response.', error)
    return fallbackTriage(input)
  }
}
