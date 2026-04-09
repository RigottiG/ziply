import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { jobRoutes } from './routes/jobs.js'

const app = Fastify({ logger: true })

app.register(cors, { origin: true })
app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 100,
  },
})

app.register(jobRoutes)

app.get('/health', async () => ({ status: 'ok' }))

try {
  await app.listen({ port: 3001, host: '0.0.0.0' })
  console.log('API running on http://localhost:3001')
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
