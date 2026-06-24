"use client";

import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { ImageIcon, X } from "lucide-react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

/** Resize + compress to JPEG so base64 payload stays well under Vercel's 4.5 MB limit */
function compressImage(dataUrl: string, maxDim = 1024, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

/** Tiny thumbnail for localStorage (256 px, 60 % quality ≈ 15–30 KB base64) */
export function makeThumbnail(dataUrl: string): Promise<string> {
  return compressImage(dataUrl, 256, 0.6);
}

export function ImageDropzone({ images, onChange }: Props) {
  const onDrop = useCallback(
    async (accepted: File[]) => {
      const slots = 10 - images.length;
      const files = accepted.slice(0, slots);
      const compressed = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((res) => {
              const reader = new FileReader();
              reader.onload = async (e) => {
                const small = await compressImage(e.target!.result as string);
                res(small);
              };
              reader.readAsDataURL(file);
            })
        )
      );
      onChange([...images, ...compressed]);
    },
    [images, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
  });

  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? "border-brand-500 bg-brand-500/5" : "border-[#2e2e3a] hover:border-gray-500"
        }`}
      >
        <input {...getInputProps()} />
        <ImageIcon className="mb-2 h-8 w-8 text-gray-600" />
        <p className="text-sm text-gray-500">
          {isDragActive ? "Drop images here…" : "Drag & drop images"}
        </p>
        <p className="mt-1 text-xs text-gray-600">
          or{" "}
          <span className="text-brand-400 hover:text-brand-300">click to browse</span>{" "}
          · PNG, JPG, WEBP · up to 10 images
        </p>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Image ${i + 1}`}
                className="h-20 w-20 rounded-lg object-cover border border-[#2e2e3a]"
              />
              <button
                onClick={() => remove(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
