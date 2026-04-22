import { useEffect, useRef } from 'react'

// Polling hook — designed for Socket.io upgrade later
// Used for order status real-time updates (every 8 seconds)
export const usePolling = (callback, interval = 8000, enabled = true) => {
  const savedCallback = useRef(callback)
  useEffect(() => { savedCallback.current = callback }, [callback])

  useEffect(() => {
    if (!enabled) return
    savedCallback.current()
    const id = setInterval(() => savedCallback.current(), interval)
    return () => clearInterval(id)
  }, [interval, enabled])
}
