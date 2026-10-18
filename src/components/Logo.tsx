import { useId } from 'react'

export default function Logo({ height = 28, className = '' }: { height?: number; className?: string }) {
  const grad = useId()
  return (
    <svg
      role="img"
      aria-label="NUVA"
      viewBox="0 0 98 44"
      height={height}
      width={(height * 98) / 44}
      className={className}
    >
      <defs>
        <linearGradient id={grad} x1="22" y1="0" x2="76" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F2F7FA" />
          <stop offset="1" stopColor="#23D5E7" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${grad})`}
        d="M22 12.5C32 2.5 42 2.6 50 7.2C58 11.8 67 13.2 76 8C68 15.2 58 14.4 49.4 9.8C41 5.4 32 5 22 12.5Z"
      />
      <path
        d="M8 40V20L22 40V20M30 20V33A7 7 0 0 0 44 33V20M52 20L59 40L66 20M75 40L82 20L89 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}
