// The 10 official Helping Hands "Types of Help".
// `slug` is the value stored in the database; `name` is the display label.
export const categories = [
  { id: 1, slug: "financial_assistance", name: "Financial Assistance" },
  { id: 2, slug: "food_nutrition", name: "Food and Nutrition" },
  { id: 3, slug: "housing_shelter", name: "Housing and Shelter" },
  { id: 4, slug: "medical_health", name: "Medical and Health Services" },
  { id: 5, slug: "education_training", name: "Education and Training" },
  { id: 6, slug: "disaster_relief", name: "Disaster Relief" },
  { id: 7, slug: "environmental_aid", name: "Environmental Aid" },
  { id: 8, slug: "advocacy_legal", name: "Advocacy and Legal Aid" },
  { id: 9, slug: "mental_health", name: "Mental Health and Counseling" },
  { id: 10, slug: "community_development", name: "Community Development" },
];

export const categoryLabel = (slug?: string): string =>
  categories.find((category) => category.slug === slug)?.name ?? slug ?? "";

export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

export const imgOrPlaceholder = (url?: string | null): string =>
  url && url.trim() ? url : PLACEHOLDER_IMAGE;
