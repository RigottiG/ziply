import { v4 as uuid } from 'uuid'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import { compressImage } from '../workers/pool.js'
import type { Job, ImageEntry, ImageFormat } from '../types.js'

const jobs = new Map<string, Job>()
const TMP_ROOT = path.join(os.tmpdir(), 'ziply')
const CLEANUP_MS = 10 * 60 * 1000

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

export async function createJob(
  files: Array<{ filename: string; buffer: Buffer; size: number }>,
  format: ImageFormat,
  quality: number
): Promise<Job> {
  const id = uuid()
  const jobDir = path.join(TMP_ROOT, id)
  await ensureDir(jobDir)

  const images: ImageEntry[] = files.map((f) => ({
    filename: f.filename,
    status: 'pending',
    originalSize: f.size,
    compressedSize: null,
    compressedBuffer: null,
    error: null,
  }))

  const job: Job = {
    id,
    status: 'processing',
    format,
    quality,
    images,
    createdAt: Date.now(),
    zipPath: null,
  }

  jobs.set(id, job)
  processJob(job, files).catch(() => {
    job.status = 'error'
  })
  scheduleCleanup(id)

  return job
}

async function processJob(
  job: Job,
  files: Array<{ filename: string; buffer: Buffer; size: number }>
) {
  const promises = files.map(async (file, index) => {
    job.images[index].status = 'compressing'

    const result = await compressImage({
      buffer: file.buffer,
      filename: file.filename,
      format: job.format,
      quality: job.quality,
    })

    job.images[index].status = result.error ? 'error' : 'done'
    job.images[index].compressedSize = result.compressedSize
    job.images[index].compressedBuffer = result.error ? null : Buffer.from(result.compressedBuffer)
    job.images[index].error = result.error
  })

  await Promise.all(promises)

  const succeeded = job.images.filter((img) => img.status === 'done')
  if (succeeded.length === 0) {
    job.status = 'error'
    return
  }

  const zipPath = path.join(TMP_ROOT, job.id, 'output.zip')
  await buildZip(succeeded, zipPath)
  job.zipPath = zipPath
  job.status = 'done'
}

async function buildZip(images: ImageEntry[], zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 6 } })

    output.on('close', resolve)
    archive.on('error', reject)

    archive.pipe(output)

    for (const img of images) {
      if (img.compressedBuffer) {
        archive.append(img.compressedBuffer, { name: img.filename })
      }
    }

    archive.finalize()
  })
}

function scheduleCleanup(jobId: string) {
  setTimeout(async () => {
    const job = jobs.get(jobId)
    if (job) {
      const jobDir = path.join(TMP_ROOT, jobId)
      await fs.rm(jobDir, { recursive: true, force: true })
      jobs.delete(jobId)
    }
  }, CLEANUP_MS)
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id)
}

export function getJobPublic(id: string) {
  const job = jobs.get(id)
  if (!job) return null

  const totalOriginalSize = job.images.reduce((sum, img) => sum + img.originalSize, 0)
  const totalCompressedSize = job.images.reduce(
    (sum, img) => sum + (img.compressedSize || 0),
    0
  )

  return {
    id: job.id,
    status: job.status,
    progress: job.images.map((img) => ({
      filename: img.filename,
      status: img.status,
      originalSize: img.originalSize,
      compressedSize: img.compressedSize,
      error: img.error,
    })),
    totalOriginalSize,
    totalCompressedSize,
    downloadUrl: job.status === 'done' ? `/jobs/${job.id}/download` : null,
  }
}

export async function deleteJob(id: string): Promise<boolean> {
  const job = jobs.get(id)
  if (!job) return false

  const jobDir = path.join(TMP_ROOT, id)
  await fs.rm(jobDir, { recursive: true, force: true })
  jobs.delete(id)
  return true
}
