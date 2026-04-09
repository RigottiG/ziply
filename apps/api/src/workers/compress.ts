import sharp from 'sharp'
import type { CompressInput, CompressOutput } from '../types.js'

export default async function compress(input: CompressInput): Promise<CompressOutput> {
  const { buffer, filename, format, quality } = input

  try {
    let pipeline = sharp(buffer)

    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality })
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality })
    } else {
      pipeline = pipeline.png()
    }

    const compressedBuffer = await pipeline.toBuffer()

    return {
      filename,
      compressedBuffer,
      originalSize: buffer.length,
      compressedSize: compressedBuffer.length,
      error: null,
    }
  } catch (err: any) {
    return {
      filename,
      compressedBuffer: Buffer.alloc(0),
      originalSize: buffer.length,
      compressedSize: 0,
      error: err.message || 'Unknown compression error',
    }
  }
}
