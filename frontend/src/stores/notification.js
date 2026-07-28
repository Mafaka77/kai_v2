import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),
  actions: {
    add({ message, type = 'info', duration = 4000 }) {
      const id = Date.now() + Math.random().toString(36).substr(2, 9)
      this.notifications.push({ id, message, type, duration })
      
      if (duration > 0) {
        setTimeout(() => {
          this.remove(id)
        }, duration)
      }
      return id
    },
    success(message, duration = 4000) {
      return this.add({ message, type: 'success', duration })
    },
    error(message, duration = 4000) {
      return this.add({ message, type: 'error', duration })
    },
    info(message, duration = 4000) {
      return this.add({ message, type: 'info', duration })
    },
    warning(message, duration = 4000) {
      return this.add({ message, type: 'warning', duration })
    },
    remove(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  }
})
