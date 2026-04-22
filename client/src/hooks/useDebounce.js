import { useState, useEffect } from 'react'

// Used for debounced search autocomplete
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
