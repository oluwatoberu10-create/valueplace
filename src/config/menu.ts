/**
 * THE MENU: edit this file to change meals, prices, photos and categories.
 *
 * PRICES BELOW ARE SAMPLES. No price list was supplied, so every `price` is a round
 * placeholder. Replace them, then set `pricesAreSamples: false` in restaurant.ts.
 *
 * DISH NAMES AND DESCRIPTIONS were written from the photographs alone. Please check
 * each one against what the kitchen actually serves.
 *
 * To add a meal: copy a block, give it a new unique `id`, and put its photo in
 * public/images/menu/. Use `image: null` if there is no photo yet.
 */

export type CategoryId = "rice-yam" | "soups" | "proteins" | "grills";

export const categories: { id: CategoryId; label: string }[] = [
  { id: "rice-yam", label: "Rice & Yam" },
  { id: "soups", label: "Soups" },
  { id: "proteins", label: "Peppered Proteins" },
  { id: "grills", label: "Grills & Bites" },
];

export type MenuOption = { name: string; choices: string[] };

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  /** Whole naira, no commas or naira sign. */
  price: number;
  category: CategoryId;
  /** Path inside /public, or null to show the "photo coming soon" tile. */
  image: string | null;
  /** Shown in the Featured Meals section on the home page. */
  featured?: boolean;
  /** CSS object-position, only if the default centre crop cuts the food off. */
  imagePosition?: string;
  /** Choices the customer must pick before adding to the cart. No price difference. */
  options?: MenuOption[];
};

/** Sample choices: replace with what the kitchen really offers. */
const swallow: MenuOption = { name: "Swallow", choices: ["Eba", "Fufu", "Pounded Yam"] };
const spice: MenuOption = { name: "Spice level", choices: ["Mild", "Medium", "Hot"] };

export const menu: MenuItem[] = [
  {
    id: "jollof-rice",
    name: "Jollof Rice",
    description: "Rice simmered in a tomato and pepper sauce, finished with fresh spring onion.",
    price: 3000,
    category: "rice-yam",
    image: "/images/menu/jollof-rice.webp",
    featured: true,
    options: [spice],
  },
  {
    id: "fried-rice",
    name: "Fried Rice with Beef",
    description: "Long-grain rice tossed with diced beef, carrot, peppers and spring onion.",
    price: 3000,
    category: "rice-yam",
    image: "/images/menu/fried-rice.webp",
    featured: true,
  },
  {
    id: "yam-porridge",
    name: "Yam Porridge",
    description: "Soft yam cooked down in a rich pepper sauce with fresh green vegetables.",
    price: 2500,
    category: "rice-yam",
    image: "/images/menu/yam-porridge.webp",
  },
  {
    id: "egusi-soup",
    name: "Egusi Soup",
    description: "Melon seed soup with leafy greens, served with your choice of swallow.",
    price: 4000,
    category: "soups",
    image: "/images/menu/egusi-soup.webp",
    imagePosition: "center 12%",
    featured: true,
    options: [swallow],
  },
  {
    id: "banga-soup",
    name: "Banga Soup with Fish",
    description: "A thick, golden palm-fruit soup with fish and fresh herbs.",
    price: 4500,
    category: "soups",
    image: "/images/menu/banga-soup.webp",
    options: [swallow],
  },
  {
    id: "vegetable-soup",
    name: "Vegetable Soup with Assorted",
    description: "Dark leafy greens in a palm oil broth, loaded with assorted meat.",
    price: 4500,
    category: "soups",
    image: "/images/menu/vegetable-soup.webp",
    options: [swallow],
  },
  {
    id: "peppered-beef",
    name: "Peppered Beef",
    description: "Tender chunks of beef coated in a red pepper sauce.",
    price: 2000,
    category: "proteins",
    image: "/images/menu/peppered-beef.webp",
    featured: true,
    options: [spice],
  },
  {
    id: "peppered-fish",
    name: "Peppered Fish",
    description: "Fried fish smothered in spicy pepper sauce, served with a wedge of lime.",
    price: 5000,
    category: "proteins",
    image: "/images/menu/peppered-fish.webp",
  },
  {
    id: "peppered-snail",
    name: "Peppered Snail",
    description: "Snails tossed with red chilli, sliced peppers and onion.",
    price: 5000,
    category: "proteins",
    image: "/images/menu/peppered-snail.webp",
    featured: true,
  },
  {
    id: "peppered-ponmo",
    name: "Peppered Ponmo",
    description: "Chewy ponmo coated in a fiery crushed chilli sauce.",
    price: 2000,
    category: "proteins",
    image: "/images/menu/peppered-ponmo.webp",
  },
  {
    id: "glazed-wings",
    name: "Glazed Chicken Wings",
    description: "Chicken wings cooked until sticky, with a dark, glossy glaze.",
    price: 3500,
    category: "grills",
    image: "/images/menu/glazed-wings.webp",
  },
  {
    id: "crispy-prawns",
    name: "Crispy Breaded Prawns",
    description: "Golden, crunchy breaded prawns served with a wedge of lemon.",
    price: 6000,
    category: "grills",
    image: "/images/menu/crispy-prawns.webp",
    featured: true,
  },
  {
    id: "beef-skewers",
    name: "Beef & Pepper Skewers",
    description: "Sauced beef on skewers with green pepper, red onion and cherry tomato.",
    price: 3000,
    category: "grills",
    image: "/images/menu/beef-skewers.webp",
  },
  {
    id: "gizzard-skewers",
    name: "Gizzard Skewers",
    description: "Grilled gizzard on skewers, browned and glazed.",
    price: 2500,
    category: "grills",
    // The supplied photo carries a Vecteezy stock watermark, so it is not used. Add your own.
    image: null,
  },
];
