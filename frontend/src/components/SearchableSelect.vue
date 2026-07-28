<template>
  <div class="relative w-full" ref="containerRef">
    <!-- Trigger / Input Button -->
    <div
      @click="toggleDropdown"
      class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium flex items-center justify-between gap-2 cursor-pointer hover:border-slate-300 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-all"
    >
      <input
        type="text"
        v-model="searchQuery"
        @focus="openDropdown"
        @input="openDropdown"
        :placeholder="selectedLabel || placeholder"
        class="w-full bg-transparent outline-none text-xs text-slate-800 placeholder-slate-400 cursor-text"
      />
      <div class="flex items-center gap-1 shrink-0">
        <button
          v-if="modelValue"
          type="button"
          @click.stop="clearSelection"
          class="text-slate-400 hover:text-slate-600 p-0.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <svg
          :class="['w-4 h-4 text-slate-400 transition-transform duration-200', isOpen ? 'rotate-180' : '']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Dropdown List Panel -->
    <div
      v-if="isOpen"
      class="absolute z-50 left-0 right-0 mt-1 max-h-56 bg-white border border-slate-100 rounded-xl shadow-xl overflow-y-auto py-1 divide-y divide-slate-50"
    >
      <div v-if="filteredOptions.length === 0" class="px-4 py-3 text-xs text-slate-400 italic text-center">
        No matching offices found
      </div>
      <div
        v-for="opt in filteredOptions"
        :key="opt.id"
        @click="selectOption(opt)"
        :class="[
          'px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors',
          opt.id == modelValue ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'
        ]"
      >
        <span>{{ opt.name }}</span>
        <svg v-if="opt.id == modelValue" class="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Search & select office...' },
  required: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const containerRef = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')

const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  const found = props.options.find(o => o.id == props.modelValue)
  return found ? found.name : ''
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options.slice(0, 30)
  const q = searchQuery.value.toLowerCase().trim()
  return props.options.filter(o => o.name && o.name.toLowerCase().includes(q))
})

const openDropdown = () => {
  isOpen.value = true
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (opt) => {
  emit('update:modelValue', opt.id)
  searchQuery.value = ''
  isOpen.value = false
}

const clearSelection = () => {
  emit('update:modelValue', '')
  searchQuery.value = ''
}

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

watch(() => props.modelValue, (val) => {
  if (!val) searchQuery.value = ''
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
