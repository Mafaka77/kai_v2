<template>
  <MainLayout>
    <div class="space-y-8">

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">System Configuration</h1>
          <p class="text-slate-500 mt-1 text-sm">
            Manage office attendance settings, geofence coordinates, QR codes, and working hours.
          </p>
        </div>
        <button
          v-if="isAdmin"
          @click="config.openGlobalModal()"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Global Settings (All Offices)
        </button>
      </div>

      <!-- Loading -->
      <div v-if="config.loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
        <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium">Loading configurations...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="config.offices.length === 0" class="bg-white rounded-2xl shadow-sm border border-slate-100 py-24 text-center text-slate-400">
        <svg class="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p class="font-bold text-slate-900 text-lg">No offices assigned</p>
        <p class="text-slate-400 text-sm mt-1">You do not have any offices to configure.</p>
      </div>

      <!-- Office Config Cards -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="office in config.offices"
          :key="office.id"
          class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Card Header -->
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-sm">{{ office.name }}</h3>
                <p class="text-xs text-slate-400">{{ office.District?.name || 'No District' }}</p>
              </div>
            </div>
            <button
              @click="config.openEdit(office)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Config
            </button>
          </div>

          <!-- Config Info Grid -->
          <div class="p-6 grid grid-cols-2 gap-x-6 gap-y-4 text-xs">

            <!-- QR Code — click to open print modal -->
            <div class="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
              <!-- Thumbnail QR (clickable) -->
              <button
                v-if="office.QrCode?.code"
                @click="selectedQrOffice = office"
                class="p-1.5 bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer shrink-0 group"
                title="Click to enlarge and print"
              >
                <QRCodeVue3
                  :value="office.QrCode.code"
                  :width="52"
                  :height="52"
                  :qrOptions="{ errorCorrectionLevel: 'H' }"
                  :dotsOptions="{ type: 'square', color: '#1e293b' }"
                  :backgroundOptions="{ color: '#ffffff' }"
                  :cornersSquareOptions="{ type: 'extra-rounded', color: '#4f46e5' }"
                  :cornersDotOptions="{ type: 'square', color: '#4f46e5' }"
                />
              </button>
              <div v-else class="p-2 bg-slate-100 rounded-lg border border-slate-200 shrink-0 w-[52px] h-[52px] flex items-center justify-center">
                <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>

              <!-- Code + Print button -->
              <div class="flex-1 min-w-0">
                <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px] mb-1">QR Code</span>
                <code v-if="office.QrCode" class="font-mono font-bold text-slate-800 text-[11px] block truncate">
                  {{ office.QrCode.code }}
                </code>
                <span v-else class="text-slate-400 italic text-xs">Not set</span>
              </div>

              <!-- Print button -->
              <button
                v-if="office.QrCode?.code"
                @click="selectedQrOffice = office"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 font-bold text-[11px] rounded-lg transition-all cursor-pointer shrink-0"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>

            <!-- Coordinates -->
            <div>
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px] mb-1">Latitude</span>
              <span class="font-bold text-slate-800">{{ office.lat || '—' }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px] mb-1">Longitude</span>
              <span class="font-bold text-slate-800">{{ office.lng || '—' }}</span>
            </div>

            <!-- Geofence -->
            <div>
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px] mb-1">Radius (m)</span>
              <span class="font-bold text-slate-800">{{ office.radius || '—' }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px] mb-1">Grace Period (min)</span>
              <span class="font-bold text-slate-800">{{ office.grace_period || '—' }}</span>
            </div>

            <!-- Working Hours -->
            <div>
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px] mb-1">Start Time</span>
              <span class="font-bold text-slate-800">{{ formatTime(office.start_time) }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px] mb-1">Close Time</span>
              <span class="font-bold text-slate-800">{{ formatTime(office.close_time) }}</span>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- Edit Config Modal -->
    <div v-if="config.editOffice" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-base">Edit Configuration</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ config.editOffice.name }}</p>
          </div>
          <button @click="config.closeEdit()" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitEdit" class="p-6 space-y-5">

          <!-- Office Name -->
          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1.5">Office Name *</label>
            <input v-model="config.editForm.name" type="text" required
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
          </div>

          <!-- District -->
          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1.5">District *</label>
            <select v-model="config.editForm.district_id" required
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
              <option value="" disabled>Select District...</option>
              <option v-for="d in config.districts" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>

          <!-- QR Code -->
          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1.5">QR Code</label>
            <input v-model="config.editForm.qr_code" type="text"
              placeholder="e.g. OFFICE-HQ-001"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
          </div>

          <!-- Coordinates -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5">Latitude *</label>
              <input v-model="config.editForm.lat" type="text" required placeholder="e.g. 25.5941"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5">Longitude *</label>
              <input v-model="config.editForm.lng" type="text" required placeholder="e.g. 91.8933"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
            </div>
          </div>

          <!-- Geofence -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                Radius (metres) *
                <span v-if="isAdmin" class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Admin</span>
              </label>
              <input v-model="config.editForm.radius" type="number" min="1" required placeholder="e.g. 100"
                :disabled="!isAdmin"
                :class="isAdmin
                  ? 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500'
                  : 'w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed opacity-60 focus:outline-none'" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                Grace Period (minutes) *
                <span v-if="isAdmin" class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Admin</span>
              </label>
              <input v-model="config.editForm.grace_period" type="number" min="0" required placeholder="e.g. 15"
                :disabled="!isAdmin"
                :class="isAdmin
                  ? 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500'
                  : 'w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed opacity-60 focus:outline-none'" />
            </div>
          </div>

          <!-- Working Hours -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                Start Time *
                <span v-if="isAdmin" class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Admin</span>
              </label>
              <input v-model="config.editForm.start_time" type="time" required
                :disabled="!isAdmin"
                :class="isAdmin
                  ? 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500'
                  : 'w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed opacity-60 focus:outline-none'" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                Close Time *
                <span v-if="isAdmin" class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Admin</span>
              </label>
              <input v-model="config.editForm.close_time" type="time" required
                :disabled="!isAdmin"
                :class="isAdmin
                  ? 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500'
                  : 'w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed opacity-60 focus:outline-none'" />
            </div>
          </div>

          <!-- Admin-only notice for Managers -->
          <div v-if="!isAdmin" class="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <span>Radius, Grace Period, Start Time, and Close Time can only be edited by an <strong>Admin</strong>.</span>
          </div>

          <!-- Error -->
          <div v-if="config.editError" class="px-3 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs rounded-xl">
            {{ config.editError }}
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" @click="editOffice = null"
              class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
              Cancel
            </button>
            <button type="submit" :disabled="config.saving"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50">
              {{ config.saving ? 'Saving...' : 'Save Configuration' }}
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- Global Config Modal -->
    <div v-if="config.showGlobalModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-base">Global Configuration</h3>
              <p class="text-xs text-slate-500 mt-0.5">Apply working hours, radius & grace period to all offices at once</p>
            </div>
          </div>
          <button @click="config.closeGlobalModal()" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitGlobalEdit" class="p-6 space-y-5">

          <!-- Working Hours -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5">Start Time *</label>
              <input v-model="config.globalForm.start_time" type="time" required
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5">Close Time *</label>
              <input v-model="config.globalForm.close_time" type="time" required
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
            </div>
          </div>

          <!-- Geofence & Grace -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5">Radius (metres) *</label>
              <input v-model="config.globalForm.radius" type="number" min="1" required placeholder="e.g. 100"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5">Grace Period (minutes) *</label>
              <input v-model="config.globalForm.grace_period" type="number" min="0" required placeholder="e.g. 15"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
            </div>
          </div>

          <!-- Info banner -->
          <div class="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
            <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>This will update Start Time, Close Time, Radius, and Grace Period for <strong>all system offices</strong>.</span>
          </div>

          <!-- Error -->
          <div v-if="config.globalError" class="px-3 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs rounded-xl">
            {{ config.globalError }}
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" @click="config.closeGlobalModal()"
              class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
              Cancel
            </button>
            <button type="submit" :disabled="config.globalSaving"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50">
              {{ config.globalSaving ? 'Applying...' : 'Apply to All Offices' }}
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- QR Print Modal -->
    <QrPrint
      v-if="selectedQrOffice"
      :office="selectedQrOffice"
      @close="selectedQrOffice = null"
    />

  </MainLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'
import { useAuthStore } from '../../stores/auth'
import { useConfigStore } from '../../stores/config'
import { useNotificationStore } from '../../stores/notification'
import QrPrint from '../../components/QrPrint.vue'
import QRCodeVue3 from 'qrcode-vue3'

const toast            = useNotificationStore()
const authStore        = useAuthStore()
const config           = useConfigStore()
const selectedQrOffice = ref(null)

const isAdmin = computed(() => authStore.role === 'Admin')

const formatTime = (t) => {
  if (!t) return '—'
  return t.slice(0, 5)
}

const submitEdit = () => config.submitEdit(toast)
const submitGlobalEdit = () => config.submitGlobalEdit(toast)

onMounted(() => {
  config.fetchConfig()
})
</script>
