import { useState, useEffect } from 'react'

let toastFn = null

export const toast = {
  success: (msg) => toastFn?.({ msg, type: 'success' }),
  error: (msg) => toastFn?.({ msg, type: 'error' }),
  info: (msg) => toastFn?.({ msg, type: 'info' }),
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastFn = ({ msg, type }) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, msg, type }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
    }
    return () => { toastFn = null }
  }, [])

  const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`${colors[t.type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm max-w-xs animate-fade-in`}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
