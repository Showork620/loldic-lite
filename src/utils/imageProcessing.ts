// Utility functions for image processing

/**
 * 画像をCanvasでリサイズし、WebPに変換する
 * @param file - 元の画像ファイル
 * @param targetWidth - 目標の幅 (デフォルト: 32px)
 * @param targetHeight - 目標の高さ (デフォルト: 32px)
 * @param quality - WebPの品質 (デフォルト: 0.9)
 * @returns WebP形式のBlob
 */
export async function resizeAndConvertToWebP(
  file: File | Blob,
  targetWidth: number = 32,
  targetHeight: number = 32,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // 画像を描画
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // WebPに変換
      canvas.toBlob(
        blob => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * URLから画像を取得してBlobに変換
 * @param url - 画像のURL
 * @returns 画像のBlob
 */
export async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return response.blob();
}
