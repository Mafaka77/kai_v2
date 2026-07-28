<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
    
    <!-- Ambient Glowing Background Circles -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      
      <!-- Login Card -->
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 space-y-6">
        
        <!-- Header & Logo -->
        <div class="text-center space-y-2">
          <div class="inline-block p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm mb-1">
            <img src="../assets/logo.png" alt="Lokai Logo" class="h-14 w-auto mx-auto object-contain" />
          </div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
        
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          
          <!-- Error Alert Banner -->
          <div v-if="error" class="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 font-semibold animate-shake">
            <svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ error }}</span>
          </div>

          <!-- Mobile Input -->
          <div>
            <label for="mobile" class="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                id="mobile"
                v-model="mobile"
                type="text"
                maxlength="10"
                @input="mobile = mobile.replace(/\D/g, '').slice(0, 10)"
                required
                placeholder="Enter 10-digit mobile number"
                class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <!-- Password Input with Toggle -->
          <div>
            <label for="password" class="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Enter password"
                class="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
              />

              <!-- Password Toggle Button -->
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Toggle password visibility"
              >
                <!-- Eye Open (Hide Password) -->
                <svg v-if="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.68-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                </svg>
                <!-- Eye Closed (Show Password) -->
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                v-model="rememberMe"
                class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span class="text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">Remember me</span>
            </label>

            <button
              type="button"
              @click="openForgotPassword"
              class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>
      </div>

      <!-- Footer Note -->
      <p class="text-center text-xs text-slate-500 font-medium mt-6">
        Lokai HR Management System &copy; {{ new Date().getFullYear() }}
      </p>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
              🔑
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Reset Password</h3>
              <p class="text-[11px] text-slate-400">Step {{ resetStep }} of 3</p>
            </div>
          </div>

          <button @click="closeForgotModal" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5">
          
          <!-- Error alert -->
          <div v-if="forgotError" class="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl">
            {{ forgotError }}
          </div>

          <!-- STEP 1: Enter Mobile -->
          <div v-if="resetStep === 1" class="space-y-4">
            <p class="text-xs text-slate-500">
              Enter your registered mobile number below. We will send an SMS OTP to verify your identity.
            </p>
            
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
              <input
                v-model="resetMobile"
                type="text"
                maxlength="10"
                @input="resetMobile = resetMobile.replace(/\D/g, '').slice(0, 10)"
                required
                placeholder="Enter 10-digit mobile number"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <button
              @click="sendOtp"
              :disabled="sendingOtp"
              class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <svg v-if="sendingOtp" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ sendingOtp ? 'Sending OTP...' : 'Send Verification OTP' }}</span>
            </button>
          </div>

          <!-- STEP 2: Enter OTP -->
          <div v-else-if="resetStep === 2" class="space-y-4">
            <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-800">
              OTP sent to <span class="font-bold">{{ resetMobile }}</span>. Please enter the 4-digit code below.
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Enter 4-Digit OTP</label>
              <input
                v-model="resetOtp"
                type="text"
                maxlength="4"
                required
                placeholder="e.g. 1234"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button @click="resetStep = 1" type="button" class="text-indigo-600 font-semibold hover:underline cursor-pointer">
                Change Mobile
              </button>
              <button @click="sendOtp" :disabled="sendingOtp" type="button" class="text-slate-600 font-semibold hover:text-slate-800 cursor-pointer disabled:opacity-50">
                Resend OTP
              </button>
            </div>

            <button
              @click="verifyOtp"
              :disabled="verifyingOtp"
              class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <svg v-if="verifyingOtp" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ verifyingOtp ? 'Verifying...' : 'Verify OTP' }}</span>
            </button>
          </div>

          <!-- STEP 3: Enter New Password -->
          <div v-else-if="resetStep === 3" class="space-y-4">
            <p class="text-xs text-slate-500">
              Set a new password for your account.
            </p>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                v-model="newPassword"
                type="password"
                required
                placeholder="Enter at least 4 characters"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                placeholder="Re-enter new password"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>

            <button
              @click="submitNewPassword"
              :disabled="resettingPassword"
              class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <svg v-if="resettingPassword" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ resettingPassword ? 'Resetting Password...' : 'Save New Password' }}</span>
            </button>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import api from '../plugins/axios'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useNotificationStore()

const { loading, error } = storeToRefs(authStore)

const mobile = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

// Forgot Password State
const showForgotModal = ref(false)
const resetStep = ref(1) // 1: Send OTP, 2: Verify OTP, 3: Reset Password
const resetMobile = ref('')
const resetOtp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const forgotError = ref('')
const sendingOtp = ref(false)
const verifyingOtp = ref(false)
const resettingPassword = ref(false)

const handleLogin = async () => {
  const success = await authStore.login(mobile.value, password.value)
  if (success) {
    router.push('/dashboard')
  }
}

const openForgotPassword = () => {
  resetMobile.value = mobile.value || ''
  resetOtp.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  forgotError.value = ''
  resetStep.value = 1
  showForgotModal.value = true
}

const closeForgotModal = () => {
  showForgotModal.value = false
}

const sendOtp = async () => {
  forgotError.value = ''
  if (!resetMobile.value) {
    forgotError.value = 'Please enter your registered mobile number'
    return
  }
  sendingOtp.value = true
  try {
    const res = await api.post('/auth/send-otp', { mobile: resetMobile.value })
    if (res.data?.status === 'success') {
      toast.success('OTP sent successfully')
      resetStep.value = 2
    } else {
      forgotError.value = res.data?.message || 'Error sending OTP'
    }
  } catch (err) {
    forgotError.value = err.response?.data?.message || 'Failed to send OTP'
  } finally {
    sendingOtp.value = false
  }
}

const verifyOtp = async () => {
  forgotError.value = ''
  if (!resetOtp.value) {
    forgotError.value = 'Please enter the 4-digit OTP'
    return
  }
  verifyingOtp.value = true
  try {
    const res = await api.post('/auth/verify-otp', { mobile: resetMobile.value, otp: resetOtp.value })
    if (res.data?.status === 'success') {
      toast.success('OTP verified successfully')
      resetStep.value = 3
    } else {
      forgotError.value = res.data?.message || 'Invalid or expired OTP'
    }
  } catch (err) {
    forgotError.value = err.response?.data?.message || 'Invalid OTP'
  } finally {
    verifyingOtp.value = false
  }
}

const submitNewPassword = async () => {
  forgotError.value = ''
  if (!newPassword.value) {
    forgotError.value = 'Please enter your new password'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    forgotError.value = 'Passwords do not match'
    return
  }
  resettingPassword.value = true
  try {
    const res = await api.post('/auth/reset-password', {
      mobile: resetMobile.value,
      otp: resetOtp.value,
      newPassword: newPassword.value
    })
    if (res.data?.status === 'success') {
      toast.success('Password reset successfully. Please login with your new password.')
      mobile.value = resetMobile.value
      password.value = ''
      closeForgotModal()
    } else {
      forgotError.value = res.data?.message || 'Failed to reset password'
    }
  } catch (err) {
    forgotError.value = err.response?.data?.message || 'An error occurred while resetting password'
  } finally {
    resettingPassword.value = false
  }
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
