'use client';

export function FishingRodIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 22 22 2" />
      <path d="M15 5l-3 3" />
      <path d="M18 2s2 2 2 5-2 5-2 5" />
    </svg>
  );
}
