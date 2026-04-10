import type { FastifyInstance } from 'fastify'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { createJob, addFileToJob, finalizeJob, getJobPublic, getJob, deleteJob } from '../services/job-manager.js'

export async function jobRoutes(app: FastifyInstance) {
  app.post('/jobs', async (req, reply) => {
    const body = req.body as { format?: string; quality?: string }
    const format = (body.format || 'jpeg') as 'jpeg' | 'webp' | 'png'
    const quality = Number(body.quality || 80)

    if (!['jpeg', 'webp', 'png'].includes(format)) {
      return reply.code(400).send({ error: 'Invalid format' })
    }

    const job = await createJob(format, quality)
    return reply.code(201).send({ jobId: job.id })
  })

  app.post('/jobs/:id/files', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = await req.file()

    if (!data) {
      return reply.code(400).send({ error: 'No file provided' })
    }

    const buffer = await data.toBuffer()

    try {
      const { entry } = await addFileToJob(id, {
        filename: data.filename,
        buffer,
        size: buffer.length,
      })

      return reply.code(200).send({
        filename: entry.filename,
        status: entry.status,
        originalSize: entry.originalSize,
        compressedSize: entry.compressedSize,
        error: entry.error,
      })
    } catch (err: any) {
      return reply.code(400).send({ error: err.message })
    }
  })

  app.post('/jobs/:id/finalize', async (req, reply) => {
    const { id } = req.params as { id: string }

    try {
      const job = await finalizeJob(id)
      return reply.code(200).send({
        id: job.id,
        status: job.status,
        downloadUrl: job.status === 'done' ? `/jobs/${job.id}/download` : null,
      })
    } catch (err: any) {
      return reply.code(400).send({ error: err.message })
    }
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
