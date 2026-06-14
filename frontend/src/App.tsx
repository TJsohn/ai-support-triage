import { useMemo, useState } from 'react'
import { submitTicket, type TriageResponse } from './api/triage'
import './App.css'

const SAMPLE_MESSAGES = [
  'I cannot log in to my account and I need access right now.',
  'Please refund my last payment. I was charged twice.',
  'The app keeps showing an error when I upload a file.',
]

const initialResult: TriageResponse = {
  category: 'Waiting for triage',
  severity: 'low',
  summary: 'Submit a message to generate an AI triage result.',
  draftEmail: 'Your AI-written reply draft will appear here.',
  provider: 'fallback',
}

function App() {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [message, setMessage] = useState(SAMPLE_MESSAGES[0])
  const [result, setResult] = useState<TriageResponse>(initialResult)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const severityTone = useMemo(() => {
    const map = {
      low: 'subtle',
      medium: 'warn',
      high: 'danger',
      critical: 'critical',
    } as const

    return map[result.severity] ?? 'subtle'
  }, [result.severity])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await submitTicket({
        customerName,
        customerEmail,
        message,
      })

      setResult(response)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : '문의 분석에 실패했습니다.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Customer Support AI</p>
          <h1>Ticket triage + draft reply in one dashboard</h1>
          <p className="lead">
            고객이 남긴 문의를 받으면 백엔드가 OpenAI 또는 Gemini를 호출해 카테고리와
            심각도를 분류하고, 바로 보낼 수 있는 답장 초안을 만듭니다.
          </p>

          <div className="hero-stats">
            <div>
              <strong>1</strong>
              <span>submit</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>triage</span>
            </div>
            <div>
              <strong>Draft</strong>
              <span>reply email</span>
            </div>
          </div>
        </div>

        <div className="status-card">
          <div className="status-row">
            <span className={`severity severity-${severityTone}`}>{result.severity}</span>
            <span className="provider-badge">{result.provider}</span>
          </div>
          <h2>{result.category}</h2>
          <p>{result.summary}</p>
        </div>
      </section>

      <section className="workspace-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Customer input</p>
              <h2>문의 내용을 입력하세요</h2>
            </div>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Analyzing...' : 'Run triage'}
            </button>
          </div>

          <label>
            Customer name
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Minji Kim"
            />
          </label>

          <label>
            Customer email
            <input
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="minji@example.com"
            />
          </label>

          <label>
            Ticket / email body
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={8}
              placeholder="Describe the issue in English..."
            />
          </label>

          <div className="sample-row">
            {SAMPLE_MESSAGES.map((sample) => (
              <button key={sample} type="button" className="sample-chip" onClick={() => setMessage(sample)}>
                {sample}
              </button>
            ))}
          </div>

          {error ? <p className="error-box">{error}</p> : null}
        </form>

        <aside className="panel result-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">AI output</p>
              <h2>자동 분류 결과</h2>
            </div>
            <span className="mini-note">Updates live after submit</span>
          </div>

          <div className="result-block">
            <div className="result-label">Category</div>
            <div className="result-value">{result.category}</div>
          </div>

          <div className="result-block">
            <div className="result-label">Severity</div>
            <div className="result-value">{result.severity}</div>
          </div>

          <div className="result-block draft-block">
            <div className="result-label">AI draft email</div>
            <pre>{result.draftEmail}</pre>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
