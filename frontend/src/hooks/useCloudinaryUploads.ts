import { useState } from 'react';

interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  secure_url: string;
}

interface UseCloudinaryUploadReturn {
  uploadImage: () => Promise<CloudinaryUploadResult | null>;
  isUploading: boolean;
  error: string | null;
}

export const useCloudinaryUpload = (): UseCloudinaryUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = (): Promise<CloudinaryUploadResult | null> => {
    return new Promise((resolve) => {
      setIsUploading(true);
      setError(null);

      // @ts-expect-error- Cloudinary widget is loaded via script tag
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: 'dmmntinwr', 
          uploadPreset: 'ml_default', 
          sources: ['local', 'camera'],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 10000000, // 10MB
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          theme: 'minimal',
          image_metadata: true,
          styles: {
            palette: {
              window: '#0a0e27',
              windowBorder: '#4158D0',
              tabIcon: '#FFD700',
              menuIcons: '#ffffff',
              textDark: '#000000',
              textLight: '#ffffff',
              link: '#4158D0',
              action: '#4158D0',
              inactiveTabIcon: '#8E9FBF',
              error: '#F44235',
              inProgress: '#4158D0',
              complete: '#20B832',
              sourceBg: '#1a1f3a'
            }
          }
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            setError('Failed to upload image. Please try again.');
            setIsUploading(false);
            resolve(null);
            return;
          }

          if (result.event === 'success') {
            const uploadResult: CloudinaryUploadResult = {
              url: result.info.url,
              publicId: result.info.public_id,
              secure_url: result.info.secure_url
            };
            setIsUploading(false);
            resolve(uploadResult);
            widget.close();
          }
        }
      );

      widget.open();

      // Handle widget close without upload
      const checkInterval = setInterval(() => {
        if (!document.querySelector('.cloudinary-widget')) {
          clearInterval(checkInterval);
          if (isUploading) {
            setIsUploading(false);
            resolve(null);
          }
        }
      }, 500);
    });
  };

  return { uploadImage, isUploading, error };
};