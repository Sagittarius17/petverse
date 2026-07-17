/**
 * Compresses an image file using the browser Canvas API.
 * Converts to WebP for maximum space savings with no perceptible quality loss.
 *
 * @param file      - The original image File object.
 * @param maxWidth  - Maximum width in pixels. Taller images are scaled down proportionally.
 * @param maxHeight - Maximum height in pixels.
 * @param quality   - WebP quality from 0 (worst) to 1 (best). 0.85 is a great sweet spot.
 * @returns         - A Promise that resolves to a base64 data URI of the compressed image.
 */
export function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while preserving aspect ratio
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width / maxWidth > height / maxHeight) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP for best compression. Falls back to JPEG if unsupported.
        const dataUrl = canvas.toDataURL('image/webp', quality);

        // If WebP is unsupported the browser returns 'image/png', so fall back to JPEG
        if (dataUrl.startsWith('data:image/webp')) {
          resolve(dataUrl);
        } else {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Avatar-specific compression: smaller max dimensions for profile pictures.
 */
export function compressAvatar(file: File): Promise<string> {
  return compressImage(file, 400, 400, 0.88);
}

/**
 * Chat image compression: moderate size, still good quality.
 */
export function compressChatImage(file: File): Promise<string> {
  return compressImage(file, 1280, 1280, 0.82);
}
