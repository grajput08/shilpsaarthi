/** Client-side JPEG compression for field photo uploads (keeps payloads under server limits). */

const DEFAULT_MAX_EDGE = 1280;
const DEFAULT_QUALITY = 0.82;
const DEFAULT_MAX_BYTES = 900_000;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read the selected image.'));
    img.src = src;
  });
}

function fitDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.ceil((base64.length * 3) / 4);
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Resize and re-encode a camera/gallery file as a JPEG data URL small enough
 * for Server Action submission and localStorage drafts.
 */
export async function compressImageFile(
  file: File,
  opts: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxBytes?: number;
  } = {},
): Promise<string> {
  const maxWidth = opts.maxWidth ?? DEFAULT_MAX_EDGE;
  const maxHeight = opts.maxHeight ?? DEFAULT_MAX_EDGE;
  let quality = opts.quality ?? DEFAULT_QUALITY;
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const { width, height } = fitDimensions(img.naturalWidth, img.naturalHeight, maxWidth, maxHeight);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not prepare the image for upload.');
    ctx.drawImage(img, 0, 0, width, height);

    let dataUrl = canvasToJpeg(canvas, quality);
    while (dataUrlBytes(dataUrl) > maxBytes && quality > 0.45) {
      quality -= 0.08;
      dataUrl = canvasToJpeg(canvas, quality);
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
