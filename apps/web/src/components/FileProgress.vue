<script setup lang="ts">
import type { ImageProgress } from '../types'

defineProps<{
  image: ImageProgress
}>()

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function reductionPercent(image: ImageProgress): string {
  if (!image.compressedSize) return ''
  const pct = Math.round((1 - image.compressedSize / image.originalSize) * 100)
  return `−${pct}%`
}

function progressWidth(image: ImageProgress): string {
  if (image.status === 'done') return '100%'
  if (image.status === 'compressing') return '55%'
  if (image.status === 'uploading') return `${image.uploadProgress}%`
  return '0%'
}

function progressColor(image: ImageProgress): string {
  if (image.status === 'done') return 'bg-terminal-green'
  if (image.status === 'compressing') return 'bg-terminal-green/70'
  if (image.status === 'uploading') return 'bg-terminal-green/50'
  if (image.status === 'error') return 'bg-terminal-error'
  return ''
}

function statusIcon(image: ImageProgress): string {
  if (image.status === 'done') return '✓'
  if (image.status === 'compressing') return '⟳'
  if (image.status === 'uploading') return '↑'
  if (image.status === 'error') return '✗'
  return '·'
}

function statusColor(image: ImageProgress): string {
  if (image.status === 'done') return 'text-terminal-green'
  if (image.status === 'compressing') return 'text-terminal-green/50'
  if (image.status === 'uploading') return 'text-terminal-green/50'
  if (image.status === 'error') return 'text-terminal-error'
  return 'text-terminal-dim'
}
</script>

<template>
  <div
    :class="[
      'bg-terminal-panel border rounded-sm px-3 py-2.5 flex items-center gap-2.5 transition-opacity',
      image.status === 'pending' ? 'border-terminal-border/50 opacity-40' : 'border-terminal-border',
    ]"
  >
    <div :class="['text-sm font-mono w-5 text-center', statusColor(image)]">
      {{ statusIcon(image) }}
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-terminal-text text-sm truncate">{{ image.filename }}</div>
      <div class="bg-terminal-border rounded-sm h-1 mt-1.5">
        <div
          :class="['h-1 rounded-sm transition-all duration-300', progressColor(image)]"
          :style="{ width: progressWidth(image) }"
        />
      </div>
    </div>
    <div class="text-right shrink-0">
      <template v-if="image.status === 'done'">
        <div class="text-terminal-green text-xs font-medium">
          {{ formatSize(image.originalSize) }}→{{ formatSize(image.compressedSize!) }}
        </div>
        <div class="text-terminal-dim text-xs">{{ reductionPercent(image) }}</div>
      </template>
      <template v-else-if="image.status === 'compressing'">
        <div class="text-terminal-muted text-xs">compressing…</div>
      </template>
      <template v-else-if="image.status === 'uploading'">
        <div class="text-terminal-muted text-xs">{{ image.uploadProgress }}%</div>
      </template>
      <template v-else-if="image.status === 'error'">
        <div class="text-terminal-error text-xs">error</div>
      </template>
      <template v-else>
        <div class="text-terminal-dim text-xs">pending…</div>
      </template>
    </div>
  </div>
</template>
