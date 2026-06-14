import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { triageTicket } from './triage'
import type { TicketInput } from './types'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors())
app.use(express.json())

app.get('/health', (_request, response) => {
  response.json({ ok: true })
})

app.post('/api/triage', async (request, response) => {
  const body = request.body as Partial<TicketInput>

  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    response.status(400).json({ message: 'message is required' })
    return
  }

  const result = await triageTicket({
    customerName: body.customerName?.trim(),
    customerEmail: body.customerEmail?.trim(),
    message: body.message.trim(),
  })

  response.json({
    ...result,
    receivedAt: new Date().toISOString(),
  })
})

app.listen(port, () => {
  console.log(`Support AI backend listening on http://localhost:${port}`)
})
