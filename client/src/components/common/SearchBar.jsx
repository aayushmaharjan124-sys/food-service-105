import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'
import { autocomplete } from '../../services/product.service'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 400)
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    if (debouncedQuery.length < 2) return setSuggestions([])
    autocomplete(debouncedQuery)
      .then(({ data }) => { setSuggestions(data); setOpen(true) })
      .catch(() => setSuggestions([]))
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  const handleSelect = (name) => {
    navigate(`/search?q=${encodeURIComponent(name)}`)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes..."
          className="input-field rounded-r-none text-sm"
        />
        <button type="submit" className="bg-primary text-white px-4 rounded-r-lg hover:bg-primary-dark">
          🔍
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.id || s._id}
              onClick={() => handleSelect(s.name)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between text-sm"
            >
              <span>{s.name}</span>
              <span className="text-gray-400 text-xs capitalize">{s.category}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
