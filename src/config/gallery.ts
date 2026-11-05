/**
 * THE GALLERY: add a photo to public/images/ and add an entry here.
 * No interior or dining-room photos were supplied yet. Add them at the top of this
 * list when you have them.
 */
export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export const gallery: GalleryPhoto[] = [
  {
    src: "/images/restaurant/exterior-signage.webp",
    alt: "The striped Value Plus Place building with its bakery and restaurant signs",
    caption: "Our building",
    width: 1080,
    height: 921,
  },
  {
    src: "/images/restaurant/serving-counter.webp",
    alt: "Trays of hot food at the serving counter, with a tray of rice in front",
    caption: "At the serving counter",
    width: 765,
    height: 1020,
  },
  {
    src: "/images/menu/banga-soup.webp",
    alt: "A bowl of golden banga soup with fish and fresh herbs",
    caption: "Banga soup with fish",
    width: 1000,
    height: 988,
  },
  {
    src: "/images/menu/yam-porridge.webp",
    alt: "A plate of yam porridge with green vegetables on a wooden table",
    caption: "Yam porridge",
    width: 1000,
    height: 1000,
  },
  {
    src: "/images/menu/peppered-ponmo.webp",
    alt: "Peppered ponmo covered in crushed chilli",
    caption: "Peppered ponmo",
    width: 1000,
    height: 576,
  },
  {
    src: "/images/menu/vegetable-soup.webp",
    alt: "A white bowl of vegetable soup with assorted meat",
    caption: "Vegetable soup with assorted",
    width: 948,
    height: 1000,
  },
];
