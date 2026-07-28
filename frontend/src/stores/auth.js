import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    loading: false,
    error: ''
  }),

  actions: {
    async login(mobile, password) {
      this.loading = true
      this.error = ''
      
      try {
        const response = await api.post('/auth/login', { mobile, password })
        const data = response.data
        
        if (data.status === 'success') {
          this.token = data.data.token
          this.user = data.data.user
          this.role = data.data.user.role || 'User'
          
          localStorage.setItem('token', data.data.token)
          localStorage.setItem('user', JSON.stringify(data.data.user))
          localStorage.setItem('role', this.role)
          return true
        } else {
          this.error = data.message || 'Invalid credentials'
          return false
        }
      } catch (err) {
        console.error('Login error:', err)
        this.error = err.response?.data?.message || 'Network error. Is the Fastify backend running?'
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    }
  }
})
