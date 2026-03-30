import React, { useState } from 'react';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ className = '', src, alt, fallback, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`avatar-spinner-wrapper flex-shrink-0 ${className}`}>
      {/* Image */}
      <img
        {...props}
        src={src}
        alt={alt || "Avatar"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        data-loaded={loaded}
        className={`w-full h-full object-cover relative z-10 transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${error ? 'hidden' : 'block'}`}
        style={{ backgroundColor: loaded ? 'inherit' : 'transparent' }}
      />
      
      {/* Fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-gray-500 bg-gray-800">
          {fallback || <svg className="w-1/2 h-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        </div>
      )}
    </div>
  );
};

export default Avatar;
