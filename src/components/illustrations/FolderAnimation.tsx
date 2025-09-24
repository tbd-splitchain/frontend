import React from 'react';
import Image from 'next/image';

export const FolderAnimation: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Image 
        src="/folder.svg" 
        alt="Folder Animation" 
        width={400}
        height={300}
        className="w-full h-full object-contain svg-animated"
      />
    </div>
  );
};
