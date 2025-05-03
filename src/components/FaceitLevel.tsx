import React from 'react';

interface FaceitLevelProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

const FaceitLevel: React.FC<FaceitLevelProps> = ({ level, size = 'md' }) => {
  // Tamanhos diferentes para o ícone
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <img
      src={`/images/faceit/lvl${level}.svg`}
      alt={`Nível ${level}`}
      className={`${sizeClasses[size]} object-contain`}
    />
  );
};

export default FaceitLevel; 