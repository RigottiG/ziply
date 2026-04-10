<script setup lang="ts">
import { ref } from 'vue'
import type { ImageFormat } from './types'
import { useJob } from './composables/useJob'
import SettingsPanel from './components/SettingsPanel.vue'
import UploadPanel from './components/UploadPanel.vue'

const format = ref<ImageFormat>('jpeg')
const quality = ref(80)

const {
  jobStatus,
  images,
  errorMessage,
  totalOriginalSize,
  totalCompressedSize,
  downloadUrl,
  submitJob,
  reset,
} = useJob()

const selectedFiles = ref<File[]>([])

function onFilesSelected(files: File[]) {
  selectedFiles.value = files
  submitJob(files, format.value, quality.value)
}

function onError(msg: string) {
  errorMessage.value = msg
}

function onRecompress() {
  if (selectedFiles.value.length > 0) {
    reset()
    submitJob(selectedFiles.value, format.value, quality.value)
  }
}
</script>

<template>
  <div class="min-h-screen bg-terminal-bg p-4 md:p-6">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-5">
      <div class="md:w-64 shrink-0">
        <SettingsPanel
          v-model:format="format"
          v-model:quality="quality"
          :disabled="jobStatus === 'uploading' || jobStatus === 'processing'"
          :show-recompress="jobStatus === 'done' && selectedFiles.length > 0"
          @recompress="onRecompress"
        />
      </div>
      <div class="flex-1 min-w-0">
        <UploadPanel
          :images="images"
          :job-status="jobStatus"
          :total-original-size="totalOriginalSize"
          :total-compressed-size="totalCompressedSize"
          :download-url="downloadUrl"
          :error-message="errorMessage"
          @files="onFilesSelected"
          @error="onError"
        />
      </div>
    </div>
  </div>
</template>
