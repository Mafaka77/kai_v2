import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const usePostingRequestStore = defineStore('postingRequest', {
  state: () => ({
    requests: [],
    loading: false,
    currentStatus: 'Submitted',
    pendingCount: 0,
    rejectTarget: null,
    rejectRemark: '',
    rejecting: false,
    pagination: {
      total: 0,
      page: 1,
      limit: 15,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  }),

  actions: {
    async fetchRequests() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        params.append('status', this.currentStatus)
        params.append('page',   this.pagination.page)
        params.append('limit',  this.pagination.limit)

        const response = await api.get(`/posting-requests?${params.toString()}`)
        if (response.data?.status === 'success') {
          this.requests = response.data.data
          if (response.data.pagination) this.pagination = response.data.pagination
        }
      } catch (error) {
        console.error('Failed to fetch posting requests', error)
      } finally {
        this.loading = false
      }
    },

    async fetchPendingCount() {
      try {
        const res = await api.get('/posting-requests?status=Submitted&limit=1')
        this.pendingCount = res.data?.pagination?.total || 0
      } catch {}
    },

    setStatus(val) {
      this.currentStatus = val
      this.pagination.page = 1
      this.fetchRequests()
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.pagination.page = newPage
      this.fetchRequests()
    },

    async handleApprove(id, toast) {
      if (!confirm('Are you sure you want to APPROVE this office change? The user will be reassigned immediately.')) return
      try {
        const response = await api.put(`/posting-requests/${id}/approve`)
        if (response.data?.status === 'success') {
          await this.fetchRequests()
          await this.fetchPendingCount()
          toast.success('Office change request approved successfully')
        } else {
          toast.error(response.data?.message || 'Error approving request')
        }
      } catch (error) {
        console.error('Error approving request', error)
        toast.error(error.response?.data?.message || 'Error approving request')
      }
    },

    openRejectModal(req) {
      this.rejectTarget = req
      this.rejectRemark = ''
    },

    async handleReject(toast) {
      if (!this.rejectTarget) return
      this.rejecting = true
      try {
        const response = await api.put(`/posting-requests/${this.rejectTarget.id}/reject`, { remark: this.rejectRemark })
        if (response.data?.status === 'success') {
          this.rejectTarget = null
          await this.fetchRequests()
          await this.fetchPendingCount()
          toast.success('Office change request rejected successfully')
        } else {
          toast.error(response.data?.message || 'Error rejecting request')
        }
      } catch (error) {
        console.error('Error rejecting request', error)
        toast.error(error.response?.data?.message || 'Error rejecting request')
      } finally {
        this.rejecting = false
      }
    }
  }
})
