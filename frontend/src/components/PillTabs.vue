<template>
  <div class="flex flex-wrap items-center gap-2">
    <button 
      v-for="tab in tabs" 
      :key="tab.value"
      @click="$emit('update:modelValue', tab.value)"
      class="px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-2 border select-none cursor-pointer"
      :class="[
        modelValue === tab.value
          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm ring-2 ring-indigo-500/10'
          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
      ]"
    >
      <span v-if="tab.icon" v-html="tab.icon" class="w-4 h-4 shrink-0" :class="modelValue === tab.value ? 'text-indigo-600' : 'text-slate-400'"></span>
      <span>{{ tab.label }}</span>
      <span 
        v-if="tab.badge !== undefined && tab.badge !== null" 
        class="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full"
        :class="modelValue === tab.value ? 'bg-indigo-200/60 text-indigo-800' : 'bg-slate-100 text-slate-600'"
      >
        {{ tab.badge }}
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true
  },
  modelValue: {
    type: [String, Number],
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>
