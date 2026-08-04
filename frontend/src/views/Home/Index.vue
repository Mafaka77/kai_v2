<template>
  <FrontLayout>
    <div class="relative min-h-screen bg-slate-50 overflow-hidden font-sans pb-32">
      <!-- Decorative Background Blobs -->
      <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[100px] mix-blend-multiply animate-pulse"></div>
      <div class="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/20 blur-[120px] mix-blend-multiply animate-pulse" style="animation-delay: 2s"></div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-16">
        
        <!-- HERO SECTION -->
        <section class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <!-- Left Column -->
          <div class="flex-1 flex flex-col gap-10 z-10">
            <!-- Hero Card -->
            <div class="backdrop-blur-xl bg-white/60 p-8 lg:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
              <div class="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-6">
                <img src="/assets/images/qr-icon.png" class="w-10 h-10 object-contain" alt="QR" />
              </div>
              <h1 class="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                 Attendance Management App
              </h1>
              <p class="mt-6 text-lg text-slate-600 leading-relaxed font-medium max-w-lg">
                A one-of-a-kind application designed for effortless and secure attendance tracking of government employees in Mizoram.
              </p>
            </div>

            <!-- Download App -->
            <div class="pl-4 border-l-4 border-indigo-200">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Get the Mobile App</h3>
              <div class="flex flex-wrap items-center gap-4">
                <a href="https://play.google.com/store/apps/details?id=com.msegs.kai" target="_blank" class="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:ring-4 hover:ring-indigo-50 transition-all group">
                  <svg class="w-8 h-8 text-slate-700 group-hover:text-indigo-600 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Get it on</div>
                    <div class="text-sm font-black text-slate-800 leading-none">Playstore</div>
                  </div>
                </a>
                <a href="https://apps.apple.com/in/app/kai-attendance/id6478542853" target="_blank" class="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:ring-4 hover:ring-indigo-50 transition-all group">
                  <svg class="w-8 h-8 text-slate-700 group-hover:text-indigo-600 transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/></svg>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Download on the</div>
                    <div class="text-sm font-black text-slate-800 leading-none">AppStore</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Go to Dashboard -->
            <div class="pl-4 border-l-4 border-emerald-200 mt-2">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Web Portal</h3>
              <router-link to="/login" class="group block relative overflow-hidden rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1 bg-white p-2 max-w-sm">
                <img src="/assets/images/dashboard.png" class="w-full rounded-xl object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Dashboard" />
                <div class="absolute inset-0 flex items-center justify-center bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                  <div class="bg-white px-6 py-2 rounded-full font-bold text-emerald-600 shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    Open Dashboard 
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <!-- Right Column (Animated Graphics) -->
          <div class="flex-1 flex flex-col items-center justify-center relative z-10 w-full mt-12 lg:mt-0">
            <!-- Glass Banner 1 -->
            <div class="floating-slow flex items-center gap-5 p-5 bg-indigo-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-700/50 max-w-md w-full relative z-20 top-8 -left-4 lg:-left-12">
              <div class="p-3 bg-cyan-400/20 rounded-xl text-cyan-300">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              </div>
              <div>
                <h4 class="text-cyan-400 font-bold text-lg leading-tight">Hassle Free</h4>
                <p class="text-indigo-200 text-sm mt-1">Scan with ease directly from your mobile device.</p>
              </div>
            </div>

            <!-- Central Hero Graphic -->
            <div class="relative w-full max-w-md flex justify-center z-10">
              <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-full blur-[80px] opacity-40"></div>
              <img src="/assets/images/kai-app.png" class="w-64 lg:w-80 object-contain drop-shadow-2xl floating-fast relative z-10" alt="Kai App" />
            </div>

            <!-- Glass Banner 2 -->
            <div class="floating-slow-reverse flex items-center gap-5 p-5 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white max-w-md w-full relative z-20 bottom-12 left-4 lg:left-12">
              <div class="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 class="text-slate-800 font-bold text-lg leading-tight">Easy to Manage</h4>
                <p class="text-slate-500 text-sm mt-1">Admins control everything with a single click.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Divider -->
        <div class="py-24"></div>

        <!-- USER GUIDE SECTION -->
        <section id="userguide" class="scroll-mt-24">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Master the System</h2>
            <div class="h-1.5 w-24 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full mx-auto mt-6"></div>
          </div>

          <div class="flex flex-col lg:flex-row gap-12 items-start bg-white/60 backdrop-blur-xl p-8 lg:p-12 rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <!-- Video -->
            <div class="w-full lg:w-3/5">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Video Tutorial</h3>
              <div class="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white">
                <iframe class="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/tCjfV7uqbzE" title="KAI - GoM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
            </div>

            <!-- Manuals -->
            <div class="w-full lg:w-2/5 flex flex-col justify-center">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Download User Manuals</h3>
              <div class="space-y-4">
                <a href="/assets/images/UserManualMizo_v2.pdf" target="_blank" class="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all group transform hover:-translate-y-1">
                  <div class="bg-red-50 p-3 rounded-xl group-hover:bg-red-100 transition-colors">
                    <img src="/assets/images/pdf.svg" class="w-8 h-8" alt="PDF" />
                  </div>
                  <div>
                    <div class="font-bold text-slate-800 text-lg">Mizo Tawngin</div>
                    <div class="text-xs text-slate-500 font-medium mt-1">Official guide in Mizo</div>
                  </div>
                  <svg class="w-5 h-5 text-slate-300 ml-auto group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
                
                <a href="/assets/images/UserManualEnglish_v2.pdf" target="_blank" class="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all group transform hover:-translate-y-1">
                  <div class="bg-red-50 p-3 rounded-xl group-hover:bg-red-100 transition-colors">
                    <img src="/assets/images/pdf.svg" class="w-8 h-8" alt="PDF" />
                  </div>
                  <div>
                    <div class="font-bold text-slate-800 text-lg">In English</div>
                    <div class="text-xs text-slate-500 font-medium mt-1">Official guide in English</div>
                  </div>
                  <svg class="w-5 h-5 text-slate-300 ml-auto group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Divider -->
        <div class="py-24"></div>

        <!-- FEATURES SECTION -->
        <section id="feature" class="scroll-mt-24">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Powerful Features</h2>
            <div class="h-1.5 w-24 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full mx-auto mt-6"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            
            <div class="space-y-8">
              <!-- Feature 1 -->
              <div class="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-cyan-200 transition-all duration-300">
                <div class="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4">
                  <img src="/assets/images/qr-icon.png" class="w-6 h-6 object-contain" alt="" />
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">Smart Attendance</h3>
                <p class="text-sm text-slate-500 leading-relaxed">Allow users to punch their attendance instantly. All records for each user can easily be monitored.</p>
              </div>

              <!-- Feature 2 -->
              <div class="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300">
                <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <img src="/assets/images/qr-icon.png" class="w-6 h-6 object-contain" alt="" />
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">Device Management</h3>
                <p class="text-sm text-slate-500 leading-relaxed">Secure hardware bindings. Users can seamlessly request to change their designated mobile device.</p>
              </div>
            </div>

            <!-- Central Dashboard Graphic -->
            <div class="hidden lg:flex justify-center relative z-10 p-4">
              <div class="absolute inset-0 bg-indigo-500/10 rounded-full blur-[60px]"></div>
              <img src="/assets/images/dashboard.png" class="w-full max-w-[320px] object-contain drop-shadow-2xl floating-slow rounded-3xl overflow-hidden border-8 border-white/50" alt="Dashboard" />
            </div>

            <div class="space-y-8">
              <!-- Feature 3 -->
              <div class="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300">
                <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <img src="/assets/images/users.png" class="w-6 h-6 object-contain" alt="" />
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">Employee Control</h3>
                <p class="text-sm text-slate-500 leading-relaxed">Organization administrators can easily oversee and manage all data related to their own employees.</p>
              </div>

              <!-- Feature 4 -->
              <div class="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-200 transition-all duration-300">
                <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                  <img src="/assets/images/notification.png" class="w-6 h-6 object-contain" alt="" />
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">Live Notifications</h3>
                <p class="text-sm text-slate-500 leading-relaxed">Stay updated. Integrated system alerts and real-time push notifications keep everyone informed.</p>
              </div>
            </div>

          </div>
        </section>

        <!-- Divider -->
        <div class="py-24"></div>

        <!-- ABOUT SECTION -->
        <section id="about" class="scroll-mt-24">
          <div class="bg-indigo-900 rounded-[2.5rem] p-8 lg:p-16 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            
            <!-- Background Elements -->
            <div class="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 blur-[100px] rounded-full"></div>
            <div class="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/30 blur-[100px] rounded-full"></div>
            
            <!-- Left image breakout -->
            <div class="w-full lg:w-2/5 flex justify-center lg:justify-end relative z-10 pt-8 lg:pt-0">
              <img src="/assets/images/kai-app-combo.png" class="w-64 lg:w-80 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform lg:-mt-24" alt="Kai App Combo" />
            </div>

            <!-- Right Content -->
            <div class="w-full lg:w-3/5 relative z-10 text-white pb-8 lg:pb-0">
              <h2 class="text-3xl lg:text-5xl font-black text-white tracking-tight mb-8">
                About the App
                <div class="h-1.5 w-20 bg-cyan-400 rounded-full mt-6"></div>
              </h2>
              
              <div class="space-y-6 text-indigo-100 text-lg leading-relaxed font-medium">
                <p>
                  Kai is the ultimate solution for effortless attendance tracking! Say goodbye to the hassle of traditional attendance systems and embrace the power of QR codes to streamline your attendance management process.
                </p>
                <p>
                  We redefine tracking by incorporating location intelligence. Administrators can effortlessly generate QR codes paired with geofences for their office. This dual-layered approach ensures accurate attendance recording based on both QR scans and participants' physical presence within designated areas.
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  </FrontLayout>
</template>

<script setup>
import FrontLayout from '../../layouts/FrontLayout.vue'
</script>

<style scoped>
/* Keyframes for floating effects */
@keyframes floatFast {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

@keyframes floatSlow {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

@keyframes floatSlowReverse {
  0% { transform: translateY(0px); }
  50% { transform: translateY(8px); }
  100% { transform: translateY(0px); }
}

.floating-fast {
  animation: floatFast 4s ease-in-out infinite;
}

.floating-slow {
  animation: floatSlow 6s ease-in-out infinite;
}

.floating-slow-reverse {
  animation: floatSlowReverse 5s ease-in-out infinite;
}
</style>
