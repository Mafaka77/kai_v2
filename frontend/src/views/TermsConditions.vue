<template>
  <FrontLayout>
    <div class="relative min-h-screen bg-slate-50 overflow-hidden font-sans pb-32 pt-12">
      <!-- Decorative Background Blobs -->
      <div class="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none"></div>

      <div class="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        
        <!-- Page Header -->
        <div class="text-center mb-12">
        
          <h1 class="text-3xl lg:text-5xl font-black text-[#191C51] tracking-tight">Terms & Conditions</h1>
          <p class="mt-3 text-sm text-slate-500 font-medium">Last updated: August 2026 • Mizoram State e-Governance Society (MSeGS)</p>
          <div class="h-1.5 w-20 bg-gradient-to-r from-[#00B4C6] to-indigo-600 rounded-full mx-auto mt-6"></div>
        </div>

        <!-- Document Body Card -->
        <div class="bg-white/90 backdrop-blur-xl p-8 lg:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 space-y-10 text-slate-700 leading-relaxed text-sm">
          
          <!-- Acceptance of Terms -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">1.</span> Acceptance of Terms
            </h2>
            <p class="text-slate-600 leading-relaxed">
              By downloading, installing, accessing, or using the <strong>KAI Attendance System</strong> mobile or web applications, you agree to be legally bound by these Terms & Conditions. This Service is operated by the <strong>Mizoram State e-Governance Society (MSeGS)</strong> on behalf of the Government of Mizoram for official attendance monitoring. If you do not agree to these terms, you must refrain from using the Application.
            </p>
          </section>

          <!-- User Responsibilities & Conduct -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">2.</span> User Conduct & Security
            </h2>
            <p class="text-slate-600 mb-3">
              As an authorized government employee or department user, you agree to:
            </p>
            <ul class="list-disc pl-6 space-y-2 text-slate-600">
              <li>Provide accurate personal identity information and official mobile number registered with your department.</li>
              <li>Maintain strict confidentiality of your login credentials and OTP verification codes.</li>
              <li>Refrain from attempting proxy sign-ins, GPS spoofing, mock location manipulation, or device tampering.</li>
              <li>Promptly report stolen, replaced, or upgraded mobile hardware to your department manager or MSeGS help desk for official device unbinding.</li>
            </ul>
          </section>

          <!-- Geofencing & Hardware Policies -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">3.</span> Geofencing & Hardware Binding Policy
            </h2>
            <div class="space-y-3 text-slate-600">
              <p>
                <strong>Geofence Bounds:</strong> Attendance sign-ins are validated against official office geofences configured by department administrators. Punching outside designated geofence perimeters will be recorded as invalid or subject to departmental appeal review.
              </p>
              <p>
                <strong>Single Device Binding:</strong> Each user account is strictly bound to a single registered mobile device hardware UID. Multiple logins or attendance attempts from unauthorized devices will be automatically flagged or rejected by the system.
              </p>
            </div>
          </section>

          <!-- System Modifications & Availability -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">4.</span> Service Availability & Updates
            </h2>
            <p class="text-slate-600 leading-relaxed">
              MSeGS reserves the right to modify, update, enhance, or temporarily suspend system operations for scheduled maintenance, database upgrades, or security enhancements. Official notifications will be broadcasted to users via push notifications or department bulletins.
            </p>
          </section>

          <!-- Intellectual Property -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">5.</span> Intellectual Property Rights
            </h2>
            <p class="text-slate-600 leading-relaxed">
              All software code, logos, visual designs, databases, and digital assets associated with KAI Attendance System are the exclusive intellectual property of the <strong>Mizoram State e-Governance Society (MSeGS)</strong> and the <strong>Government of Mizoram</strong>. Unauthorized reproduction, reverse engineering, or distribution is strictly prohibited under applicable Indian laws.
            </p>
          </section>

          <!-- Contact & Governing Law -->
          <section class="border-t border-slate-100 pt-6">
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">6.</span> Governing Law & Jurisdiction
            </h2>
            <p class="text-slate-600 mb-4">
              These Terms & Conditions shall be governed by and construed in accordance with the laws of India and the state of Mizoram. Any legal disputes arising out of the use of this service shall fall under the exclusive jurisdiction of the courts located in Aizawl, Mizoram.
            </p>
            <div class="p-5 bg-indigo-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 class="font-bold text-white text-base">Mizoram State e-Governance Society (MSeGS)</h4>
                <p class="text-xs text-cyan-300 mt-0.5">Government of Mizoram</p>
              </div>
              <div class="text-xs space-y-1 font-medium text-indigo-100">
                <p>📧 Email: <a href="mailto:support-msegs@mizoram.gov.in" class="underline hover:text-white">support-msegs@mizoram.gov.in</a></p>
                <p>📞 Phone: 0389-2913592</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  </FrontLayout>
</template>

<script setup>
import FrontLayout from '../layouts/FrontLayout.vue'
</script>
