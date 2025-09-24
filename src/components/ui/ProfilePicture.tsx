import React from 'react';
import Image from 'next/image';

interface ProfilePictureProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Generate DiceBear Adventurer avatar using the person's name as seed
  const generateAvatarUrl = (name: string) => {
    const seed = encodeURIComponent(name.replace(/\s+/g, ''));
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  const avatarSrc = src || generateAvatarUrl(name);

  return (
    <div className={`${sizes[size]} ${className} rounded-full flex items-center justify-center overflow-hidden bg-gray-100`}>
      <Image
        src={avatarSrc}
        alt={name}
        width={64}
        height={64}
        className="w-full h-full object-cover"
        unoptimized
        onError={(e) => {
          // Fallback to a different seed if the first one fails
          const target = e.target as HTMLImageElement;
          target.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${Math.random().toString(36)}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
        }}
      />
    </div>
  );
};
