<script setup lang="ts">
import { ref } from 'vue'
import { MAX_FILES, MAX_FILE_SIZE, ALLOWED_TYPES } from '../types'

const emit = defineEmits<{
  files: [files: File[]]
  error: [message: string]
}>()

const isDragging = ref(false)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files) {
    validateAndEmit(Array.from(e.dataTransfer.files))
  }
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    validateAndEmit(Array.from(input.files))
    input.value = ''
  }
}

function validateAndEmit(files: File[]) {
  if (files.length > MAX_FILES) {
    emit('error', `Max ${MAX_FILES} files allowed`)
    return
  }

  const invalid = files.find((f) => !ALLOWED_TYPES.includes(f.type))
  if (invalid) {
    emit('error', `Unsupported file type: ${invalid.name}`)
    return
  }

  const oversized = files.find((f) => f.size > MAX_FILE_SIZE)
  if (oversized) {
    emit('error', `File too large: ${oversized.name} (max 50MB)`)
    return
  }

  emit('files', files)
}
</script>

<template>
  <div>
    <div class="text-terminal-dim text-xs uppercase tracking-widest mb-2">$ upload</div>
    <div
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      :class="[
        'border border-dashed rounded-sm flex flex-col items-center justify-center py-10 px-6 transition-colors cursor-pointer',
        isDragging
          ? 'border-terminal-green bg-terminal-green/5'
          : 'border-terminal-border-light bg-terminal-panel',
      ]"
      @click="($refs.fileInput as HTMLInputElement).click()"
    >
      <div class="w-11 h-11 border border-terminal-border-light rounded-full flex items-center justify-center text-terminal-green text-xl mb-2">
        ↑
      </div>
      <div class="text-terminal-muted text-sm">
        Drop images or <span class="text-terminal-green underline cursor-pointer">browse</span>
      </div>
      <div class="text-terminal-dim text-xs mt-1">max {{ MAX_FILES }} files · 50MB each</div>
    </div>
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="onFileInput"
    />
  </div>
</template>
