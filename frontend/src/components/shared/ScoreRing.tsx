import { motion } from 'framer-motion'

interface Props {
  score: number
  size?: number
  strokeWidth?: number
}

export default function ScoreRing({ score, size = 80, strokeWidth = 6 }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  
  // Red (<0.3), Amber (0.3-0.5), Violet (0.5-0.7), Emerald (>0.7)
  const getColor = (s: number) => {
    if (s >= 0.7) return 'var(--score-great, #059669)'
    if (s >= 0.5) return 'var(--score-good, #7C3AED)'
    if (s >= 0.3) return 'var(--score-mid, #D97706)'
    return 'var(--score-low, #DC2626)'
  }

  const strokeColor = getColor(score)
  const pct = Math.min(Math.max(score, 0), 1)

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle, rgba(0,0,0,0.06))"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - pct * circumference }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          strokeLinecap="round"
        />
      </svg>
      {/* Center text */}
      <span className="mono" style={{ position: 'absolute', fontWeight: 700, fontSize: size * 0.22, color: strokeColor }}>
        {Math.round(pct * 100)}
      </span>
    </div>
  )
}
