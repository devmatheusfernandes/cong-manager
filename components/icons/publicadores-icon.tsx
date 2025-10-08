import React from 'react';

interface PublicadoresIconProps {
  className?: string;
}

export function PublicadoresIcon({ className = "h-5 w-5" }: PublicadoresIconProps) {
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
        d="M24 28V25.3333C24 23.9188 23.4381 22.5623 22.4379 21.5621C21.4377 20.5619 20.0812 20 18.6667 20H8C6.58551 20 5.22896 20.5619 4.22876 21.5621C3.22857 22.5623 2.66667 23.9188 2.66667 25.3333V28" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M13.3333 14.6667C16.2789 14.6667 18.6667 12.2789 18.6667 9.33333C18.6667 6.38781 16.2789 4 13.3333 4C10.3878 4 8 6.38781 8 9.33333C8 12.2789 10.3878 14.6667 13.3333 14.6667Z" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M30.6667 28V25.3333C30.6662 24.2504 30.3019 23.1998 29.6281 22.3466C28.9543 21.4934 27.9998 20.8855 26.9333 20.6133" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M21.3333 4.61334C22.4003 4.88514 23.3555 5.49336 24.0297 6.34707C24.7039 7.20078 25.0684 8.25204 25.0684 9.33534C25.0684 10.4186 24.7039 11.4699 24.0297 12.3236C23.3555 13.1773 22.4003 13.7855 21.3333 14.0573" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}