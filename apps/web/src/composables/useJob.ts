import { ref } from 'vue'
import type { ImageFormat, ImageProgress } from '../types'

const MAX_CONCURRENT_UPLOADS = 3

interface FileResult {
  filename: string
  status: string
  originalSize: number
  compressedSize: number | null
  error: string | null
}

export function useJob() {
  const jobStatus = ref<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle')
  const images = ref<ImageProgress[]>([])
  const errorMessage = ref<string | null>(null)
  const totalOriginalSize = ref(0)
  const totalCompressedSize = ref(0)
  const downloadUrl = ref<string | null>(null)
  const currentJobId = ref<string | null>(null)

  function uploadFileWithProgress(
    jobId: string,
    file: File,
    index: number
  ): Promise<FileResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          if (images.value[index]) {
            images.value[index].uploadProgress = pct
          }
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText) as FileResult
          resolve(result)
        } else {
          try {
            const body = JSON.parse(xhr.responseText)
            reject(new Error(body.error || 'Upload failed'))
          } catch {
            reject(new Error('Upload failed'))
          }
        }
      })

      xhr.addEventListener('error', () => reject(new Error('Network error')))
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

      xhr.open('POST', `/api/jobs/${jobId}/files`)
      xhr.send(formData)
    })
  }

  async function uploadFilesConcurrently(jobId: string, files: File[]) {
    let nextIndex = 0

    async function uploadNext(): Promise<void> {
      while (nextIndex < files.length) {
        const index = nextIndex++
        const file = files[index]

        try {
          const result = await uploadFileWithProgress(jobId, file, index)

          images.value[index] = {
            ...images.value[index],
            status: result.status === 'error' ? 'error' : 'done',
            compressedSize: result.compressedSize,
            error: result.error,
            uploadProgress: 100,
          }
        } catch (err: any) {
          images.value[index] = {
            ...images.value[index],
            status: 'error',
            error: err.message || 'Upload failed',
            uploadProgress: 0,
          }
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(MAX_CONCURRENT_UPLOADS, files.length) },
      () => uploadNext()
    )

    await Promise.all(workers)
  }

  async function submitJob(files: File[], format: ImageFormat, quality: number) {
    jobStatus.value = 'uploading'
    errorMessage.value = null
    totalOriginalSize.value = 0
    totalCompressedSize.value = 0
    downloadUrl.value = null

    images.value = files.map((f) => ({
      filename: f.name,
      status: 'uploading' as const,
      originalSize: f.size,
      compressedSize: null,
      error: null,
      uploadProgress: 0,
    }))

    try {
      const createRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, quality }),
      })

      if (!createRes.ok) {
        const body = await createRes.json()
        throw new Error(body.error || 'Failed to create job')
      }

      const { jobId } = (await createRes.json()) as { jobId: string }
      currentJobId.value = jobId

      await uploadFilesConcurrently(jobId, files)

      const hasSuccess = images.value.some((img) => img.status === 'done')
      if (!hasSuccess) {
        throw new Error('All uploads failed')
      }

      jobStatus.value = 'processing'

      const finalizeRes = await fetch(`/api/jobs/${jobId}/finalize`, {
        method: 'POST',
      })

      if (!finalizeRes.ok) {
        const body = await finalizeRes.json()
        throw new Error(body.error || 'Finalization failed')
      }

      const finalizeData = (await finalizeRes.json()) as {
        status: string
        downloadUrl: string | null
      }

      totalOriginalSize.value = images.value.reduce((s, i) => s + i.originalSize, 0)
      totalCompressedSize.value = images.value.reduce(
        (s, i) => s + (i.compressedSize || 0),
        0
      )

      jobStatus.value = finalizeData.status === 'done' ? 'done' : 'error'
      downloadUrl.value = finalizeData.downloadUrl
        ? `/api${finalizeData.downloadUrl}`
        : null

      if (jobStatus.value === 'error') {
        errorMessage.value = 'Processing failed'
      }
    } catch (err: any) {
      jobStatus.value = 'error'
      errorMessage.value = err.message || 'Upload failed'
    }
  }

  function reset() {
    jobStatus.value = 'idle'
    images.value = []
    errorMessage.value = null
    totalOriginalSize.value = 0
    totalCompressedSize.value = 0
    downloadUrl.value = null
    currentJobId.value = null
  }

  return {
    jobStatus,
    images,
    errorMessage,
    totalOriginalSize,
    totalCompressedSize,
    downloadUrl,
    currentJobId,
    submitJob,
    reset,
  }
}
