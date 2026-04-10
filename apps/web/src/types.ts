export type ImageFormat = 'jpeg' | 'webp' | 'png'

export type ImageStatus = 'uploading' | 'pending' | 'compressing' | 'done' | 'error'

export interface ImageProgress {
  filename: string
  status: ImageStatus
  originalSize: number
  compressedSize: number | null
  error: string | null
  uploadProgress: number
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
