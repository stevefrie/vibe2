import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop/types';
import { getCroppedImg } from '../utils/imageUtils';

interface ImageCropperProps {
  imageSrc: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels) {
      console.error("Crop data is not available.");
      return;
    }
    setIsProcessing(true);
    try {
      const croppedImageFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );
      onConfirm(croppedImageFile);
    } catch (e) {
      console.error("Error cropping image:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-secondary rounded-lg shadow-lg" role="dialog" aria-labelledby="crop-title" aria-modal="true">
      <h2 id="crop-title" className="text-2xl font-bold text-text-primary mb-2">Crop & Zoom Your Image</h2>
      <p className="text-text-secondary mb-6 text-center">Select the area you want the AI to edit. Use the slider to zoom.</p>
      
      <div className="relative w-full h-96 bg-background/50 rounded-md border border-gray-700">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { borderRadius: '0.375rem' },
          }}
        />
      </div>

      <div className="w-full max-w-md mt-6 space-y-4">
        <div className="flex items-center gap-4">
          <label htmlFor="zoom-slider" className="text-text-secondary">Zoom:</label>
          <input
            id="zoom-slider"
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-label="Zoom slider"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleConfirmCrop}
            disabled={!croppedAreaPixels || isProcessing}
            className="flex-grow w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isProcessing ? 'Processing...' : '✅ Confirm Crop'}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto justify-center inline-flex items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-text-primary bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;