"use client";

import { useEffect, useRef, useState } from "react";

export interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [loadedCount, setLoadedCount] = useState(3);
  const bottomRowRef = useRef<HTMLImageElement>(null);
  const bottomRowStart =
    Math.floor((Math.min(loadedCount, images.length) - 1) / 3) * 3;

  useEffect(() => {
    const bottomRow = bottomRowRef.current;
    if (!bottomRow || loadedCount >= images.length) return;

    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (active && entries.some((entry) => entry.isIntersecting)) {
          // Advance once per observed row, even if more entries are queued.
          active = false;
          observer.disconnect();
          setLoadedCount((count) => Math.min(count + 3, images.length));
        }
      },
      { rootMargin: "0px 0px 100px 0px", threshold: 0 },
    );

    observer.observe(bottomRow);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [loadedCount, images.length]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 200px)",
        gridAutoRows: "200px",
      }}
    >
      {images.map((url, index) => (
        // Native images allow the observer to control when each URL is assigned.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          ref={index === bottomRowStart ? bottomRowRef : undefined}
          src={index < loadedCount ? url : undefined}
          alt={`Gallery image ${index + 1}`}
          width={200}
          height={200}
          style={{ display: "block", width: 200, height: 200 }}
        />
      ))}
    </div>
  );
}
