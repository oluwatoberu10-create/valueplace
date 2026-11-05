"use client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gallery, type GalleryPhoto } from "@/config/gallery";

function Lightbox({
  index,
  photos,
  onChange,
  onClose,
}: {
  index: number;
  photos: GalleryPhoto[];
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const photo = photos[index];
  const step = (d: number) => onChange((index + d + photos.length) % photos.length);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const control = "absolute z-10 flex size-12 items-center justify-center bg-ink/70 text-cream hover:bg-ink";
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
      aria-label={photo.caption}
      data-testid="lightbox"
      className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/90"
    >
      <figure className="relative">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="90vw"
          className="h-auto max-h-[82dvh] w-auto max-w-[92vw]"
        />
        <figcaption className="mt-2 text-center text-cream">{photo.caption}</figcaption>
        <button type="button" aria-label="Close" onClick={() => ref.current?.close()} className={`${control} top-0 right-0`}>
          <X aria-hidden="true" className="size-6" />
        </button>
        <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className={`${control} top-1/2 left-0 -translate-y-1/2`}>
          <ChevronLeft aria-hidden="true" className="size-6" />
        </button>
        <button type="button" aria-label="Next photo" onClick={() => step(1)} className={`${control} top-1/2 right-0 -translate-y-1/2`}>
          <ChevronRight aria-hidden="true" className="size-6" />
        </button>
      </figure>
    </dialog>
  );
}

/** Mosaic spans for the first six photos on larger screens; extra photos take single cells. */
const SPANS = [
  "col-span-2 row-span-2",
  "row-span-2",
  "",
  "",
  "col-span-2",
  "col-span-2",
];

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className="grid auto-rows-[11rem] grid-cols-2 gap-2 sm:auto-rows-[15rem] sm:grid-cols-4 sm:gap-3">
        {gallery.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            data-testid="gallery-photo"
            onClick={() => setOpen(i)}
            aria-label={`View photo: ${photo.caption}`}
            className={`group relative overflow-hidden ${SPANS[i] ?? ""}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={i === 0 ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-3 pt-8 pb-2.5 text-left text-sm font-medium text-cream">
              {photo.caption}
            </span>
          </button>
        ))}
      </div>
      {open !== null && <Lightbox index={open} photos={gallery} onChange={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
