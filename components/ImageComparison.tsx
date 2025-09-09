import React from 'react';

interface ImageComparisonProps {
  originalImage: string;
  editedImage: string | null;
}

interface ImageDisplayProps {
  src: string;
  title: string;
  isPlaceholder?: boolean;
  onDownload?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ src, title, isPlaceholder = false, onDownload }) => (
    <div className="w-full flex flex-col items-center space-y-3">
        <div className="flex justify-between items-center w-full min-h-[36px]">
            <h3 className="text-xl font-semibold text-text-secondary">{title}</h3>
            {onDownload && (
                <button
                    onClick={onDownload}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-colors duration-300"
                    aria-label="Download edited image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </button>
            )}
        </div>
        <div className="w-full aspect-square bg-secondary rounded-lg overflow-hidden shadow-lg flex items-center justify-center border border-gray-700">
            {isPlaceholder ? (
                <div className="text-center text-text-secondary p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2">Your edited image will appear here once generated.</p>
                </div>
            ) : (
                <img src={src} alt={title} className="w-full h-full object-contain" />
            )}
        </div>
    </div>
);


const ImageComparison: React.FC<ImageComparisonProps> = ({ originalImage, editedImage }) => {
  const handleDownload = () => {
    if (!editedImage) return;

    const link = document.createElement('a');
    link.href = editedImage;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `edited-image-${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ImageDisplay src={originalImage} title="Before" />
      {editedImage ? (
        <ImageDisplay src={editedImage} title="After" onDownload={handleDownload} />
      ) : (
        <ImageDisplay src="" title="After" isPlaceholder={true} />
      )}
    </div>
  );
};

export default ImageComparison;