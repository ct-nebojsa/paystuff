import { defineStore } from 'pinia'

// In-memory only for this browser tab - intentionally has no `persist`
// option, so the log is gone on reload and never touches localStorage.
const useEventLogStore = defineStore('eventLog', {
    state: () => ({
        entries: [],
    }),
    actions: {
        log(entry) {
            this.entries.push({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                timestamp: Date.now(),
                ...entry,
            })
        },
        clear() {
            this.entries = []
        },
    },
})

export default useEventLogStore
