import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useManagerDashboardStore = defineStore('managerDashboard', {
  state: () => ({
    processingDeviceId: null,
    processingAppealId: null,
    loading: false
  }),

  actions: {
    async approveAppeal(appealId, stats) {
      this.processingAppealId = appealId
      try {
        const response = await api.put(`/appeals/${appealId}/approve`)
        if (response.data && response.data.status === 'success') {
          if (stats && stats.recent_appeals) {
            stats.recent_appeals = stats.recent_appeals.filter(a => a.id !== appealId)
          }
          if (stats && stats.pending_appeals > 0) {
            stats.pending_appeals--
          }
        }
      } catch (error) {
        console.error('Failed to approve appeal', error)
      } finally {
        this.processingAppealId = null
      }
    },

    async rejectAppeal(appealId, stats) {
      this.processingAppealId = appealId
      try {
        const response = await api.put(`/appeals/${appealId}/reject`)
        if (response.data && response.data.status === 'success') {
          if (stats && stats.recent_appeals) {
            stats.recent_appeals = stats.recent_appeals.filter(a => a.id !== appealId)
          }
          if (stats && stats.pending_appeals > 0) {
            stats.pending_appeals--
          }
        }
      } catch (error) {
        console.error('Failed to reject appeal', error)
      } finally {
        this.processingAppealId = null
      }
    },

    async approveDevice(deviceId, stats) {
      this.processingDeviceId = deviceId
      try {
        const response = await api.put(`/accounts/devices/${deviceId}/approve`)
        if (response.data && response.data.status === 'success') {
          if (stats && stats.recent_device_requests) {
            stats.recent_device_requests = stats.recent_device_requests.filter(d => d.id !== deviceId)
          }
          if (stats && stats.pending_devices > 0) {
            stats.pending_devices--
          }
        }
      } catch (error) {
        console.error('Failed to approve device', error)
      } finally {
        this.processingDeviceId = null
      }
    },

    async rejectDevice(deviceId, stats) {
      this.processingDeviceId = deviceId
      try {
        const response = await api.put(`/accounts/devices/${deviceId}/reject`)
        if (response.data && response.data.status === 'success') {
          if (stats && stats.recent_device_requests) {
            stats.recent_device_requests = stats.recent_device_requests.filter(d => d.id !== deviceId)
          }
          if (stats && stats.pending_devices > 0) {
            stats.pending_devices--
          }
        }
      } catch (error) {
        console.error('Failed to reject device', error)
      } finally {
        this.processingDeviceId = null
      }
    }
  }
})
