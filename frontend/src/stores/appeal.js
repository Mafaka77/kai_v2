import { defineStore } from 'pinia'
import api from '../plugins/axios'
import { useDialogStore } from './dialog'
import { useNotificationStore } from './notification'

export const useAppealStore = defineStore('appeal', {
  state: () => ({
    currentTab: 'late_reason',
    appeals: [],
    searchQuery: '',
    statusFilter: 'All',
    loading: false,
    processingId: null,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pagination: {
      total: 0,
      page: 1,
      limit: 15,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  }),

  getters: {
  },

  actions: {
    setTab(tabValue) {
      this.currentTab = tabValue
      this.pagination.page = 1
      return this.fetchAppeals()
    },

    setStatusFilter(status) {
      this.statusFilter = status
      this.pagination.page = 1
      return this.fetchAppeals()
    },

    async fetchAppeals() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        params.append('type', this.currentTab)
        params.append('page', this.pagination.page)
        params.append('limit', this.pagination.limit)
        if (this.searchQuery) {
          params.append('search', this.searchQuery)
        }
        if (this.statusFilter && this.statusFilter !== 'All') {
          params.append('status', this.statusFilter)
        }
        const response = await api.get(`/appeals?${params.toString()}`)
        console.log(response);
        if (response.data && response.data.status === 'success') {
          this.appeals = response.data.data
          if (response.data.counts) {
            this.pendingCount = response.data.counts.pending
            this.approvedCount = response.data.counts.approved
            this.rejectedCount = response.data.counts.rejected
          }
          if (response.data.pagination) {
            this.pagination = response.data.pagination
          }
        }
      } catch (error) {
        console.error('Failed to fetch appeals', error)
      } finally {
        this.loading = false
      }
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.pagination.page = newPage
      this.fetchAppeals()
    },

    async handleApprove(id) {
      const dialog = useDialogStore()
      const toast = useNotificationStore()
      const ok = await dialog.confirm({
        title: 'Approve Appeal Request',
        message: 'Are you sure you want to APPROVE this attendance appeal request?',
        type: 'info',
        confirmText: 'Approve'
      })
      if (!ok) return false

      this.processingId = id
      try {
        const response = await api.put(`/appeals/${id}/approve`)
        if (response.data && response.data.status === 'success') {
          toast.success(response.data?.message || 'Appeal approved successfully!')
          await this.fetchAppeals()
          return true
        } else {
          toast.error(response.data?.message || 'Error approving appeal')
          return false
        }
      } catch (error) {
        console.error('Failed to approve appeal', error)
        toast.error(error.response?.data?.message || 'An error occurred while approving appeal.')
        return false
      } finally {
        this.processingId = null
      }
    },

    async handleReject(id) {
      const dialog = useDialogStore()
      const toast = useNotificationStore()
      const ok = await dialog.confirm({
        title: 'Reject Appeal Request',
        message: 'Are you sure you want to REJECT this attendance appeal request?',
        type: 'danger',
        confirmText: 'Reject'
      })
      if (!ok) return false

      this.processingId = id
      try {
        const response = await api.put(`/appeals/${id}/reject`)
        if (response.data && response.data.status === 'success') {
          toast.success(response.data?.message || 'Appeal rejected successfully!')
          await this.fetchAppeals()
          return true
        } else {
          toast.error(response.data?.message || 'Error rejecting appeal')
          return false
        }
      } catch (error) {
        console.error('Failed to reject appeal', error)
        toast.error(error.response?.data?.message || 'An error occurred while rejecting appeal.')
        return false
      } finally {
        this.processingId = null
      }
    }
  }
})
