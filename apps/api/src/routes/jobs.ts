import type { FastifyInstance } from 'fastify'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { createJob, getJobPublic, getJob, deleteJob } from '../services/job-manager.js'

export async function jobRoutes(app: FastifyInstance) {
  app.post('/jobs', async (req, reply) => {
    const parts = req.parts()
    const files: Array<{ filename: string; buffer: Buffer; size: number }> = []
    let format: 'jpeg' | 'webp' | 'png' = 'jpeg'
    let quality = 80

    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer()
        files.push({
          filename: part.filename,
          buffer,
          size: buffer.length,
        })
      } else {
        if (part.fieldname === 'format') format = part.value as any
        if (part.fieldname === 'quality') quality = Number(part.value)
      }
    }

    if (files.length === 0) {
      return reply.code(400).send({ error: 'No files uploaded' })
    }

    quality = Math.min(90, Math.max(70, quality))

    const job = await createJob(files, format, quality)
    return reply.code(201).send({ jobId: job.id })
  })

  app.get('/jobs/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const job = getJobPublic(id)
    if (!job) return reply.code(404).send({ error: 'Job not found' })
    return job
  })

  app.get('/jobs/:id/download', async (req, reply) => {
    const { id } = req.params as { id: string }
    const job = getJob(id)
    if (!job || !job.zipPath) {
      return reply.code(404).send({ error: 'Download not ready' })
    }

    const fileStat = await stat(job.zipPath)

    reply.header('Content-Type', 'application/zip')
    reply.header('Content-Disposition', `attachment; filename=ziply-${id}.zip`)
    reply.header('Content-Length', fileStat.size)

    return createReadStream(job.zipPath)
  })

  app.delete('/jobs/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const deleted = await deleteJob(id)
    if (!deleted) return reply.code(404).send({ error: 'Job not found' })
    return reply.code(204).send()
  })
}
