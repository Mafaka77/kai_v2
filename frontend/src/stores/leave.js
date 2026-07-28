import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useLeaveStore = defineStore('leave', {
  state: () => ({
    leaves: [],
    offices: [],
    loading: false,
    selectedOfficeId: null,
    searchQuery: '',
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
    async fetchLeaves() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (this.selectedOfficeId) params.append('office_id', this.selectedOfficeId)
        if (this.searchQuery) params.append('search', this.searchQuery)
        params.append('page', this.pagination.page)
        params.append('limit', this.pagination.limit)

        const response = await api.get(`/leaves?${params.toString()}`)
        if (response.data?.status === 'success') {
          this.leaves = response.data.data
          this.offices = response.data.offices || []
          if (response.data.pagination) this.pagination = response.data.pagination
        }
      } catch (error) {
        console.error('Failed to fetch leave directory', error)
      } finally {
        this.loading = false
      }
    },

    setOffice(id) {
      this.selectedOfficeId = id
      this.pagination.page = 1
      this.fetchLeaves()
    },

    handleSearch() {
      this.pagination.page = 1
      this.fetchLeaves()
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.pagination.page = newPage
      this.fetchLeaves()
    }
  }
})
