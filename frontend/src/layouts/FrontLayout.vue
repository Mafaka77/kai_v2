<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-hidden">
    
    <!-- Background Ambient Glows (Matching Brand Colors) -->
    <div class="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-100/60 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header / Navbar -->
    <header 
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3' 
          : 'bg-transparent py-5'
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/80 transition-transform group-hover:scale-105">
            <img src="../assets/logo.png" alt="KAI Logo" class="h-8 w-auto object-contain" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-tight text-[#191C51] group-hover:text-cyan-600 transition-colors">KAI</span>
            <span class="text-[10px] font-bold text-[#00B4C6] uppercase tracking-wider">Attendance System</span>
          </div>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <router-link to="/#home" class="hover:text-[#191C51] transition-colors">Home</router-link>
          <router-link to="/#userguide" class="hover:text-[#191C51] transition-colors">User Guide</router-link>
          <router-link to="/#features" class="hover:text-[#191C51] transition-colors">Features</router-link>
          <router-link to="/#about" class="hover:text-[#191C51] transition-colors">About</router-link>
          <router-link to="/#statistics" class="hover:text-[#191C51] transition-colors">Statistics</router-link>
        </nav>

        <!-- Right Action Buttons -->
        <div class="flex items-center gap-4">
          <template v-if="token">
            <router-link 
              to="/dashboard" 
              class="px-4 py-2.5 bg-[#191C51] hover:bg-[#141743] text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-900/20 transition-all flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </router-link>
          </template>

          <template v-else>
            <router-link 
              to="/login" 
              class="px-5 py-2.5 bg-[#191C51] hover:bg-[#141743] text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-900/20 transition-all"
            >
              Sign In
            </router-link>
          </template>
        </div>

      </div>
    </header>

    <!-- Main Page Content -->
    <main class="flex-1 pt-24">
      <slot />
    </main>

    <!-- Footer (Signature Navy #191C51) -->
    <footer class="bg-[#191C51] text-slate-300 border-t border-indigo-900/50 pt-12 pb-8 text-xs relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pb-8 border-b border-indigo-900/60">
          
          <!-- Column 1: MSeGS Branding -->
          <div class="flex items-center gap-4">
            <div class="bg-white p-2 rounded-xl">
              <img src="../assets/logo.png" alt="MSeGS Logo" class="h-10 w-auto object-contain" />
            </div>
            <div>
              <p class="text-xs font-semibold text-cyan-300">Crafted with care by</p>
              <p class="text-sm font-bold text-white">Mizoram State e-Governance Society</p>
            </div>
          </div>

          <!-- Column 2: Help Desk Contact -->
          <div class="text-center md:text-left space-y-1">
            <span class="inline-block px-2.5 py-1 bg-white/10 border border-white/20 text-cyan-300 font-bold rounded-lg text-[11px] mb-1">
              Help Desk
            </span>
            <p class="font-medium text-white">support-msegs@mizoram.gov.in</p>
            <p class="font-semibold text-cyan-200">Phone: 0389-2913592</p>
          </div>

          <!-- Column 3: Quick Links -->
          <div class="flex flex-col md:items-end justify-center space-y-2">
            <div class="flex items-center gap-4 font-semibold text-slate-300">
              <router-link to="/privacy-policy" class="hover:text-cyan-300 transition-colors">Privacy Policy</router-link>
              <span>•</span>
              <router-link to="/terms-conditions" class="hover:text-cyan-300 transition-colors">Terms & Conditions</router-link>
            </div>
          </div>

        </div>

        <!-- Copyright Bottom -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-medium">
          <p>© {{ new Date().getFullYear() }} KAI - Government of Mizoram. All rights reserved.</p>
          <p class="flex items-center gap-1">
            <span>Powered by</span>
            <span class="font-bold text-white">MSeGS</span>
          </p>
        </div>

      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const token = ref(localStorage.getItem('token'))

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
