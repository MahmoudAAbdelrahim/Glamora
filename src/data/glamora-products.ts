export type SkinType =
  | "Oily"
  | "Dry"
  | "Combination"
  | "Sensitive"
  | "Normal";

export type Concern =
  | "Acne"
  | "Dryness"
  | "Oil Control"
  | "Dark Spots"
  | "Sensitivity"
  | "Glow";

export interface GlamoraProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  skinTypes: SkinType[];
  concerns: Concern[];
  color: string;
  description: string;
}

export const categories = [
  "Foundation",
  "Lipstick",
  "Mascara",
  "Blush",
  "Skin Care",
  "Concealer",
  "Makeup Sets",
] as const;

export const skinTypes: SkinType[] = [
  "Oily",
  "Dry",
  "Combination",
  "Sensitive",
  "Normal",
];

export const concerns: Concern[] = [
  "Acne",
  "Dryness",
  "Oil Control",
  "Dark Spots",
  "Sensitivity",
  "Glow",
];

export const products: GlamoraProduct[] = [
  {
    id: 1,
    name: "Fit Me Foundation",
    brand: "Maybelline",
    category: "Foundation",
    price: 500,
    rating: 4.8,
    reviews: 120,
    skinTypes: ["Oily", "Combination", "Normal"],
    concerns: ["Oil Control", "Dark Spots"],
    color: "#d9a77c",
    description:
      "A lightweight natural-finish foundation that controls shine and minimizes pores.",
  },
  {
    id: 2,
    name: "True Match Foundation",
    brand: "L'Oréal",
    category: "Foundation",
    price: 650,
    rating: 4.6,
    reviews: 98,
    skinTypes: ["Combination", "Dry", "Normal"],
    concerns: ["Dryness", "Dark Spots"],
    color: "#c58c63",
    description:
      "Blends into your tone with a breathable medium-coverage finish.",
  },
  {
    id: 3,
    name: "Matte Liquid Lipstick",
    brand: "Huda Beauty",
    category: "Lipstick",
    price: 700,
    rating: 4.7,
    reviews: 156,
    skinTypes: [
      "Oily",
      "Normal",
      "Dry",
      "Sensitive",
      "Combination",
    ],
    concerns: ["Glow", "Sensitivity"],
    color: "#9b1030",
    description:
      "Long-wear matte colour that does not dry out your lips.",
  },
  {
    id: 4,
    name: "Soft Pinch Blush",
    brand: "Rare Beauty",
    category: "Blush",
    price: 650,
    rating: 4.9,
    reviews: 210,
    skinTypes: ["Dry", "Normal", "Combination"],
    concerns: ["Glow", "Dryness"],
    color: "#e0607a",
    description:
      "Buildable liquid blush with a natural healthy finish.",
  },
  {
    id: 5,
    name: "Lash Sky Mascara",
    brand: "Maybelline",
    category: "Mascara",
    price: 450,
    rating: 4.5,
    reviews: 87,
    skinTypes: [
      "Normal",
      "Oily",
      "Dry",
      "Sensitive",
      "Combination",
    ],
    concerns: ["Sensitivity"],
    color: "#222222",
    description:
      "Length and lift with no clumps and no smudging.",
  },
  {
    id: 6,
    name: "Instant Concealer",
    brand: "NYX",
    category: "Concealer",
    price: 550,
    rating: 4.6,
    reviews: 134,
    skinTypes: ["Oily", "Normal", "Combination"],
    concerns: ["Dark Spots", "Acne"],
    color: "#d4a373",
    description:
      "Full-coverage concealer for dark circles and blemishes.",
  },
  {
    id: 7,
    name: "Niacinamide Serum",
    brand: "The Ordinary",
    category: "Skin Care",
    price: 600,
    rating: 4.8,
    reviews: 190,
    skinTypes: ["Oily", "Sensitive", "Combination"],
    concerns: ["Acne", "Oil Control", "Sensitivity"],
    color: "#e8c9a0",
    description:
      "Helps reduce the look of pores and balance oil.",
  },
  {
    id: 8,
    name: "Pro Setting Powder",
    brand: "MAC",
    category: "Concealer",
    price: 750,
    rating: 4.7,
    reviews: 88,
    skinTypes: ["Oily", "Combination"],
    concerns: ["Oil Control"],
    color: "#e2b48e",
    description:
      "Sets makeup for an all-day matte look.",
  },
  {
    id: 9,
    name: "Gloss Bomb Highlighter",
    brand: "Fenty Beauty",
    category: "Blush",
    price: 800,
    rating: 4.9,
    reviews: 176,
    skinTypes: ["Dry", "Normal"],
    concerns: ["Glow", "Dryness"],
    color: "#f2c1a4",
    description:
      "A glassy glow you can wear alone or over makeup.",
  },
  {
    id: 10,
    name: "Hydra Day Cream",
    brand: "L'Oréal",
    category: "Skin Care",
    price: 480,
    rating: 4.4,
    reviews: 65,
    skinTypes: ["Dry", "Sensitive", "Normal"],
    concerns: ["Dryness", "Sensitivity"],
    color: "#cfe6ee",
    description:
      "Light moisture that sinks in fast with no greasy feel.",
  },
  {
    id: 11,
    name: "Velvet Nude Lipstick",
    brand: "MAC",
    category: "Lipstick",
    price: 620,
    rating: 4.6,
    reviews: 112,
    skinTypes: ["Normal", "Dry", "Combination"],
    concerns: ["Dryness", "Glow"],
    color: "#b5584a",
    description:
      "A creamy everyday nude with a soft velvet finish.",
  },
  {
    id: 12,
    name: "Glow Starter Set",
    brand: "Huda Beauty",
    category: "Makeup Sets",
    price: 1400,
    rating: 4.8,
    reviews: 59,
    skinTypes: [
      "Normal",
      "Dry",
      "Oily",
      "Combination",
      "Sensitive",
    ],
    concerns: ["Glow", "Dryness", "Sensitivity"],
    color: "#b0305a",
    description:
      "Lipstick, blush and mascara in a gift-ready box.",
  },
];

export function filterProducts({
  skin,
  budget,
  concern,
  category,
}: {
  skin?: SkinType | "";
  budget?: number;
  concern?: Concern | "";
  category?: string;
}) {
  return products.filter((product) => {
    const skinMatch =
      !skin || product.skinTypes.includes(skin);

    const budgetMatch =
      !budget || product.price <= budget;

    const concernMatch =
      !concern || product.concerns.includes(concern);

    const categoryMatch =
      !category || product.category === category;

    return (
      skinMatch &&
      budgetMatch &&
      concernMatch &&
      categoryMatch
    );
  });
}