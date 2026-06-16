interface LogoProps {
  size?: number
  className?: string
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="FleetPulse logo"
    >
      {/* Truck cargo box */}
      <rect x="15" y="55" width="95" height="75" rx="8" fill="currentColor" />
      {/* Cab section */}
      <path d="M110 72 L110 130 L165 130 L165 98 L148 72 Z" fill="currentColor" />
      {/* Cab window cutout */}
      <path d="M116 78 L116 112 L158 112 L158 99 L143 78 Z" fill="currentColor" opacity="0.2" />
      {/* Cargo door line */}
      <line x1="66" y1="60" x2="66" y2="126" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      {/* Rear wheel */}
      <circle cx="46" cy="138" r="20" fill="currentColor" opacity="0.25" />
      <circle cx="46" cy="138" r="11" fill="currentColor" />
      <circle cx="46" cy="138" r="4" fill="currentColor" opacity="0.2" />
      {/* Front wheel */}
      <circle cx="142" cy="138" r="20" fill="currentColor" opacity="0.25" />
      <circle cx="142" cy="138" r="11" fill="currentColor" />
      <circle cx="142" cy="138" r="4" fill="currentColor" opacity="0.2" />
      {/* ECG pulse — the "Pulse" in FleetPulse */}
      <polyline
        points="8,172 34,172 46,150 58,188 68,162 80,172 192,172"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
