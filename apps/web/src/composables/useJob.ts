import { ref } from 'vue'
import type { ImageFormat, ImageProgress } from '../types'

interface ApiResponse {
  jobId: string
}

interface JobPollResponse {
  id: string
  status: 'processing' | 'done' | 'error'
  progress: ImageProgress[]
  totalOriginalSize: number
  totalCompressedSize: number
  downloadUrl: string | null
}

export function useJob() {
  const jobStatus = ref<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle')
  const images = ref<ImageProgress[]>([])
  const errorMessage = ref<string | null>(null)
  const totalOriginalSize = ref(0)
  const totalCompressedSize = ref(0)
  const downloadUrl = ref<string | null>(null)

  let pollInterval: ReturnType<typeof setInterval> | null = null

  async function submitJob(files: File[], format: ImageFormat, quality: number) {
    jobStatus.value = 'uploading'
    errorMessage.value = null
    images.value = files.map((f) => ({
      filename: f.name,
      status: 'pending' as const,
      originalSize: f.size,
      compressedSize: null,
      error: null,
    }))

    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    formData.append('format', format)
    formData.append('quality', String(quality))

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Upload failed')
      }

      const { jobId } = (await res.json()) as ApiResponse
      jobStatus.value = 'processing'
      startPolling(jobId)
    } catch (err: any) {
      jobStatus.value = 'error'
      errorMessage.value = err.message || 'Upload failed'
    }
  }

  function startPolling(jobId: string) {
    if (pollInterval) clearInterval(pollInterval)

    pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        if (!res.ok) throw new Error('Poll failed')

        const data = (await res.json()) as JobPollResponse
        images.value = data.progress
        totalOriginalSize.value = data.totalOriginalSize
        totalCompressedSize.value = data.totalCompressedSize

        if (data.status === 'done') {
          stopPolling()
          jobStatus.value = 'done'
          downloadUrl.value = `/api${data.downloadUrl}`
        } else if (data.status === 'error') {
          stopPolling()
          jobStatus.value = 'error'
          errorMessage.value = 'Processing failed'
        }
      } catch {
        stopPolling()
        jobStatus.value = 'error'
        errorMessage.value = 'Connection lost'
      }
    }, 500)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  function reset() {
    stopPolling()
    jobStatus.value = 'idle'
    images.value = []
    errorMessage.value = null
    totalOriginalSize.value = 0
    totalCompressedSize.value = 0
    downloadUrl.value = null
  }

  return {
    jobStatus,
    images,
    errorMessage,
    totalOriginalSize,
    totalCompressedSize,
    downloadUrl,
    submitJob,
    reset,
  }
}
