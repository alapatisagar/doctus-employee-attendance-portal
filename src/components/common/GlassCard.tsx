import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'yellow' | 'red' | 'white' | 'gold';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'white',
  hoverEffect = true 
}) => {
  const baseStyle = "backdrop-blur-md rounded-2xl p-6 transition-all duration-300 border shadow-sm";
  
  const variantStyles = {
    white: "bg-white/80 dark:bg-neutral-900/80 border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100",
    yellow: "bg-gradient-to-br from-doctus-yellow/15 via-white/90 to-doctus-yellow-200/20 dark:from-doctus-yellow-900/30 dark:to-neutral-900 border-doctus-yellow/40 dark:border-doctus-yellow/30 shadow-glass",
    red: "bg-gradient-to-br from-doctus-red/10 via-white/90 to-doctus-red-100/20 dark:from-doctus-red-900/30 dark:to-neutral-900 border-doctus-red/30 dark:border-doctus-red/30 shadow-glass-red",
    gold: "bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 text-neutral-950 font-semibold shadow-md",
  };

  const hoverStyle = hoverEffect ? "hover:-translate-y-1 hover:shadow-md" : "";

  return (
    <div className={`${baseStyle} ${variantStyles[variant]} ${hoverStyle} ${className}`}>
      {children}
    </div>
  );
};
