<script setup lang="ts">
import type { ImageFormat } from '../types'
import FormatSelector from './FormatSelector.vue'
import QualitySlider from './QualitySlider.vue'

const props = defineProps<{
  format: ImageFormat
  quality: number
  disabled: boolean
}>()

const emit = defineEmits<{
  'update:format': [value: ImageFormat]
  'update:quality': [value: number]
  compress: []
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="text-2xl font-extrabold tracking-tight">
      <span class="text-terminal-green">Zip</span><span class="text-terminal-text">ly</span>
    </div>

    <FormatSelector :model-value="format" @update:model-value="emit('update:format', $event)" />

    <QualitySlider :model-value="quality" @update:model-value="emit('update:quality', $event)" />

    <div class="mt-auto">
      <button
        @click="emit('compress')"
        :disabled="disabled"
        :class="[
          'w-full py-2.5 rounded-sm font-bold text-sm uppercase tracking-wider transition',
          disabled
            ? 'bg-terminal-border text-terminal-dim cursor-not-allowed'
            : 'bg-terminal-green text-terminal-bg hover:brightness-110',
        ]"
      >
        ▶ Compress
      </button>
    </div>
  </div>
</template>
