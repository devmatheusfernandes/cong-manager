import React from 'react';

interface DiscursoIconProps {
  className?: string;
}

export function DiscursoIcon({ className = "h-5 w-5" }: DiscursoIconProps) {
  return (
    <svg 
      width="31" 
      height="34" 
      viewBox="0 0 31 34" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M27 3.5H30V30H27M24 1V32.5H1V1H24Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <path 
        d="M8.5 25L5.34142 21.8414C5.21543 21.7154 5.30466 21.5 5.48284 21.5H19.0652C19.236 21.5 19.3282 21.7004 19.217 21.8302L16.5 25M12.5 19V15.5M7 19V16.618C7 16.2393 7.214 15.893 7.55279 15.7236L10.4645 14.2678C10.7927 14.1037 11 13.7682 11 13.4013C11 13.1443 10.8979 12.8979 10.7163 12.7163L10.4931 12.4931C9.85723 11.8572 9.5 10.9948 9.5 10.0955V9.77634C9.5 8.68768 10.1151 7.69246 11.0888 7.2056L11.2163 7.14184C12.0158 6.74208 12.9642 6.7785 13.7307 7.2384C14.5182 7.7109 15 8.56192 15 9.48028V10.0213C15 10.9681 14.6239 11.8761 13.9544 12.5456L13.7753 12.7247C13.599 12.901 13.5 13.14 13.5 13.3893C13.5 13.7607 13.7187 14.0972 14.0581 14.248L17.4061 15.7361C17.7673 15.8966 18 16.2547 18 16.6499V19" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
    </svg>
  );
}