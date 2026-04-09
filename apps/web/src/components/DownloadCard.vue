<script setup lang="ts">
defineProps<{
  totalOriginalSize: number
  totalCompressedSize: number
  fileCount: number
  downloadUrl: string
}>()

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function reductionPercent(original: number, compressed: number): string {
  return `−${Math.round((1 - compressed / original) * 100)}%`
}
</script>

<template>
  <div class="bg-terminal-panel border border-terminal-green/30 rounded-sm p-5 text-center">
    <div class="text-terminal-green text-sm mb-3">
      {{ fileCount }} files ·
      {{ formatSize(totalOriginalSize) }} → {{ formatSize(totalCompressedSize) }} ·
      {{ reductionPercent(totalOriginalSize, totalCompressedSize) }}
    </div>
    <a
      :href="downloadUrl"
      class="inline-block bg-terminal-green text-terminal-bg font-bold text-sm uppercase tracking-wider px-6 py-2.5 rounded-sm hover:brightness-110 transition"
    >
      ⬇ Download ZIP
    </a>
  </div>
</template>
