import React from 'react';

interface FuriaLogoProps {
  className?: string;
}

const FuriaLogo: React.FC<FuriaLogoProps> = ({ className = "h-6 w-6" }) => {
  return (
    <img 
      src="/images/furia.png" 
      alt="FURIA Logo" 
      className={className}
    />
  );
};

export default FuriaLogo;