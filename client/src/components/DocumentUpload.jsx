import { useState, useRef } from 'react';
import { parseDocument } from '../lib/api';

export default function DocumentUpload({ onFieldsExtracted, onSkip }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }

    setUploading(true);
    setError(null);

    try {
      const result = await parseDocument(file);

      if (result.success && result.fields && Object.keys(result.fields).length > 0) {
        onFieldsExtracted(result.fields, result.rawText);
      } else {
        setError(result.message || 'Could not extract deal details. Try a clearer photo or enter manually.');
      }
    } catch (err) {
      setError(err.message || 'Failed to process document. Please try again or enter manually.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Hero upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="py-8">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text2 text-lg">Scanning your document...</p>
            <p className="text-text2 text-sm mt-1">Extracting deal details with OCR</p>
          </div>
        ) : preview ? (
          <div>
            <img src={preview} alt="Document preview" className="max-h-48 mx-auto rounded-lg mb-4 opacity-60" />
            <p className="text-text2">Processing failed. Tap to try another photo.</p>
          </div>
        ) : (
          <div className="py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface2 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <p className="text-text text-lg font-medium mb-1">
              Upload your purchase agreement
            </p>
            <p className="text-text2 text-sm mb-4">
              Take a photo or upload the dealer's buyer's order / purchase agreement
            </p>
            <p className="text-text2 text-xs">
              Supports JPG, PNG, PDF — We'll auto-fill everything
            </p>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Camera button (mobile-optimized) */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
        Take Photo of Agreement
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </button>

      {/* Error display */}
      {error && (
        <div className="bg-red/10 border border-red/30 rounded-xl p-4 text-sm">
          <p className="text-red font-medium mb-1">Couldn't read document</p>
          <p className="text-text2">{error}</p>
          <button
            onClick={onSkip}
            className="mt-2 text-accent hover:text-accent-hover text-sm font-medium"
          >
            Enter details manually instead
          </button>
        </div>
      )}

      {/* Manual entry link */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-text2 hover:text-text text-sm transition-colors"
        >
          or enter deal details manually
        </button>
      </div>
    </div>
  );
}
