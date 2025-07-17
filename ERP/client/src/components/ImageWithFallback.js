import React, { useState } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ImageWithFallback = ({ src, alt, fallbackSrc, className, style, ...props }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = (e) => {
    console.log('Image load error for:', src);
    setHasError(true);
    setIsLoading(false);
    
    const fallback = fallbackSrc || `${BASE_URL}/api/placeholder/400/300`;
    if (e.target.src !== fallback) {
      e.target.src = fallback;
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const getImageSrc = () => {
    if (!src) return fallbackSrc || `${BASE_URL}/api/placeholder/400/300`;
    
    // Handle external URLs (http/https)
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // Handle local uploads - ensure proper URL construction
    if (src.startsWith('/uploads/')) {
      return `${BASE_URL}${src}`;
    }
    
    // Handle uploads without leading slash
    if (src.includes('uploads/')) {
      return `${BASE_URL}/${src}`;
    }
    
    // Handle relative paths
    if (src.startsWith('/')) {
      return `${BASE_URL}${src}`;
    }
    
    // Default case - assume it's a full URL or valid path
    return src;
  };

  const imageStyles = {
    ...style,
    ...(isLoading && { filter: 'blur(2px)', opacity: 0.7 }),
    ...(hasError && { border: '2px dashed #ddd' })
  };

  return (
    <img 
      src={getImageSrc()} 
      alt={alt} 
      className={className}
      style={imageStyles}
      onError={handleImageError} 
      onLoad={handleImageLoad}
      {...props} 
    />
  );
};

export default ImageWithFallback;
