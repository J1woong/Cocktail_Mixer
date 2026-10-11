import { BOTTLE_GROUPS, BottleItem } from '../data/bottlesData';
import { CocktailRecipe } from '../types/cocktail';

// Korean Hangul Jamo tables
const INITIAL_CONSONANTS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const MEDIAL_VOWELS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

const FINAL_CONSONANTS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Flattened list of all registered bottles
export const ALL_BOTTLES: BottleItem[] = BOTTLE_GROUPS.flatMap((g) => g.bottles);

/**
 * Decomposes a Korean Hangul string into its constituent Jamo consonants and vowels.
 * E.g., '버팔로' -> 'ㅂㅓㅍㅏㄹㄹㅗ'
 */
export function decomposeHangul(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const syllableIndex = code - 0xac00;
      const initialIdx = Math.floor(syllableIndex / 588);
      const medialIdx = Math.floor((syllableIndex % 588) / 28);
      const finalIdx = syllableIndex % 28;

      result += INITIAL_CONSONANTS[initialIdx];
      result += MEDIAL_VOWELS[medialIdx];
      if (finalIdx > 0) {
        result += FINAL_CONSONANTS[finalIdx];
      }
    } else {
      result += str[i];
    }
  }
  return result;
}

/**
 * Normalizes text for searching: removes whitespace and non-alphanumeric/hangul characters, lowercases.
 */
export function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/[\s\-_.,/()·'"]/g, '');
}

/**
 * Calculates Levenshtein Distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Calculates similarity between query and target string (0 to 1).
 * Uses normalized string inclusion, Jamo Levenshtein distance, and character Levenshtein.
 */
export function calculateHangulSimilarity(query: string, target: string): number {
  const normQuery = normalizeSearchText(query);
  const normTarget = normalizeSearchText(target);

  if (!normQuery || !normTarget) return 0;
  if (normQuery === normTarget) return 1.0;

  // Substring check
  if (normTarget.includes(normQuery)) {
    // Score based on how much of the target is matched
    return 0.85 + (normQuery.length / normTarget.length) * 0.15;
  }
  if (normQuery.includes(normTarget)) {
    return 0.85 + (normTarget.length / normQuery.length) * 0.15;
  }

  // Decompose to Jamo
  const jamoQuery = decomposeHangul(normQuery);
  const jamoTarget = decomposeHangul(normTarget);

  if (jamoTarget.includes(jamoQuery) || jamoQuery.includes(jamoTarget)) {
    return 0.8;
  }

  // Jamo Levenshtein Distance
  const jamoDist = levenshteinDistance(jamoQuery, jamoTarget);
  const maxJamoLen = Math.max(jamoQuery.length, jamoTarget.length);
  const jamoSim = maxJamoLen > 0 ? 1 - jamoDist / maxJamoLen : 0;

  // Character Levenshtein Distance
  const charDist = levenshteinDistance(normQuery, normTarget);
  const maxCharLen = Math.max(normQuery.length, normTarget.length);
  const charSim = maxCharLen > 0 ? 1 - charDist / maxCharLen : 0;

  // Combine metrics
  return Math.max(jamoSim, charSim);
}

export interface BottleMatchResult {
  bottle: BottleItem;
  score: number;
  isDirectMatch: boolean;
  matchedName: string;
}

export interface SearchSuggestionItem {
  type: 'bottle' | 'cocktail';
  id: string;
  nameKo: string;
  nameEn: string;
  subText: string;
  searchTerm: string;
  score: number;
  bottle?: BottleItem;
  cocktail?: CocktailRecipe;
}

/**
 * Finds bottle matches and fuzzy "이걸 찾으셨나요?" suggestions for a user search query.
 */
export function findBottleMatchesAndSuggestions(
  query: string,
  threshold = 0.5
): {
  directMatches: BottleItem[];
  suggestions: SearchSuggestionItem[];
  bestMatch: BottleItem | null;
} {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { directMatches: [], suggestions: [], bestMatch: null };
  }

  const normQuery = normalizeSearchText(cleanQuery);
  const directMatches: BottleItem[] = [];
  const scoredBottles: { bottle: BottleItem; score: number; matchedName: string }[] = [];

  for (const bottle of ALL_BOTTLES) {
    // Check all potential names and aliases
    const candidates = [
      bottle.nameKo,
      bottle.nameEn,
      ...(bottle.aliases || []),
      bottle.groupNameKo,
    ];

    let maxScore = 0;
    let bestMatchedCandidate = bottle.nameKo;
    let isDirect = false;

    for (const cand of candidates) {
      if (!cand) continue;
      const normCand = normalizeSearchText(cand);

      // Direct exact or substring matches
      if (normCand === normQuery || normCand.includes(normQuery) || normQuery.includes(normCand)) {
        isDirect = true;
        maxScore = 1.0;
        bestMatchedCandidate = cand;
        break;
      }

      const sim = calculateHangulSimilarity(cleanQuery, cand);
      if (sim > maxScore) {
        maxScore = sim;
        bestMatchedCandidate = cand;
      }
    }

    if (isDirect) {
      directMatches.push(bottle);
      scoredBottles.push({ bottle, score: 1.0, matchedName: bestMatchedCandidate });
    } else if (maxScore >= threshold) {
      scoredBottles.push({ bottle, score: maxScore, matchedName: bestMatchedCandidate });
    }
  }

  // Sort by score descending
  scoredBottles.sort((a, b) => b.score - a.score);

  // Suggestions excluding exact matches if exact exists, or top fuzzy suggestions
  const topSuggestions = scoredBottles
    .filter((sb) => {
      // Don't suggest if it's already an exact verbatim match of the query
      const normName = normalizeSearchText(sb.bottle.nameKo);
      return normName !== normQuery;
    })
    .slice(0, 4)
    .map(
      (sb): SearchSuggestionItem => ({
        type: 'bottle',
        id: sb.bottle.id,
        nameKo: sb.bottle.nameKo,
        nameEn: sb.bottle.nameEn,
        subText: `${sb.bottle.groupNameKo} · ${sb.bottle.abv}%`,
        searchTerm: sb.bottle.nameKo,
        score: sb.score,
        bottle: sb.bottle,
      })
    );

  const bestMatch = scoredBottles.length > 0 ? scoredBottles[0].bottle : null;

  return {
    directMatches,
    suggestions: topSuggestions,
    bestMatch,
  };
}

/**
 * Finds cocktail name suggestions if user might have misspelled a cocktail name
 * (e.g. '모이토' -> '모히토', '네그로늬' -> '네그로니')
 */
export function findCocktailSuggestions(
  query: string,
  cocktails: CocktailRecipe[],
  threshold = 0.55
): SearchSuggestionItem[] {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  const normQuery = normalizeSearchText(cleanQuery);
  const scored: { cocktail: CocktailRecipe; score: number }[] = [];

  for (const cocktail of cocktails) {
    const normKo = normalizeSearchText(cocktail.nameKo);
    const normEn = normalizeSearchText(cocktail.nameEn);

    if (normKo === normQuery || normEn === normQuery) continue; // Already exact

    const scoreKo = calculateHangulSimilarity(cleanQuery, cocktail.nameKo);
    const scoreEn = calculateHangulSimilarity(cleanQuery, cocktail.nameEn);
    const maxScore = Math.max(scoreKo, scoreEn);

    if (maxScore >= threshold) {
      scored.push({ cocktail, score: maxScore });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(
    (item): SearchSuggestionItem => ({
      type: 'cocktail',
      id: item.cocktail.id,
      nameKo: item.cocktail.nameKo,
      nameEn: item.cocktail.nameEn,
      subText: `칵테일 레시피 · ${item.cocktail.method}`,
      searchTerm: item.cocktail.nameKo,
      score: item.score,
      cocktail: item.cocktail,
    })
  );
}

/**
 * Check if a cocktail uses a bottle's liquor (either directly as primary liquor or via substitute)
 */
export function doesCocktailUseBottleLiquor(
  cocktail: CocktailRecipe,
  bottle: BottleItem
): boolean {
  return cocktail.ingredients.some((ing) => {
    // Direct liquorId match
    if (ing.id === bottle.liquorId) return true;

    // Substitute match
    if (ing.substituteIds && ing.substituteIds.includes(bottle.liquorId)) {
      return true;
    }

    // Special category mapping
    if (bottle.category === 'bourbon' && ing.id === 'bourbon') return true;
    if (bottle.category === 'whiskey' && ['scotch', 'rye_whiskey', 'single_malt_peat', 'single_malt_scotch', 'irish_whiskey', 'japanese_whiskey'].includes(ing.id)) {
      return true;
    }
    if (bottle.category === 'gin' && ['gin', 'dry_gin', 'botanical_gin'].includes(ing.id)) return true;
    if (bottle.category === 'vodka' && ['vodka', 'citron_vodka'].includes(ing.id)) return true;
    if (bottle.category === 'rum' && ['white_rum', 'dark_rum', 'spiced_rum'].includes(ing.id)) return true;
    if (bottle.category === 'tequila_mezcal' && ['tequila_blanco', 'tequila_reposado', 'mezcal'].includes(ing.id)) return true;
    if (bottle.category === 'brandy' && ['cognac', 'brandy', 'calvados'].includes(ing.id)) return true;
    if (bottle.category === 'liqueur' && ['cointreau', 'triple_sec_generic', 'grand_marnier', 'kahlua', 'maraschino', 'amaretto', 'creme_de_cassis', 'chartreuse_green', 'baileys'].includes(ing.id)) return true;
    if (bottle.category === 'wine' && ['sweet_vermouth', 'dry_vermouth', 'prosecco_champagne', 'red_wine', 'dry_white_wine', 'ruby_port'].includes(ing.id)) return true;

    return false;
  });
}
