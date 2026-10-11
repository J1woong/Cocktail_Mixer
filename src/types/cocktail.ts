export type CocktailMethod = 'shake' | 'stir' | 'build' | 'blend' | 'rolling' | 'float';

export type LiquorCategory =
  | 'bourbon'
  | 'whiskey'
  | 'whiskey_other'
  | 'gin'
  | 'vodka'
  | 'rum'
  | 'tequila_mezcal'
  | 'brandy'
  | 'wine'
  | 'liqueur'
  | 'traditional';

export type IngredientCategory =
  | 'spirit'
  | 'liqueur'
  | 'wine_vermouth'
  | 'syrup_sweetener'
  | 'citrus_juice'
  | 'bitters'
  | 'mixer_soda'
  | 'fruit_herb'
  | 'other';

export interface IngredientItem {
  id: string;
  nameKo: string;
  nameEn: string;
  amount: string;
  unit: 'ml' | 'oz' | 'dash' | 'barspoon' | 'leaves' | 'slice' | 'drop' | 'fill';
  isCore: boolean; // Base liquor or signature ingredient
  category: IngredientCategory;
  isAlcoholic?: boolean; // true if this is an alcoholic liquor
  substituteIds?: string[]; // IDs of common substitutes for this cocktail recipe
  notes?: string;
}

export interface TasteProfile {
  sweetness: number; // 1 - 5
  sourness: number;  // 1 - 5
  bitterness: number; // 1 - 5
  strength: number;   // 1 - 5
  freshness: number;  // 1 - 5
}

export interface CocktailRecipe {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  history?: string;
  abv: number; // Alcohol by Volume %
  method: CocktailMethod;
  glass: string;
  ice: string;
  garnish: string;
  category: 'classic' | 'modern' | 'tropical' | 'aperitif' | 'digestif' | 'refreshing' | 'spirit-forward';
  difficulty: '쉬움' | '보통' | '숙련';
  tasteProfile: TasteProfile;
  ingredients: IngredientItem[];
  instructions: string[];
  proTip: string;
  substituteTips?: {
    ingredient: string;
    substitute: string;
    ratio: string;
    tip: string;
  }[];
  image?: string;
  accentColor?: string;
}

export interface LiquorMeta {
  id: string;
  nameKo: string;
  nameEn: string;
  category: LiquorCategory;
  categoryNameKo: string;
  flavorNotes: string;
  standardAbv: number;
  popularBrands?: string[];
  commonIn: string[]; // cocktail names
}

export interface IngredientMeta {
  id: string;
  nameKo: string;
  nameEn: string;
  category: IngredientCategory;
  categoryNameKo: string;
  flavorNotes: string;
  standardAbv?: number;
  commonIn: string[]; // cocktail names
}

export interface SubstitutionRule {
  id: string;
  originalId: string;
  originalNameKo: string;
  substituteId: string;
  substituteNameKo: string;
  similarity: number; // 0 - 100
  ratioRule: string;
  flavorImpact: string;
  bartenderTip: string;
  applicability: string; // e.g. "마티니, 네그로니 등 진 베이스 전체"
}
