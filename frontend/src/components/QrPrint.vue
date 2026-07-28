<template>
  <!-- QR Print Modal Overlay -->
  <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="printable-qr-modal bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">

      <!-- Header (hidden on print) -->
      <div class="print-hide px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-slate-900 text-sm">Print QR Code</h3>
          <p class="text-xs text-slate-400 mt-0.5">{{ office?.name }}</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- QR Content (visible on screen + print) -->
      <div class="p-8 flex flex-col items-center gap-4 text-center">

        <!-- QR Code -->
        <div class="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-inner flex items-center justify-center">
          <QRCodeVue3
            v-if="qrValue"
            :value="qrValue"
            :width="220"
            :height="220"
            :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
            :imageOptions="{ hideBackgroundDots: true, imageSize: 0.4, margin: 0 }"
            :dotsOptions="{ type: 'square', color: '#1e293b' }"
            :backgroundOptions="{ color: '#ffffff' }"
            :cornersSquareOptions="{ type: 'extra-rounded', color: '#4f46e5' }"
            :cornersDotOptions="{ type: 'square', color: '#4f46e5' }"
          />
          <div v-else class="w-[220px] h-[220px] flex items-center justify-center text-slate-400 text-xs font-semibold">
            No QR code set
          </div>
        </div>

        <!-- Office Info -->
        <div class="space-y-1 w-full">
          <p class="font-bold text-slate-900 text-base leading-snug">{{ office?.name }}</p>
          <p v-if="office?.District?.name" class="text-slate-500 text-xs font-medium">{{ office.District.name }} District</p>
          <p v-if="qrValue" class="print-hide font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50/70 px-3 py-1 rounded-lg border border-indigo-100 mt-2 inline-block max-w-full truncate">
            {{ qrValue }}
          </p>
        </div>

      </div>

      <!-- Actions (hidden on print) -->
      <div class="print-hide px-6 pb-6 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
        >
          Close
        </button>
        <button
          @click="handlePrint"
          :disabled="!qrValue"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print QR
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QRCodeVue3 from 'qrcode-vue3'

const props = defineProps({
  office: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])

// Support both QrCode (Sequelize association) and qr_code (Laravel association)
const qrValue = computed(() => {
  return props.office?.QrCode?.code || props.office?.qr_code?.code || null
})

const handlePrint = () => {
  window.print()
}
</script>

<style>
@media print {
  /* Hide all elements on the page */
  body * {
    visibility: hidden !important;
  }

  /* Make the printable modal and all its inner children visible */
  .printable-qr-modal,
  .printable-qr-modal * {
    visibility: visible !important;
  }

  /* Position printable modal cleanly at top-center of printed paper */
  .printable-qr-modal {
    position: absolute !important;
    left: 50% !important;
    top: 2.5rem !important;
    transform: translateX(-50%) !important;
    width: 340px !important;
    max-width: 90% !important;
    background: #ffffff !important;
    box-shadow: none !important;
    border: 2px solid #e2e8f0 !important;
    border-radius: 1rem !important;
    padding: 0 !important;
  }

  /* Hide print action controls and header buttons */
  .print-hide {
    display: none !important;
  }
}
</style>
