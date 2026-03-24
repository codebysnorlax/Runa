import React, { useState, useEffect } from 'react';

const images = [
  `${import.meta.env.BASE_URL}images/1_image.png`,
  `${import.meta.env.BASE_URL}images/2_image.png`,
  `${import.meta.env.BASE_URL}images/3_image.png`,
  `${import.meta.env.BASE_URL}images/4_image.png`,
  `${import.meta.env.BASE_URL}images/5_image.png`,
  `${import.meta.env.BASE_URL}images/6_image.png`,
  `${import.meta.env.BASE_URL}images/7_image.png`,
  `${import.meta.env.BASE_URL}images/8_image.png`,
];

const ImageCarousel: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl lg:rounded-lg shadow-2xl border-2 lg:border border-gray-700 lg:border-gray-800">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`App screenshot ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            width="600"
            height="400"
            className={`w-full object-cover rounded-xl lg:rounded-lg ${index === currentImage ? "relative" : "absolute inset-0"}`}
            style={{
              opacity: index === currentImage ? 1 : 0,
              transform: index === currentImage ? "scale(1)" : "scale(0.95)",
              transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
            }}
          />
        ))}
      </div>
      <div className="flex justify-center items-center gap-2 md:gap-3 mt-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full transition-all duration-500 ${index === currentImage ? "bg-brand-orange shadow-lg shadow-brand-orange/50 scale-125" : "bg-gray-600 hover:bg-gray-500"}`}
            style={{ transition: "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)" }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
