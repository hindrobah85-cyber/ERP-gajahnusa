import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const GajahNusaLogo: React.FC<LogoProps> = ({ 
  size = 50, 
  showText = true,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer circle - green background */}
        <circle cx="50" cy="50" r="48" fill="#27ae60" stroke="#f1c40f" strokeWidth="4"/>
        
        {/* Triangle - blue */}
        <path d="M 50 20 L 75 65 L 25 65 Z" fill="#2c3e50" stroke="#f1c40f" strokeWidth="2"/>
        
        {/* Star - yellow */}
        <path d="M 50 35 L 53 43 L 61 43 L 55 48 L 58 56 L 50 51 L 42 56 L 45 48 L 39 43 L 47 43 Z" 
              fill="#f1c40f"/>
      </svg>
      {showText && (
        <span className="text-2xl font-bold text-white tracking-wider">
          GAJAH NUSA
        </span>
      )}
    </div>
  );
};

export default GajahNusaLogo;
