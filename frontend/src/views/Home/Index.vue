<template>
  <FrontLayout>
    <div id="home" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-8">
      
      <!-- HERO SECTION -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[500px]">
        
        <!-- Left Hero Content -->
        <div class="lg:col-span-6 space-y-8">
          
    
          <div class="space-y-4">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Attendance Management <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#191C51] via-indigo-600 to-[#00B4C6]">App</span>
            </h1>
            <p class="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              A one-of-a-kind attendance application designed for managing the attendance of government employees in Mizoram using QR codes and location geofencing.
            </p>
          </div>

          <!-- App Store Download Buttons -->
          <div class="space-y-3 pt-2">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Download Mobile App</p>
            
            <div class="flex flex-wrap items-center gap-4">
              <!-- PlayStore Button -->
              <a 
                href="https://play.google.com/store/apps/details?id=com.msegs.kai" 
                target="_blank"
                class="flex items-center gap-3 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-100 transition-all hover:-translate-y-0.5 group"
              >
                <svg class="w-6 h-6 text-emerald-600 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div class="text-left">
                  <p class="text-[10px] font-bold text-slate-400 uppercase leading-none">GET IT ON</p>
                  <p class="text-sm font-extrabold text-slate-800">Google Play</p>
                </div>
              </a>

              <!-- AppStore Button -->
              <a 
                href="https://apps.apple.com/in/app/kai-attendance/id6478542853" 
                target="_blank"
                class="flex items-center gap-3 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-100 transition-all hover:-translate-y-0.5 group"
              >
                <svg class="w-6 h-6 text-slate-900 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div class="text-left">
                  <p class="text-[10px] font-bold text-slate-400 uppercase leading-none">DOWNLOAD ON THE</p>
                  <p class="text-sm font-extrabold text-slate-800">App Store</p>
                </div>
              </a>
            </div>
          </div>

          <!-- Go to Dashboard CTA Card -->
          <div class="pt-4">
            <router-link 
              to="/login"
              class="group block p-6 bg-[#191C51] hover:bg-[#141743] rounded-3xl transition-all shadow-xl shadow-indigo-950/20 relative overflow-hidden text-white border border-indigo-900/40"
            >
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <span class="text-xs font-bold text-cyan-300 uppercase tracking-wider">Web Portal</span>
                  <h3 class="text-xl font-black text-white group-hover:text-cyan-200 transition-colors">Access HR Dashboard</h3>
                  <p class="text-xs text-slate-300">Sign in to manage employee attendance, appeals, and reports</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white transition-transform group-hover:translate-x-1 shadow-md shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </router-link>
          </div>

        </div>

        <!-- Right Hero Visual Cards -->
        <div class="lg:col-span-6 space-y-6">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div class="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100/80 hover:border-cyan-400 transition-all">
              <div class="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#008999] mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-slate-900 mb-1">Hassle Free</h3>
              <p class="text-xs text-slate-500 leading-relaxed">For users, scan with ease from your mobile device within office geofence.</p>
            </div>

            <div class="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100/80 hover:border-indigo-400 transition-all">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#191C51] mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-slate-900 mb-1">Easy to Manage</h3>
              <p class="text-xs text-slate-500 leading-relaxed">Admin can easily manage employee information and attendance records at the click of a button.</p>
            </div>

          </div>

          <!-- Highlight Banner Card (Cyan Vibrant Banner #1DEFFF equivalent) -->
          <div class="p-8 bg-gradient-to-br from-[#191C51] to-slate-900 rounded-3xl shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 text-white border border-cyan-500/30">
            <div class="space-y-2">
              <h3 class="text-xl font-black text-white">Discover New Ways to Manage Attendance</h3>
              <p class="text-xs text-cyan-200">Combined location intelligence & QR verification for maximum accuracy.</p>
            </div>
            <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shrink-0">
              📲
            </div>
          </div>

        </div>

      </section>

      <!-- USER GUIDE SECTION -->
      <section id="userguide" class="space-y-8 pt-8 border-t border-slate-200/80">
        
        <div class="text-center space-y-2 max-w-xl mx-auto">
          <h2 class="text-3xl font-black text-slate-900 tracking-tight">User Guide</h2>
          <div class="w-16 h-1.5 bg-[#00B4C6] mx-auto rounded-full"></div>
          <p class="text-xs text-slate-500">Watch the video tutorial and download step-by-step user manuals.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Video Tutorial -->
          <div class="lg:col-span-7 bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            <div class="relative aspect-video rounded-2xl overflow-hidden bg-slate-900">
              <iframe 
                class="w-full h-full"
                src="https://www.youtube.com/embed/tCjfV7uqbzE" 
                title="KAI - GoM User Guide" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
              ></iframe>
            </div>
          </div>

          <!-- User Manual Downloads -->
          <div class="lg:col-span-5 space-y-5">
            <div class="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 space-y-4">
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📄</span>
                <span>Download User Manual</span>
              </h3>
              <p class="text-xs text-slate-500">Official instruction guides for mobile app installation, account setup, and punching attendance.</p>
              
              <div class="space-y-3 pt-2">
                <!-- Mizo Manual -->
                <a 
                  href="/assets/images/UserManualMizo_v2.pdf" 
                  target="_blank"
                  class="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all group"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div>
                      <p class="text-xs font-bold text-slate-800">User Manual (Mizo Tawngin)</p>
                      <p class="text-[10px] text-slate-500">PDF Guide • Mizo Version</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-slate-400 group-hover:text-[#191C51] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>

                <!-- English Manual -->
                <a 
                  href="/assets/images/UserManualEnglish_v2.pdf" 
                  target="_blank"
                  class="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all group"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 text-[#191C51] flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div>
                      <p class="text-xs font-bold text-slate-800">User Manual (In English)</p>
                      <p class="text-[10px] text-slate-500">PDF Guide • English Version</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-slate-400 group-hover:text-[#191C51] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>

            </div>
          </div>

        </div>

      </section>

      <!-- FEATURES SECTION -->
      <section id="features" class="space-y-12 pt-8 border-t border-slate-200/80">
        
        <div class="text-center space-y-2 max-w-xl mx-auto">
          <h2 class="text-3xl font-black text-slate-900 tracking-tight">System Features</h2>
          <div class="w-16 h-1.5 bg-[#00B4C6] mx-auto rounded-full"></div>
          <p class="text-xs text-slate-500">Explore key tools built for state-wide workforce management.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- Feature 1 -->
          <div class="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 space-y-3 hover:border-cyan-400 transition-all">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-[#191C51] flex items-center justify-center text-xl">
              🎯
            </div>
            <h3 class="text-base font-bold text-slate-800">Attendance Punching</h3>
            <p class="text-xs text-slate-500 leading-relaxed">Allows user to punch their attendance. All records of each user can easily be shown.</p>
          </div>

          <!-- Feature 2 -->
          <div class="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 space-y-3 hover:border-cyan-400 transition-all">
            <div class="w-10 h-10 rounded-xl bg-cyan-50 text-[#008999] flex items-center justify-center text-xl">
              📱
            </div>
            <h3 class="text-base font-bold text-slate-800">Manage Device</h3>
            <p class="text-xs text-slate-500 leading-relaxed">User has the ability to change device (mobile) with permission of organization admin.</p>
          </div>

          <!-- Feature 3 -->
          <div class="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 space-y-3 hover:border-cyan-400 transition-all">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              👥
            </div>
            <h3 class="text-base font-bold text-slate-800">Employee Management</h3>
            <p class="text-xs text-slate-500 leading-relaxed">Organization administrator can manage their own employee information and office placements.</p>
          </div>

          <!-- Feature 4 -->
          <div class="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 space-y-3 hover:border-cyan-400 transition-all">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              🔔
            </div>
            <h3 class="text-base font-bold text-slate-800">Notification</h3>
            <p class="text-xs text-slate-500 leading-relaxed">Allow users to notify information and official broadcasts easily.</p>
          </div>

          <!-- Feature 5 -->
          <div class="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 space-y-3 hover:border-cyan-400 transition-all">
            <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
              📝
            </div>
            <h3 class="text-base font-bold text-slate-800">Integrated with e-Leave Mizoram</h3>
            <p class="text-xs text-slate-500 leading-relaxed">To efficiently manage and maintain records of users leave statuses seamlessly.</p>
          </div>

          <!-- Feature 6 -->
          <div class="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 space-y-3 hover:border-cyan-400 transition-all">
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
              📊
            </div>
            <h3 class="text-base font-bold text-slate-800">Reports & Analytics</h3>
            <p class="text-xs text-slate-500 leading-relaxed">Generate monthly attendance logs and reports for office administration.</p>
          </div>

        </div>

      </section>

      <!-- ABOUT SECTION -->
      <section id="about" class="pt-8 pb-12 border-t border-slate-200/80">
        <div class="p-8 sm:p-12 bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 space-y-6">
          
          <div class="space-y-2">
            <h2 class="text-3xl font-black text-slate-900">About the App</h2>
            <div class="w-16 h-1.5 bg-[#00B4C6] rounded-full"></div>
          </div>

          <div class="space-y-4 text-slate-600 text-sm leading-relaxed max-w-4xl">
            <p>
              <strong class="text-[#191C51]">Kai</strong>, the ultimate solution for effortless attendance tracking! Say goodbye to the hassle of traditional attendance systems and embrace the power of QR codes to streamline your attendance management process.
            </p>
            <p>
              Kai redefines attendance tracking by incorporating location intelligence into the process. Administrators can effortlessly generate QR codes paired with geofences for their office. This dual-layered approach ensures accurate attendance recording based on both QR code scans and participants' physical presence within designated areas.
            </p>
          </div>

        </div>
      </section>

    </div>
  </FrontLayout>
</template>

<script setup>
import FrontLayout from '../../layouts/FrontLayout.vue'
</script>
