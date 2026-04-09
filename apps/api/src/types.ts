export type ImageFormat = 'jpeg' | 'webp' | 'png'

export interface CompressInput {
  buffer: Buffer
  filename: string
  format: ImageFormat
  quality: number
}

export interface CompressOutput {
  filename: string
  compressedBuffer: Buffer
  originalSize: number
  compressedSize: number
  error: string | null
}

export type ImageStatus = 'pending' | 'compressing' | 'done' | 'error'

export interface ImageEntry {
  filename: string
  status: ImageStatus
  originalSize: number
  compressedSize: number | null
  compressedBuffer: Buffer | null
  error: string | null
}

export type JobStatus = 'processing' | 'done' | 'error'

export interface Job {
  id: string
  status: JobStatus
  format: ImageFormat
  quality: number
  images: ImageEntry[]
  createdAt: number
  zipPath: string | null
}
