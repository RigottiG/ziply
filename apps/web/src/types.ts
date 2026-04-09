export type ImageFormat = 'jpeg' | 'webp' | 'png'

export interface ImageProgress {
  filename: string
  status: 'pending' | 'compressing' | 'done' | 'error'
  originalSize: number
  compressedSize: number | null
  error: string | null
}

export interface JobStatus {
  id: string
  status: 'uploading' | 'processing' | 'done' | 'error'
  progress: ImageProgress[]
  totalOriginalSize: number
  totalCompressedSize: number
  downloadUrl: string | null
}

export interface CompressOptions {
  format: ImageFormat
  quality: number
}

export const MAX_FILES = 100
export const MAX_FILE_SIZE = 50 * 1024 * 1024
export const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/avif',
  'image/svg+xml',
]
