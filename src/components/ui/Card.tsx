import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'balance' | 'pending' | 'friend' | 'split';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  
  const variants = {
    default: 'bg-white border border-[var(--border)] shadow-sm hover:shadow-md',
    balance: 'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg',
    pending: 'bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-200',
    friend: 'bg-gradient-to-br from-green-100 to-blue-100 border border-green-200',
    split: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg'
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${variants[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
