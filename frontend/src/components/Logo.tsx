interface LogoProps {
  size?: number
  className?: string
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="FleetPulse logo"
    >
      <path d="M4 8 L4 32 L8 32 L8 22 L18 22 L18 18 L8 18 L8 12 L20 12 L20 8 Z" fill="currentColor" />
      <path d="M22 8 L22 32 L26 32 L26 22 L30 22 C34.4 22 37 19.5 37 15 C37 10.5 34.4 8 30 8 Z M26 12 L30 12 C31.9 12 33 13 33 15 C33 17 31.9 18 30 18 L26 18 Z" fill="currentColor" />
      <polyline
        points="4,37 10,37 12,31 15,39 17,34 20,37 36,37"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}
