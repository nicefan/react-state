import { defineStore } from './myStore'
const store = defineStore({
  // name: '',
  initState: {
    count: 0
  },

  actions: {
    increment() {
      this.count += 1
    }
  }
})

export const useCounter = store.useModel
