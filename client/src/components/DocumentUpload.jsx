import { useState, useRef, useCallback, useEffect } from 'react';
import { extractDocuments } from '../lib/api';
import { preprocessImage, isPDF, getPDFThumbnailUrl } from '../lib/imageUtils';

/**
 * Multi-document upload component with image preprocessing.
 * Supports drag & drop, camera capture, and file picker.
 * Preprocesses images client-side before uploading.
 *
 * Props: { onFieldsExtracted, onSkip }
 */
export default function DocumentUpload({ onFieldsExtracted, onSkip }) {
  // Each item: { id, file, blob, thumbnailUrl, name, isPdf, processing }
  const [queue, setQueue] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [retryFiles, setRetryFiles] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const thumbnailStripRef = useRef(null);
  const nextId = useRef(0);

  // ---- Add files to the queue ----
  const addFiles = useCallback(async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);

    // Create placeholder entries immediately (show as "processing")
    const placeholders = files.map((file) => {
      const id = nextId.current++;
      return {
        id,
        file,
        blob: null,
        thumbnailUrl: null,
        name: file.name,
        isPdf: isPDF(file),
        processing: true,
      };
    });

    setQueue((prev) => [...prev, ...placeholders]);

    // Process each file asynchronously
    for (const placeholder of placeholders) {
      try {
        if (placeholder.isPdf) {
          // PDFs pass through as-is
          setQueue((prev) =>
            prev.map((item) =>
              item.id === placeholder.id
                ? {
                    ...item,
                    blob: placeholder.file,
                    thumbnailUrl: getPDFThumbnailUrl(),
                    processing: false,
                  }
                : item
            )
          );
        } else {
          // Preprocess image: resize, correct orientation, convert to JPEG
          const { blob, dataUrl } = await preprocessImage(placeholder.file);
          setQueue((prev) =>
            prev.map((item) =>
              item.id === placeholder.id
                ? {
                    ...item,
                    blob,
                    thumbnailUrl: dataUrl,
                    processing: false,
                  }
                : item
            )
          );
        }
      } catch {
        // Remove failed items from queue
        setQueue((prev) => prev.filter((item) => item.id !== placeholder.id));
      }
    }
  }, []);

  // ---- Remove an item from the queue ----
  const removeItem = useCallback((id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ---- Scan all documents ----
  const handleScan = useCallback(async () => {
    const readyItems = queue.filter((item) => !item.processing && item.blob);
    if (readyItems.length === 0) return;

    setScanning(true);
    setError(null);
    setRetryFiles(null);

    try {
      const blobs = readyItems.map((item) => item.blob);
      const result = await extractDocuments(blobs);

      if (result.success && result.fields && Object.keys(result.fields).length > 0) {
        onFieldsExtracted(result.fields);
      } else {
        setError(
          result.message ||
            'Could not extract deal details. Try clearer photos or enter manually.'
        );
        setRetryFiles(blobs);
      }
    } catch (err) {
      setError(err.message || 'Failed to process documents. Please try again.');
      setRetryFiles(queue.filter((item) => !item.processing && item.blob).map((item) => item.blob));
    } finally {
      setScanning(false);
    }
  }, [queue, onFieldsExtracted]);

  // ---- Retry after error ----
  const handleRetry = useCallback(async () => {
    if (!retryFiles || retryFiles.length === 0) return;
    setScanning(true);
    setError(null);

    try {
      const result = await extractDocuments(retryFiles);
      if (result.success && result.fields && Object.keys(result.fields).length > 0) {
        onFieldsExtracted(result.fields);
      } else {
        setError(
          result.message ||
            'Could not extract deal details. Try clearer photos or enter manually.'
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to process documents. Please try again.');
    } finally {
      setScanning(false);
    }
  }, [retryFiles, onFieldsExtracted]);

  // ---- Drag & drop handlers ----
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // ---- File input handlers ----
  const handleFileInput = useCallback(
    (e) => {
      addFiles(e.target.files);
      // Reset so the same file can be re-selected
      e.target.value = '';
    },
    [addFiles]
  );

  const handleCameraInput = useCallback(
    (e) => {
      addFiles(e.target.files);
      e.target.value = '';
    },
    [addFiles]
  );

  // ---- Derived state ----
  const readyCount = queue.filter((item) => !item.processing).length;
  const hasItems = queue.length > 0;
  const allReady = queue.length > 0 && queue.every((item) => !item.processing);

  // ========== SCANNING STATE ==========
  if (scanning) {
    return <ScanningProgress pageCount={readyCount} />;
  }

  // ========== HAS ITEMS STATE ==========
  if (hasItems) {
    return (
      <div className="space-y-4">
        {/* File count badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            {readyCount} {readyCount === 1 ? 'page' : 'pages'} added
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-accent hover:text-accent-hover text-sm font-medium transition-colors"
          >
            + Add more
          </button>
        </div>

        {/* Thumbnail strip */}
        <div
          ref={thumbnailStripRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {queue.map((item) => (
            <div
              key={item.id}
              className="relative flex-shrink-0 w-24 h-28 rounded-lg overflow-hidden bg-surface2 border border-border group"
            >
              {item.processing ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Remove button */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red"
                aria-label={`Remove ${item.name}`}
                style={{ opacity: undefined }}
                onPointerEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onPointerLeave={(e) => (e.currentTarget.style.opacity = '')}
              >
                &times;
              </button>
              {/* Always visible remove button on touch devices via CSS fallback */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs items-center justify-center flex sm:hidden hover:bg-red"
                aria-label={`Remove ${item.name}`}
              >
                &times;
              </button>
              {/* File name truncated */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                <p className="text-white text-[10px] truncate">{item.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Scan All Documents button */}
        <button
          onClick={handleScan}
          disabled={!allReady}
          className="w-full py-3.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5M20.25 16.5V18A2.25 2.25 0 0118 20.25h-1.5M3.75 16.5V18A2.25 2.25 0 006 20.25h1.5" />
          </svg>
          Scan All Documents ({readyCount})
        </button>

        {/* Error display */}
        {error && (
          <div className="bg-red/10 border border-red/30 rounded-xl p-4 text-sm">
            <p className="text-red font-medium mb-1">Couldn't read documents</p>
            <p className="text-text2">{error}</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleRetry}
                className="text-accent hover:text-accent-hover text-sm font-medium"
              >
                Retry scan
              </button>
              <span className="text-text2">|</span>
              <button
                onClick={onSkip}
                className="text-text2 hover:text-text text-sm font-medium"
              >
                Enter details manually
              </button>
            </div>
          </div>
        )}

        {/* Manual entry link */}
        <div className="text-center pt-1">
          <button
            onClick={onSkip}
            className="text-accent/80 hover:text-accent text-sm font-medium transition-colors underline underline-offset-2 decoration-accent/30 hover:decoration-accent/60"
          >
            or enter deal details manually
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraInput}
        />
      </div>
    );
  }

  // ========== EMPTY STATE ==========
  return (
    <div className="space-y-4">
      {/* Hero drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
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
            Take photos or upload the dealer's buyer's order / purchase agreement
          </p>
          <p className="text-text2 text-xs">
            Supports JPG, PNG, PDF — Add multiple pages, we'll auto-fill everything
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Action buttons row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Camera button */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="py-3 px-4 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          Take Photo
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraInput}
          />
        </button>

        {/* Upload files button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="py-3 px-4 bg-surface2 hover:bg-surface3 text-text font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 border border-border"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Files
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red/10 border border-red/30 rounded-xl p-4 text-sm">
          <p className="text-red font-medium mb-1">Couldn't read documents</p>
          <p className="text-text2">{error}</p>
          <div className="flex gap-3 mt-2">
            {retryFiles && (
              <>
                <button
                  onClick={handleRetry}
                  className="text-accent hover:text-accent-hover text-sm font-medium"
                >
                  Retry scan
                </button>
                <span className="text-text2">|</span>
              </>
            )}
            <button
              onClick={onSkip}
              className="text-text2 hover:text-text text-sm font-medium"
            >
              Enter details manually
            </button>
          </div>
        </div>
      )}

      {/* Manual entry link */}
      <div className="text-center pt-1">
        <button
          onClick={onSkip}
          className="text-accent/80 hover:text-accent text-sm font-medium transition-colors underline underline-offset-2 decoration-accent/30 hover:decoration-accent/60"
        >
          or enter deal details manually
        </button>
      </div>
    </div>
  );
}

// ---- Minimalistic scanning progress component ----
const SCAN_STEPS = [
  { label: 'Reading document pages', target: 15 },
  { label: 'Detecting text & tables', target: 35 },
  { label: 'Extracting vehicle info', target: 55 },
  { label: 'Extracting pricing & fees', target: 75 },
  { label: 'Cross-referencing data', target: 90 },
  { label: 'Finalizing', target: 98 },
];

function ScanningProgress({ pageCount }) {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const currentStep = SCAN_STEPS[stepIdx];
        const target = currentStep?.target || 98;
        if (prev >= target) {
          if (stepIdx < SCAN_STEPS.length - 1) {
            setStepIdx((s) => s + 1);
          }
          return Math.min(prev + 0.2, 99);
        }
        const remaining = target - prev;
        const increment = Math.max(0.3, remaining * 0.08);
        return Math.min(prev + increment, 99);
      });
    }, 120);
    return () => clearInterval(interval);
  }, [stepIdx]);

  const step = SCAN_STEPS[stepIdx] || SCAN_STEPS[SCAN_STEPS.length - 1];
  const pct = Math.round(progress);

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-xl p-8 text-center">
        <div className="py-4">
          {/* Pulsing scan ring */}
          <div className="relative w-20 h-20 mx-auto mb-5">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface2" />
              <circle
                cx="36" cy="36" r="30" fill="none" strokeWidth="3"
                className="text-accent"
                stroke="currentColor"
                strokeLinecap="round"
                strokeDasharray={`${progress * 1.885} 188.5`}
                style={{ transition: 'stroke-dasharray 0.3s ease-out' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-text text-lg font-semibold tabular-nums">
              {pct}%
            </span>
          </div>

          {/* Step label */}
          <p className="text-text text-sm font-medium mb-1">{step.label}</p>
          <p className="text-text2 text-xs">
            Processing {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </p>

          {/* Thin progress bar */}
          <div className="mt-5 mx-auto max-w-xs">
            <div className="h-1 bg-surface2 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
