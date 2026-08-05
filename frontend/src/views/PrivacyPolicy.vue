<template>
  <FrontLayout>
    <div class="relative min-h-screen bg-slate-50 overflow-hidden font-sans pb-32 pt-12">
      <!-- Decorative Background Blobs -->
      <div class="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none"></div>

      <div class="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        
        <!-- Page Header -->
        <div class="text-center mb-12">
        
          <h1 class="text-3xl lg:text-5xl font-black text-[#191C51] tracking-tight">Privacy Policy</h1>
          <p class="mt-3 text-sm text-slate-500 font-medium">Last updated: August 2026 • Mizoram State e-Governance Society (MSeGS)</p>
          <div class="h-1.5 w-20 bg-gradient-to-r from-[#00B4C6] to-indigo-600 rounded-full mx-auto mt-6"></div>
        </div>

        <!-- Document Body Card -->
        <div class="bg-white/90 backdrop-blur-xl p-8 lg:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 space-y-10 text-slate-700 leading-relaxed text-sm">
          
          <!-- Introduction -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">1.</span> Introduction & Purpose
            </h2>
            <p class="text-slate-600 leading-relaxed">
              The <strong>KAI Attendance System</strong> ("Application", "Service") is an official digital initiative developed and managed by the <strong>Mizoram State e-Governance Society (MSeGS)</strong> under the Government of Mizoram. This Privacy Policy outlines how we collect, process, store, and safeguard official data when government employees, staff, and authorized department managers utilize the KAI mobile and web applications for attendance tracking.
            </p>
          </section>

          <!-- Information Collected -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">2.</span> Information We Collect
            </h2>
            <p class="text-slate-600 mb-4">
              To verify official attendance and prevent fraudulent activity, the Service collects the following categories of information:
            </p>
            <ul class="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Personal Identifiers:</strong> Employee full name, official mobile phone number, department designation, and assigned office placement.</li>
              <li><strong>Hardware & Device Identifiers:</strong> Unique Device Identifier (UID), mobile hardware model, and operating system attributes required for hardware-to-account binding.</li>
              <li><strong>Location Data (Geofencing):</strong> Precise GPS coordinates (latitude and longitude) captured strictly during the attendance punching moment to validate physical presence within official designated office boundaries.</li>
              <li><strong>Attendance Logs & Timestamps:</strong> Exact sign-in and sign-out timestamps, office IP addresses, and attendance remarks submitted by users or department managers.</li>
              <li><strong>Push Notification Tokens:</strong> Firebase Cloud Messaging (FCM) tokens to deliver real-time system alerts, leave updates, and department notices.</li>
            </ul>
          </section>

          <!-- How We Use Information -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">3.</span> How We Use Your Information
            </h2>
            <p class="text-slate-600 mb-3">
              The collected information is strictly utilized for legitimate government administrative purposes:
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <h4 class="font-bold text-[#191C51] text-xs mb-1">Attendance Verification</h4>
                <p class="text-xs text-slate-500">Validating employee presence within official geofenced office coordinates during designated working hours.</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <h4 class="font-bold text-[#191C51] text-xs mb-1">Hardware Security Binding</h4>
                <p class="text-xs text-slate-500">Restricting attendance punches to single authorized mobile hardware devices per employee to prevent proxy sign-ins.</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <h4 class="font-bold text-[#191C51] text-xs mb-1">Departmental Reporting</h4>
                <p class="text-xs text-slate-500">Generating automated monthly attendance ledgers, late arrival statistics, and leave records for official payroll audit.</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <h4 class="font-bold text-[#191C51] text-xs mb-1">Communication & Notifications</h4>
                <p class="text-xs text-slate-500">Sending critical broadcast alerts, appeal status changes, and department announcements directly to employees.</p>
              </div>
            </div>
          </section>

          <!-- Data Protection & Security -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">4.</span> Data Security & Storage
            </h2>
            <p class="text-slate-600 leading-relaxed">
              We implement industry-standard encryption, role-based access controls (RBAC), and secure server infrastructure managed under government state data protocols. All database connections and API endpoints employ Transport Layer Security (TLS 1.3) encryption. Data is retained strictly in compliance with Mizoram State e-Governance Society archiving schedules.
            </p>
          </section>

          <!-- Disclosure to Third Parties -->
          <section>
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">5.</span> Information Sharing & Disclosure
            </h2>
            <p class="text-slate-600 leading-relaxed">
              We <strong>never sell, rent, or commercialize</strong> any user data. Information is shared strictly with authorized Government of Mizoram departmental administrators, audit bodies, or law enforcement authorities only when mandated by applicable state laws or court orders.
            </p>
          </section>

          <!-- User Rights & Contact -->
          <section class="border-t border-slate-100 pt-6">
            <h2 class="text-xl font-bold text-[#191C51] mb-3 flex items-center gap-2">
              <span class="text-[#00B4C6]">6.</span> Support & Inquiry Contact
            </h2>
            <p class="text-slate-600 mb-4">
              If you have any questions regarding this Privacy Policy or wish to request device unbinding or profile corrections, please contact our help desk:
            </p>
            <div class="p-5 bg-indigo-900 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 class="font-bold text-white text-base">Mizoram State e-Governance Society (MSeGS)</h4>
                <p class="text-xs text-cyan-300 mt-0.5">Government of Mizoram</p>
              </div>
              <div class="text-xs space-y-1 font-medium text-indigo-100">
                <p>📧 Email: <a href="mailto:support-msegs@mizoram.gov.in" class="underline hover:text-white">support-msegs@mizoram.gov.in</a></p>
                <p>📞 Help Desk Phone: 0389-2913592</p>
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
