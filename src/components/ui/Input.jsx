import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Input = forwardRef(({
  label,
  error,
  icon,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}, ref) => {
  const baseClasses = `
    w-full px-4 py-3 text-base
    bg-white border-2 border-gray-200 rounded-xl
    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
    transition-all duration-200
    placeholder:text-gray-400
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
    ${icon ? 'pl-12' : ''}
  `

  return (
    <motion.div
      className={`relative ${containerClassName}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <motion.label
          className="block text-sm font-medium text-gray-700 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {label}
        </motion.label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}

        <input
          ref={ref}
          type={type}
          className={`${baseClasses} ${className}`}
          {...props}
        />
      </div>

      {error && (
        <motion.p
          className="mt-2 text-sm text-red-600"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
})

Input.displayName = 'Input'

export default Input
