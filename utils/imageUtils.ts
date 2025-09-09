export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URI prefix: "data:image/png;base64,"
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to read file as a base64 string."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getCroppedImg = (
  imageSrc: string,
  pixelCrop: PixelCrop
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous'; 
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Failed to get canvas context'));
      }
      
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Canvas is empty'));
          }
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const fileName = `cropped-image-${timestamp}.png`;
          // The AI model works best with PNGs, so we output as PNG.
          const file = new File([blob], fileName, { type: 'image/png' });
          resolve(file);
        },
        'image/png',
        1
      );
    };
    image.onerror = (error) => reject(error);
  });
};