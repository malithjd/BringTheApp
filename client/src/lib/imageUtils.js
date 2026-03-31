/**
 * Client-side image preprocessing utilities.
 * Resizes images, corrects EXIF orientation, and converts to JPEG.
 * PDFs pass through without processing.
 */

const MAX_LONG_EDGE = 1500;
const JPEG_QUALITY = 0.85;

/**
 * Read the EXIF orientation tag from a JPEG file.
 * Returns orientation value 1-8 (1 = normal, others = rotated/flipped).
 */
function readExifOrientation(arrayBuffer) {
  const view = new DataView(arrayBuffer);

  // Check for JPEG SOI marker
  if (view.getUint16(0) !== 0xFFD8) return 1;

  let offset = 2;
  while (offset < view.byteLength - 2) {
    const marker = view.getUint16(offset);
    offset += 2;

    // APP1 marker (EXIF)
    if (marker === 0xFFE1) {
      const length = view.getUint16(offset);

      // Check for "Exif\0\0"
      if (
        view.getUint32(offset + 2) === 0x45786966 &&
        view.getUint16(offset + 6) === 0x0000
      ) {
        const tiffOffset = offset + 8;
        const bigEndian = view.getUint16(tiffOffset) === 0x4D4D;

        const ifdOffset = view.getUint32(tiffOffset + 4, !bigEndian);
        const numEntries = view.getUint16(tiffOffset + ifdOffset, !bigEndian);

        for (let i = 0; i < numEntries; i++) {
          const entryOffset = tiffOffset + ifdOffset + 2 + i * 12;
          if (entryOffset + 12 > view.byteLength) break;

          const tag = view.getUint16(entryOffset, !bigEndian);
          if (tag === 0x0112) {
            // Orientation tag
            return view.getUint16(entryOffset + 8, !bigEndian);
          }
        }
      }

      offset += length;
    } else if ((marker & 0xFF00) === 0xFF00) {
      // Skip other markers
      if (marker === 0xFFD9 || marker === 0xFFDA) break;
      offset += view.getUint16(offset);
    } else {
      break;
    }
  }

  return 1;
}

/**
 * Apply EXIF orientation transform to a canvas context.
 * Returns the adjusted { width, height } of the canvas.
 */
function applyOrientation(ctx, orientation, width, height) {
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
    default:
      break;
  }
}

/**
 * Preprocess an image file for upload.
 *
 * - Reads EXIF orientation and corrects it
 * - Resizes to max 1500px on the long edge
 * - Converts to JPEG at 85% quality
 * - Returns both the processed Blob (for upload) and dataUrl (for thumbnail)
 *
 * @param {File} file - The image file to process
 * @returns {Promise<{ blob: Blob, dataUrl: string, width: number, height: number }>}
 */
export async function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const orientation = readExifOrientation(arrayBuffer);

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));

      img.onload = () => {
        let { naturalWidth: srcW, naturalHeight: srcH } = img;

        // Determine if orientation swaps dimensions
        const swapDims = orientation >= 5 && orientation <= 8;
        let drawW = srcW;
        let drawH = srcH;

        // The "real" dimensions after orientation correction
        let realW = swapDims ? srcH : srcW;
        let realH = swapDims ? srcW : srcH;

        // Calculate resize scale based on long edge
        const longEdge = Math.max(realW, realH);
        let scale = 1;
        if (longEdge > MAX_LONG_EDGE) {
          scale = MAX_LONG_EDGE / longEdge;
        }

        const finalW = Math.round(realW * scale);
        const finalH = Math.round(realH * scale);

        // Create canvas at final output size
        const canvas = document.createElement('canvas');
        canvas.width = finalW;
        canvas.height = finalH;
        const ctx = canvas.getContext('2d');

        // Apply orientation transform
        if (orientation !== 1) {
          applyOrientation(ctx, orientation, finalW, finalH);
        }

        // Draw the image scaled to fit
        if (swapDims) {
          ctx.drawImage(img, 0, 0, finalH, finalW);
        } else {
          ctx.drawImage(img, 0, 0, finalW, finalH);
        }

        // Convert to JPEG blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image to JPEG'));
              return;
            }
            const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
            resolve({ blob, dataUrl, width: finalW, height: finalH });
          },
          'image/jpeg',
          JPEG_QUALITY
        );
      };

      // Load image from the array buffer
      const blob = new Blob([arrayBuffer], { type: file.type });
      img.src = URL.createObjectURL(blob);
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Check if a file is a PDF.
 */
export function isPDF(file) {
  return file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
}

/**
 * Get a display-friendly thumbnail data URL for a PDF.
 * Returns a placeholder SVG since we cannot render PDFs client-side easily.
 */
export function getPDFThumbnailUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160">
    <rect width="120" height="160" rx="8" fill="%231a1a2e"/>
    <rect x="10" y="10" width="100" height="140" rx="4" fill="%2316213e" stroke="%23334155" stroke-width="1"/>
    <text x="60" y="85" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="16" font-weight="bold">PDF</text>
    <rect x="25" y="100" width="70" height="4" rx="2" fill="%23334155"/>
    <rect x="30" y="112" width="60" height="4" rx="2" fill="%23334155"/>
    <rect x="35" y="124" width="50" height="4" rx="2" fill="%23334155"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
