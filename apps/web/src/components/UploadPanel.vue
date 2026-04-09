<script setup lang="ts">
import type { ImageProgress } from '../types'
import DropZone from './DropZone.vue'
import FileProgress from './FileProgress.vue'
import DownloadCard from './DownloadCard.vue'

const props = defineProps<{
  images: ImageProgress[]
  jobStatus: 'idle' | 'uploading' | 'processing' | 'done' | 'error'
  totalOriginalSize: number
  totalCompressedSize: number
  downloadUrl: string | null
  errorMessage: string | null
}>()

const emit = defineEmits<{
  files: [files: File[]]
  error: [message: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <template v-if="jobStatus === 'idle' || jobStatus === 'uploading'">
      <DropZone @files="emit('files', $event)" @error="emit('error', $event)" />
    </template>

    <template v-if="images.length > 0">
      <div class="text-terminal-dim text-xs uppercase tracking-widest">$ progress</div>
      <div class="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
        <FileProgress v-for="img in images" :key="img.filename" :image="img" />
      </div>
    </template>

    <template v-if="jobStatus === 'uploading'">
      <div class="text-terminal-muted text-sm text-center">Uploading…</div>
    </template>

    <template v-if="errorMessage">
      <div class="bg-terminal-error/10 border border-terminal-error/30 rounded-sm p-3 text-terminal-error text-sm">
        {{ errorMessage }}
      </div>
    </template>

    <template v-if="jobStatus === 'done' && downloadUrl">
      <DownloadCard
        :total-original-size="totalOriginalSize"
        :total-compressed-size="totalCompressedSize"
        :file-count="images.filter((i) => i.status === 'done').length"
        :download-url="downloadUrl"
      />
    </template>
  </div>
</template>
