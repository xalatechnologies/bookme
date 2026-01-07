import { useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=250&fit=crop",
];

export function ImageGallery() {
  const [mainImage, setMainImage] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      {/* Main image */}
      <div className="lg:col-span-3">
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
          <img
            src={images[mainImage]}
            alt="Møterom hovedbilde"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-2">
        {images.slice(1).map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(index + 1)}
            className={`relative flex-1 lg:flex-none aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              mainImage === index + 1 ? "border-primary" : "border-transparent hover:border-primary/50"
            }`}
          >
            <img
              src={img}
              alt={`Bilde ${index + 2}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
