/**
 * react-hook-form version of Register
 * Uses the same validator functions from utils/validators.js
 */
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/common/Toast'
import { validateEmail, validatePassword, validatePhone, validateName } from '../../utils/validators'

const FieldError = ({ message }) =>
  message ? <p className="text-red-500 text-xs mt-1">{message}</p> : null

export default function RegisterRHF() {
  const { register: authRegister, loading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' }) // validate on blur, re-validate on change after first blur

  const onSubmit = async (data) => {
    try {
      await authRegister({ name: data.name, email: data.email, number: data.number, password: data.password })
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <input
              className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              placeholder="Full Name"
              {...register('name', { validate: validateName })}
            />
            <FieldError message={errors.name?.message} />
          </div>

          {/* Email */}
          <div>
            <input
              className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              type="email"
              placeholder="Email Address"
              {...register('email', { validate: validateEmail })}
            />
            <FieldError message={errors.email?.message} />
          </div>

          {/* Phone */}
          <div>
            <div className={`flex border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary ${errors.number ? 'border-red-400' : 'border-gray-300'}`}>
              <span className="bg-gray-100 px-3 flex items-center text-sm text-gray-500 border-r border-gray-300 select-none">
                +977
              </span>
              <input
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                placeholder="98XXXXXXXX"
                maxLength={10}
                inputMode="numeric"
                {...register('number', {
                  validate: validatePhone,
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  },
                })}
              />
            </div>
            <FieldError message={errors.number?.message} />
          </div>

          {/* Password */}
          <div>
            <input
              className={`input-field ${errors.password ? 'border-red-400' : ''}`}
              type="password"
              placeholder="Password"
              {...register('password', { validate: validatePassword })}
            />
            <FieldError message={errors.password?.message} />
          </div>

          {/* Confirm Password */}
          <div>
            <input
              className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
              type="password"
              placeholder="Confirm Password"
              {...register('confirmPassword', {
                validate: (val) => val === watch('password') || 'Passwords do not match',
              })}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
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
