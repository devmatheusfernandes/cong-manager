import React from 'react';

interface PregacaoIconProps {
  className?: string;
}

export function PregacaoIcon({ className = "h-5 w-5" }: PregacaoIconProps) {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1Z" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M16 7V16L22 19" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}