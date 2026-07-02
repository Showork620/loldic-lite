import React, { useMemo, useState } from 'react';
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
  const imageUrl = useMemo(() => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    try {
      return getItemImagePublicUrl(imagePath);
    } catch (e) {
      console.error('Failed to get image URL:', e);
      return null;
    }
  }, [imagePath]);

  const [isLoading, setIsLoading] = useState(imageUrl !== null);
  const [hasError, setHasError] = useState(imageUrl === null);
  const [prevUrl, setPrevUrl] = useState(imageUrl);

  // URLが変わったらロード状態をリセット（レンダー中のstate調整パターン）
  if (prevUrl !== imageUrl) {
    setPrevUrl(imageUrl);
    setIsLoading(imageUrl !== null);
    setHasError(imageUrl === null);
  }

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

      {!hasError && imageUrl ? (
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
