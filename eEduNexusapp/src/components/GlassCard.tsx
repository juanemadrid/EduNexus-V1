import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', animate = true, style }) => {
  return (
    <div 
      className={`glass-panel ${animate ? 'animate-fade' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassCard;
