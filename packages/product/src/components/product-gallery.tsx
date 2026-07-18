import { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  thumbnail?: string;
  alt: string;
  className?: string;
}

export function ProductGallery({ images, thumbnail, alt, className = '' }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const allImages = thumbnail ? [thumbnail, ...images] : images;

  if (allImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={allImages[selectedIndex]}
          alt={`${alt} - Image ${selectedIndex + 1}`}
          className="h-full w-full object-cover transition-opacity"
        />
      </div>

      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                i === selectedIndex ? 'border-green-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img src={img} alt={`${alt} - Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
