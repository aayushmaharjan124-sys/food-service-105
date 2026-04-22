import { useState, useCallback } from 'react'
import { validateEmail, validatePassword, validateConfirmPassword, validatePhone, validateName } from '../utils/validators'

const VALIDATORS = {
  name: (val) => validateName(val),
  email: (val) => validateEmail(val),
  password: (val) => validatePassword(val),
  confirmPassword: (val, allValues) => validateConfirmPassword(allValues.password, val),
  number: (val) => validatePhone(val),
}

export const useFormValidation = (initialValues) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Validate a single field
  const validateField = useCallback((name, value, allValues) => {
    const validator = VALIDATORS[name]
    return validator ? validator(value, allValues) : ''
  }, [])

  // Validate all fields at once — used on submit
  const validateAll = useCallback(() => {
    const newErrors = {}
    Object.keys(values).forEach((key) => {
      const error = validateField(key, values[key], values)
      if (error) newErrors[key] = error
    })
    setErrors(newErrors)
    setTouched(Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
    return Object.keys(newErrors).length === 0
  }, [values, validateField])

  // onChange — real-time validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    const updated = { ...values, [name]: value }
    setValues(updated)

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value, updated) }))
    }
  }, [values, touched, validateField])

  // onBlur — mark field as touched and validate
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, values) }))
  }, [values, validateField])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return { values, errors, touched, handleChange, handleBlur, validateAll, reset }
}
