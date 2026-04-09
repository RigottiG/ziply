<script setup lang="ts">
import type { ImageFormat } from '../types'

const props = defineProps<{
  modelValue: ImageFormat
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ImageFormat]
}>()

const formats: ImageFormat[] = ['jpeg', 'webp', 'png']
</script>

<template>
  <div>
    <div class="text-terminal-dim text-xs uppercase tracking-widest mb-2">$ format</div>
    <div class="flex gap-1.5">
      <button
        v-for="f in formats"
        :key="f"
        @click="emit('update:modelValue', f)"
        :class="[
          'px-4 py-1.5 text-sm rounded font-mono transition-colors',
          modelValue === f
            ? 'bg-terminal-green text-terminal-bg font-semibold'
            : 'bg-transparent border border-terminal-border-light text-terminal-muted hover:border-terminal-green hover:text-terminal-green',
        ]"
      >
        {{ f.toUpperCase() }}
      </button>
    </div>
  </div>
</template>
