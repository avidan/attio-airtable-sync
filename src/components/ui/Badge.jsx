import React from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200'
}

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  animate = true,
  ...props
}) {
  const baseClasses = `
    inline-flex items-center
    font-medium rounded-full border
    ${variants[variant]}
    ${sizes[size]}
  `

  const Component = animate ? motion.span : 'span'
  const animationProps = animate ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2, ease: "easeOut" }
  } : {}

  return (
    <Component
      className={`${baseClasses} ${className}`}
      {...animationProps}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </Component>
  )
}
