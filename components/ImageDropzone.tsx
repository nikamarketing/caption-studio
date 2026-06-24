"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, ImagePlus } from "lucide-react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageDropzone({ images, onChange }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      accepted.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onChange([...images, result]);
        };
        reader.readAsDataURL(file);
      });
    },
    [images, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    maxFiles: 10,
  });

  const remove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all
          ${isDragActive
            ? "border-brand-500 bg-brand-500/10 dropzone-active"
            : "border-[#2e2e3a] bg-[#18181f] hover:border-brand-500/60 hover:bg-brand-500/5"
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20">
          <ImagePlus className="h-6 w-6 text-brand-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">
            {isDragActive ? "Drop images here…" : "Drag & drop images"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            or <span className="text-brand-400">click to browse</span> · PNG, JPG, WEBP · up to 10 images
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {images.map((src, idx) => (
            <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border border-[#2e2e3a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`upload-${idx}`}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => remove(idx)}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">Main</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
