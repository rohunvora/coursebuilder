import React from 'react'
import { motion } from 'framer-motion'

interface XPBarProps {
  currentXP: number
  maxXP: number
}

export default function XPBar({ currentXP, maxXP }: XPBarProps) {
  const percentage = Math.min((currentXP / maxXP) * 100, 100)

  return (
    <div className="relative">
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <motion.div
          className="h-full gradient-bg flex items-center justify-center relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
        </motion.div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700">
          {currentXP} / {maxXP} XP
        </span>
      </div>
    </div>
  )
}