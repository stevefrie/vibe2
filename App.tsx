
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageComparison from './components/ImageComparison';
import LoadingSpinner from './components/LoadingSpinner';
import { editImage } from './services/geminiService';
import ImageCropper from './components/ImageCropper';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelResponseText, setModelResponseText] = useState<string | null>(null);
  
  // State for the cropping flow
  const [rawImageFile, setRawImageFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);

  const handleImageSelect = (file: File) => {
    // Reset state and start cropping
    handleReset();
    setRawImageFile(file);
    setIsCropping(true);
  };
  
  const handleCropConfirm = (croppedFile: File) => {
    setOriginalImage(croppedFile);
    setOriginalImagePreview(URL.createObjectURL(croppedFile));
    setIsCropping(false);
    setRawImageFile(null); // Clear raw file
  };
  
  const handleCropCancel = () => {
    handleReset();
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalImagePreview(null);
    setEditedImage(null);
    setError(null);
    setModelResponseText(null);
    setPrompt('');
    setIsCropping(false);
    setRawImageFile(null);
  }

  const handleSubmit = useCallback(async () => {
    if (!originalImage || !prompt.trim()) {
      setError('Please provide an image and a descriptive prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    setModelResponseText(null);

    try {
      const result = await editImage(originalImage, prompt);
      if (result.editedImageBase64) {
        setEditedImage(`data:image/png;base64,${result.editedImageBase64}`);
        setModelResponseText(result.text || "Image generation successful.");
      } else {
        setError(result.text || 'Failed to generate image. The model might not have returned an image.');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {isCropping && rawImageFile ? (
          <ImageCropper 
            imageSrc={URL.createObjectURL(rawImageFile)}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        ) : !originalImagePreview ? (
          <ImageUploader onImageSelect={handleImageSelect} />
        ) : (
          <div className="space-y-8">
            <ImageComparison 
              originalImage={originalImagePreview} 
              editedImage={editedImage} 
            />

            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-secondary rounded-lg">
                <LoadingSpinner />
                <p className="text-text-secondary animate-pulse">AI is working its magic... Please wait.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            {modelResponseText && !error && (
               <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg" role="alert">
                <p>{modelResponseText}</p>
              </div>
            )}

            {!isLoading && (
              <div className="bg-secondary p-6 rounded-lg shadow-lg space-y-4">
                <label htmlFor="prompt" className="block text-lg font-medium text-text-primary">
                  Describe your edit
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Add a wizard hat on the cat', 'Change the background to a surreal landscape'"
                  className="w-full h-24 p-3 bg-background border border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 resize-none text-text-primary placeholder-text-secondary"
                  disabled={isLoading}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                   <button
                    onClick={handleSubmit}
                    disabled={isLoading || !prompt.trim()}
                    className="flex-grow w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {isLoading ? 'Generating...' : '✨ Generate Edit'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="w-full sm:w-auto justify-center inline-flex items-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-text-primary bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
                  >
                    Upload New Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="text-center py-6 text-text-secondary text-sm">
        <p>Powered by Google Gemini's `gemini-2.5-flash-image-preview` Model</p>
      </footer>
    </div>
  );
};

export default App;