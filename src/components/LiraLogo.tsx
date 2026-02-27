// Lira AI brand logo — SVG mark + wordmark
// Usage: <LiraLogo /> | <LiraLogo size="sm" mark /> | <LiraLogo size="lg" />

interface LiraLogoProps {
  /** Include only the icon mark without the wordmark */
  mark?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { icon: 20, text: 14 },
  md: { icon: 28, text: 18 },
  lg: { icon: 40, text: 26 },
}

export function LiraLogo({ mark = false, size = 'md', className }: LiraLogoProps) {
  const s = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      {/* Icon mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lira-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#lira-g)" />
        <rect x="5" y="13" width="2.5" height="6" rx="1.25" fill="white" opacity="0.65" />
        <rect x="9" y="10" width="2.5" height="12" rx="1.25" fill="white" />
        <rect x="13" y="7" width="2.5" height="18" rx="1.25" fill="white" />
        <rect x="17" y="10" width="2.5" height="12" rx="1.25" fill="white" />
        <rect x="21" y="13" width="2.5" height="6" rx="1.25" fill="white" opacity="0.65" />
        <rect x="25" y="15" width="2.5" height="2" rx="1.25" fill="white" opacity="0.35" />
      </svg>

      {/* Wordmark */}
      {!mark && (
        <span style={{ fontSize: s.text }} className="font-semibold tracking-tight">
          Lira{' '}
          <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
            AI
          </span>
        </span>
      )}
    </div>
  )
}
