import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/common/Toast'
import { useFormValidation } from '../../hooks/useFormValidation'

// Reusable error message component
const FieldError = ({ error, touched }) =>
  touched && error ? <p className="text-red-500 text-xs mt-1">{error}</p> : null

// Password strength indicator
const PasswordStrength = ({ password }) => {
  if (!password) return null
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']

  return (
    <div className="mt-1">
      <div className="flex gap-1">
        {checks.map((ok, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < score ? colors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs mt-0.5 ${colors[score - 1]?.replace('bg-', 'text-')}`}>
        {labels[score - 1] || ''}
      </p>
    </div>
  )
}

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation({
    name: '',
    email: '',
    number: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateAll()) return // block submit if any field invalid

    try {
      await register({
        name: values.name,
        email: values.email,
        number: values.number,
        password: values.password,
      })
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <input
              className={`input-field ${touched.name && errors.name ? 'border-red-400' : ''}`}
              name="name"
              placeholder="Full Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FieldError error={errors.name} touched={touched.name} />
          </div>

          {/* Email */}
          <div>
            <input
              className={`input-field ${touched.email && errors.email ? 'border-red-400' : ''}`}
              name="email"
              type="email"
              placeholder="Email Address"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FieldError error={errors.email} touched={touched.email} />
          </div>

          {/* Phone — +977 prefix fixed, user types 10 digits */}
          <div>
            <div className={`flex border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary ${touched.number && errors.number ? 'border-red-400' : 'border-gray-300'}`}>
              <span className="bg-gray-100 px-3 flex items-center text-sm text-gray-500 border-r border-gray-300 select-none">
                +977
              </span>
              <input
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                name="number"
                placeholder="98XXXXXXXX"
                value={values.number}
                onChange={(e) => {
                  // Only allow digits, max 10
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  handleChange(e)
                }}
                onBlur={handleBlur}
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            <FieldError error={errors.number} touched={touched.number} />
          </div>

          {/* Password */}
          <div>
            <input
              className={`input-field ${touched.password && errors.password ? 'border-red-400' : ''}`}
              name="password"
              type="password"
              placeholder="Password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <PasswordStrength password={values.password} />
            <FieldError error={errors.password} touched={touched.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <input
              className={`input-field ${touched.confirmPassword && errors.confirmPassword ? 'border-red-400' : ''}`}
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <FieldError error={errors.confirmPassword} touched={touched.confirmPassword} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Login now</Link>
        </p>
      </div>
    </div>
  )
}
