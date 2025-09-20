import React from 'react'
import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover = true,
  gradient = false,
  padding = 'lg',
  ...props
}) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  const baseClasses = `
    bg-white rounded-2xl shadow-lg border border-gray-100/50
    backdrop-blur-sm
    ${gradient ? 'bg-gradient-to-br from-white to-gray-50/30' : ''}
    ${paddingClasses[padding]}
  `

  const hoverProps = hover ? {
    whileHover: {
      scale: 1.01,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
    },
    transition: { type: "spring", stiffness: 300, damping: 20 }
  } : {}

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...hoverProps}
      {...props}
    >
      {children}
    </motion.div>
  )
}
