// ─── Email ────────────────────────────────────────────────────────────────────
export const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
  return ''
}

// ─── Password ─────────────────────────────────────────────────────────────────
export const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain at least 1 lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number'
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return 'Password must contain at least 1 special character'
  return ''
}

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return ''
}

// ─── Nepal Phone (+977 prefix, user types 10 digits starting with 9) ──────────
export const validatePhone = (number) => {
  if (!number.trim()) return 'Phone number is required'
  if (!/^\d+$/.test(number)) return 'Only numbers are allowed'
  if (number.length !== 10) return 'Phone number must be exactly 10 digits'
  if (!number.startsWith('9')) return 'Phone number must start with 9'
  return ''
}

// ─── Name ─────────────────────────────────────────────────────────────────────
export const validateName = (name) => {
  if (!name.trim()) return 'Name is required'
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name must contain only letters'
  if (name.trim().length < 2) return 'Name must be at least 2 characters'
  return ''
}
