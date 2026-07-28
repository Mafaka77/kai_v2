<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
      @click.self="handleCancel"
    >
      <div
        class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5 transform transition-all relative overflow-hidden"
      >
        <!-- Top Accent Bar -->
        <div
          class="absolute top-0 left-0 right-0 h-1.5"
          :class="[
            type === 'danger' ? 'bg-rose-500' : '',
            type === 'warning' ? 'bg-amber-500' : '',
            type === 'success' ? 'bg-emerald-500' : '',
            type === 'info' ? 'bg-indigo-500' : ''
          ]"
        ></div>

        <!-- Header with Icon & Title -->
        <div class="flex items-start gap-4">
          <!-- Icon Circle -->
          <div
            class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            :class="[
              type === 'danger' ? 'bg-rose-50 text-rose-600 border border-rose-100' : '',
              type === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-100' : '',
              type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : '',
              type === 'info' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : ''
            ]"
          >
            <!-- Danger Icon -->
            <svg v-if="type === 'danger'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <!-- Warning Icon -->
            <svg v-else-if="type === 'warning'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <!-- Success Icon -->
            <svg v-else-if="type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Info Icon -->
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Content Title & Message -->
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-slate-900 leading-snug">
              {{ title }}
            </h3>
            <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {{ message }}
            </p>
          </div>
        </div>

        <!-- Action Buttons Footer -->
        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            v-if="!isAlert"
            type="button"
            @click="handleCancel"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            {{ cancelText }}
          </button>

          <button
            type="button"
            @click="handleConfirm"
            :class="[
              'px-4 py-2 font-bold text-xs text-white rounded-xl shadow-md transition-all cursor-pointer',
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : '',
              type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : '',
              type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : '',
              type === 'info' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : ''
            ]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useDialogStore } from '../stores/dialog'

const store = useDialogStore()

const {
  isOpen,
  title,
  message,
  type,
  confirmText,
  cancelText,
  isAlert
} = storeToRefs(store)

const handleConfirm = () => store.handleConfirm()
const handleCancel = () => store.handleCancel()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
