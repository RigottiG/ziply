<script setup lang="ts">
const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <div>
    <div class="flex justify-between text-xs uppercase tracking-widest mb-2">
      <span class="text-terminal-dim">$ quality</span>
      <span class="text-terminal-green">{{ modelValue }}%</span>
    </div>
    <input
      type="range"
      :min="70"
      :max="90"
      :value="modelValue"
      @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      class="w-full h-1.5 bg-terminal-border rounded-sm appearance-none cursor-pointer
             [&::-webkit-slider-thumb]:appearance-none
             [&::-webkit-slider-thumb]:w-3.5
             [&::-webkit-slider-thumb]:h-3.5
             [&::-webkit-slider-thumb]:rounded-full
             [&::-webkit-slider-thumb]:bg-terminal-green
             [&::-webkit-slider-thumb]:cursor-pointer"
    />
  </div>
</template>
