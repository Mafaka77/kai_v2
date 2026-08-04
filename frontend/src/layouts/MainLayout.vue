<template>
  <div class="flex h-screen bg-slate-50 font-sans overflow-hidden">
    <!-- Sidebar -->
    <aside :class="[
      'bg-slate-900 text-slate-300 w-64 flex-shrink-0 flex flex-col transition-all duration-300 shadow-xl z-20',
      isSidebarOpen ? 'ml-0' : '-ml-64'
    ]">
      <div class="h-16 flex items-center justify-center border-b border-slate-800 shrink-0 px-4">
        <router-link to="/dashboard" class="bg-white/95 px-3 py-1.5 rounded-xl flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity">
          <img src="../assets/logo.png" alt="Lokai Logo" class="h-7 w-auto object-contain" />
        </router-link>
      </div>
      
      <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div class="text-[10px] font-bold text-slate-500 tracking-widest pl-3 mb-2 mt-2">MAIN</div>
        
        <router-link to="/dashboard" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Dashboard
        </router-link>

        <!-- Regular User Menu -->
        <template v-if="authStore.role !== 'Manager' && authStore.role !== 'Admin'">
          <div class="text-[10px] font-bold text-slate-500 tracking-widest pl-3 mb-2 mt-6">MY ATTENDANCE</div>

          <router-link to="/my-attendance" exact-active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Log Book
          </router-link>

          <router-link to="/my-attendance/history" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            History
          </router-link>

          <router-link to="/change-office" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            Change Office
          </router-link>

          <router-link to="/attendance-appeal" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Attendance Appeal
          </router-link>
        </template>

        <template v-if="authStore.role === 'Manager' || authStore.role === 'Admin'">
          <div class="text-[10px] font-bold text-slate-500 tracking-widest pl-3 mb-2 mt-6">ATTENDANCE</div>
          
          <router-link to="/attendances" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Log Book
          </router-link>

          <router-link to="/appeals" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Appeals
          </router-link>

          <router-link to="/late-list" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            3-Day Late List
          </router-link>
          
          <router-link to="/accounts" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 088 0z" /></svg>
            Accounts
          </router-link>

          <router-link to="/reports" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Reports
          </router-link>

          <router-link to="/posting-requests" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            Office Change
          </router-link>

          <router-link to="/leaves" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            e-Leave
          </router-link>

          <router-link to="/calendar" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Calendar
          </router-link>

          <router-link to="/notifications" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Push Notifications
          </router-link>

          <router-link to="/config" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Configuration
          </router-link>
        </template>

        <template v-if="authStore.role === 'Admin'">
          <div class="text-[10px] font-bold text-slate-500 tracking-widest pl-3 mb-2 mt-6">SYSTEM</div>
          
          <router-link to="/users" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </router-link>

          <!-- Districts link hidden for now -->

          <router-link to="/offices" active-class="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50" class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Offices
          </router-link>
        </template>
      </div>

      <!-- Sidebar Footer with Logout -->
      <div class="p-4 border-t border-slate-800 shrink-0">
        <button 
          @click="handleLogout" 
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors font-medium cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <TopBar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      
      <main class="flex-1 overflow-y-auto p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '../components/TopBar.vue'
import { useAuthStore } from '../stores/auth'
import { useDialogStore } from '../stores/dialog'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const dialog = useDialogStore()

// Closed on screen widths less than 1024px (lg breakpoint)
const checkIsMobile = () => window.innerWidth < 1024

const isSidebarOpen = ref(!checkIsMobile())

// Watch for route changes to close the sidebar on mobile devices
watch(() => route.path, () => {
  if (checkIsMobile()) {
    isSidebarOpen.value = false
  }
})

// Update sidebar state on window resize
const handleResize = () => {
  isSidebarOpen.value = !checkIsMobile()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleLogout = async () => {
  const ok = await dialog.confirm({
    title: 'Confirm Logout',
    message: 'Are you sure you want to log out of your account?',
    type: 'warning',
    confirmText: 'Log Out',
    cancelText: 'Cancel'
  })
  if (ok) {
    authStore.logout()
    router.push('/login')
  }
}
</script>
