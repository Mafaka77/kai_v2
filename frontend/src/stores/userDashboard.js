import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useUserDashboardStore = defineStore('userDashboard', {
  state: () => ({
    stats: {},
    loading: false,
    error: null
  }),
  actions: {
    async fetchStats(month = null, year = null) {
      this.loading = true
      this.error = null
      try {
        let url = '/dashboard/stats'
        if (month && year) {
          url += `?month=${month}&year=${year}`
        }
        const response = await api.get(url)
        console.log('UserDashboardStats API Response:', response.data)
        if (response.data && response.data.status === 'success') {
          this.stats = response.data.data || {}
        }
      } catch (err) {
        console.error('Failed to fetch user dashboard stats', err)
        this.error = err.message || 'Failed to fetch stats'
      } finally {
        this.loading = false
      }
    }
  }
})
