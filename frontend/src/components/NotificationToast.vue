<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
    <transition-group 
      name="toast" 
      tag="div" 
      class="flex flex-col gap-3 w-full"
    >
      <div 
        v-for="item in notifications" 
        :key="item.id"
        class="pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden transition-all duration-300 w-full"
      >
        <!-- Indicator Left Border -->
        <div 
          class="absolute left-0 top-0 bottom-0 w-1.5"
          :class="[
            item.type === 'success' ? 'bg-emerald-500' : '',
            item.type === 'error' ? 'bg-rose-500' : '',
            item.type === 'warning' ? 'bg-amber-500' : '',
            item.type === 'info' ? 'bg-indigo-500' : '',
          ]"
        ></div>

        <!-- Icons -->
        <div 
          class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          :class="[
            item.type === 'success' ? 'bg-emerald-50 text-emerald-600' : '',
            item.type === 'error' ? 'bg-rose-50 text-rose-600' : '',
            item.type === 'warning' ? 'bg-amber-50 text-amber-600' : '',
            item.type === 'info' ? 'bg-indigo-50 text-indigo-600' : '',
          ]"
        >
          <!-- Success: Check -->
          <svg v-if="item.type === 'success'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <!-- Error: Exclamation/X -->
          <svg v-else-if="item.type === 'error'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <!-- Warning: Exclamation -->
          <svg v-else-if="item.type === 'warning'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <!-- Info: Info bubble -->
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pr-4">
          <h4 class="font-bold text-slate-800 text-sm capitalize">
            {{ item.type === 'error' ? 'Failed' : item.type }}
          </h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ item.message }}</p>
        </div>

        <!-- Close Button -->
        <button 
          @click="remove(item.id)" 
          class="absolute top-3.5 right-3 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '../stores/notification'

const store = useNotificationStore()
const { notifications } = storeToRefs(store)
const remove = (id) => store.remove(id)
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
</style>
