import { AppSettings } from '../services/api';

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a file against the configured media upload settings
 *
 * @param file The file to validate
 * @param mediaSettings The media settings from the application settings
 * @returns A validation result with isValid flag and any error messages
 */
export function validateFile(
  file: File,
  mediaSettings: AppSettings['media']
): FileValidationResult {
  const errors: string[] = [];

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > mediaSettings.maxUploadSize) {
    errors.push(
      `File size exceeds the maximum allowed size of ${mediaSettings.maxUploadSize}MB`
    );
  }

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!mediaSettings.allowedFileTypes.includes(fileExtension)) {
    errors.push(
      `File type .${fileExtension} is not allowed. Allowed types: ${mediaSettings.allowedFileTypes.join(', ')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Compresses an image based on the configured quality settings
 *
 * @param imageFile The image file to compress
 * @param quality The quality percentage (0-100)
 * @returns Promise resolving to a Blob of the compressed image
 */
export async function compressImage(
  imageFile: File,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality / 100
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}
