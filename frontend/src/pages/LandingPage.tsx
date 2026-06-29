import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const nav = useNavigate()
  const accentColor = '#F97316'
  const glowColor = 'rgba(249, 115, 22, 0.5)'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#0A0A0A',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(15,15,15,1) 0%, rgba(5,5,5,1) 100%)'
    }}>
      {/* Animated orange glow background */}
      <motion.div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 1200,
        height: 700,
        background: `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 65%)`,
        pointerEvents: 'none'
      }} animate={{
        scale: [1, 1.1, 1],
        opacity: [0.6, 0.9, 0.6]
      }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />

      {/* Subtle circuit grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `linear-gradient(rgba(249,115,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
        opacity: 0.3
      }} />

      <motion.div style={{
        maxWidth: 800,
        width: '100%',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center'
      }} variants={containerVariants} initial="hidden" animate="visible">
        {/* Floating top badges */}
        <div style={{ position: 'absolute', top: '-110px', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <motion.div variants={itemVariants} style={{
            padding: '10px 20px',
            borderRadius: 9999,
            backgroundColor: 'rgba(15,15,15,0.95)',
            border: `1px solid ${accentColor}40`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: '#E5E7EB',
            fontWeight: 600
          }}>
            <i className="ti ti-tags" style={{ color: accentColor, fontSize: 18 }} />
            6-Signal Scoring
          </motion.div>

          <motion.div variants={itemVariants} style={{
            padding: '10px 20px',
            borderRadius: 9999,
            backgroundColor: 'rgba(15,15,15,0.95)',
            border: `1px solid ${accentColor}40`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: '#E5E7EB',
            fontWeight: 600
          }}>
            <i className="ti ti-diamond" style={{ color: accentColor, fontSize: 18 }} />
            Hidden Gems
          </motion.div>
        </div>

        {/* Floating bottom badges */}
        <div style={{ position: 'absolute', bottom: '-130px', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <motion.div variants={itemVariants} style={{
            padding: '10px 20px',
            borderRadius: 9999,
            backgroundColor: 'rgba(15,15,15,0.95)',
            border: `1px solid ${accentColor}40`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: '#E5E7EB',
            fontWeight: 600
          }}>
            <i className="ti ti-search" style={{ color: accentColor, fontSize: 18 }} />
            100K Candidates
          </motion.div>

          <motion.div variants={itemVariants} style={{
            padding: '10px 20px',
            borderRadius: 9999,
            backgroundColor: 'rgba(15,15,15,0.95)',
            border: `1px solid ${accentColor}40`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: '#E5E7EB',
            fontWeight: 600
          }}>
            <i className="ti ti-brain" style={{ color: accentColor, fontSize: 18 }} />
            AI-Powered
          </motion.div>
        </div>

        {/* Hero content */}
        <motion.div variants={itemVariants} style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Central glowing orb */}
          <div style={{
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, #FFFFFF 0%, ${accentColor} 30%, #7C2D12 70%, #1C1917 100%)`,
            boxShadow: `0 0 100px ${glowColor}, 0 0 200px ${accentColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24
          }}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: `3px solid ${accentColor}`,
              boxShadow: `0 0 30px ${glowColor}, inset 0 0 30px rgba(0,0,0,0.5)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: `linear-gradient(135deg, #FFFFFF 0%, ${accentColor} 100%)`,
                boxShadow: `0 0 40px ${glowColor}`
              }} />
            </div>
          </div>

          {/* Top badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 9999,
            border: `1px solid ${accentColor}40`,
            backgroundColor: `${accentColor}15`,
            marginBottom: 16
          }}>
            <i className="ti ti-sparkles" style={{ fontSize: 16, color: accentColor }} />
            <span style={{ fontSize: 13, color: '#FDBA74', fontWeight: 600 }}>Next Gen AI Hiring Protocol</span>
          </div>

          <h1 style={{
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            marginBottom: 12,
            color: '#FFFFFF'
          }}>
            SignalHire<br />
            <span style={{ background: 'linear-gradient(135deg, #FED7AA 0%, #F97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Beyond Keywords</span>
          </h1>

          <p style={{
            fontSize: 15,
            color: '#9CA3AF',
            maxWidth: 500,
            marginBottom: 32,
            lineHeight: 1.6
          }}>
            Enterprise-grade AI hiring infrastructure with 6-signal scoring, hidden gems discovery, and lightning-fast 100k+ candidate search.
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.button
              onClick={() => nav('/recruiter')}
              whileHover={{ scale: 1.05, boxShadow: `0 10px 40px ${glowColor}` }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF',
                color: '#0A0A0A',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <i className="ti ti-users" style={{ fontSize: 18 }} />
              Recruiter Dashboard
            </motion.button>

            <motion.button
              onClick={() => nav('/hidden-gems')}
              whileHover={{ scale: 1.05, boxShadow: `0 8px 30px ${accentColor}30` }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 9999,
                border: `1px solid ${accentColor}60`,
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: '#E5E7EB',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <i className="ti ti-diamond" style={{ fontSize: 18 }} />
              Hidden Gems
            </motion.button>

            <motion.button
              onClick={() => nav('/candidate')}
              whileHover={{ scale: 1.05, boxShadow: `0 8px 30px ${accentColor}30` }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 9999,
                border: `1px solid ${accentColor}60`,
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: '#E5E7EB',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <i className="ti ti-user-circle" style={{ fontSize: 18 }} />
              Candidate Portal
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
