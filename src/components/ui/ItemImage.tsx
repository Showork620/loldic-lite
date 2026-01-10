import React, { useState, useEffect } from 'react';
import { getItemImagePublicUrl } from '../../lib/supabase/supabaseStorage';
import { Icon } from './Icon';
import styles from './ItemImage.module.css';

interface ItemImageProps {
  imagePath: string;
  alt: string;
  size?: number;
  className?: string;
  onError?: () => void;
}

export const ItemImage: React.FC<ItemImageProps> = ({
  imagePath,
  alt,
  size = 32,
  className = '',
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (!imagePath) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Direct URL check
    if (imagePath.startsWith('http')) {
      setImageUrl(imagePath);
      setHasError(false);
      setIsLoading(true);
      return;
    }

    try {
      // Get public URL from Supabase storage
      const url = getItemImagePublicUrl(imagePath);
      setImageUrl(url);
      setHasError(false);
      setIsLoading(true);
    } catch (e) {
      console.error('Failed to get image URL:', e);
      setHasError(true);
      setIsLoading(false);
    }
  }, [imagePath]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div
      className={`${styles.container} ${className}`}
      style={containerStyle}
      role="img"
      aria-label={alt}
    >
      {isLoading && <div className={styles.loading} />}

      {!hasError ? (
        <img
          src={imageUrl}
          alt={alt}
          className={styles.image}
          onLoad={handleLoad}
          onError={handleError}
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      ) : (
        <div className={styles.fallback}>
          <Icon name="Image" size={size * 0.6} color="secondary" />
        </div>
      )}
    </div>
  );
};
