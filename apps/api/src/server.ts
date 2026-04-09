import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { jobRoutes } from './routes/jobs.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

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

if (isProduction) {
  const staticDir = path.resolve(__dirname, '../../web/dist')

  app.register(import('@fastify/static'), {
    root: staticDir,
    prefix: '/',
    decorateReply: false,
  })

  app.setNotFoundHandler(async (_req, reply) => {
    return reply
      .type('text/html')
      .send(fs.readFileSync(path.join(staticDir, 'index.html')))
  })
}

try {
  await app.listen({ port: 3001, host: '0.0.0.0' })
  console.log('API running on http://localhost:3001')
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
