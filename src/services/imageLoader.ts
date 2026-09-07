import type { ImageAsset } from "@/types/project";

const SUPPORTED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/tiff",
]);

const EXT_OK = /\.(jpe?g|png|webp|svg|tiff?)$/i;

export function isSupportedImage(file: File): boolean {
  if (SUPPORTED.has(file.type)) return true;
  return EXT_OK.test(file.name);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function probeImage(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("corrupt"));
    img.src = src;
  });
}

export interface LoadImagesResult {
  assets: ImageAsset[];
  errors: { name: string; message: string }[];
}

export async function loadImageFiles(files: FileList | File[]): Promise<LoadImagesResult> {
  const list = Array.from(files);
  const assets: ImageAsset[] = [];
  const errors: { name: string; message: string }[] = [];

  for (const file of list) {
    if (!isSupportedImage(file)) {
      errors.push({ name: file.name, message: "This file type isn't supported." });
      continue;
    }
    try {
      const src = await readAsDataUrl(file);
      const { width, height } = await probeImage(src);
      assets.push({
        id: Math.random().toString(36).slice(2, 10),
        name: file.name,
        src,
        type: file.type || "image/*",
        fileSize: file.size,
        naturalWidth: width,
        naturalHeight: height,
      });
    } catch {
      errors.push({ name: file.name, message: "This image couldn't be loaded." });
    }
  }

  return { assets, errors };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
