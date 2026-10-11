import React from 'react';
import { CocktailRecipe } from '../types/cocktail';
import { ArrowRight, Check, RefreshCw } from 'lucide-react';

interface CocktailCardProps {
  cocktail: CocktailRecipe;
  onSelect: (cocktail: CocktailRecipe) => void;
  userIngredients?: string[];
}

export const CocktailCard: React.FC<CocktailCardProps> = ({
  cocktail,
  onSelect,
  userIngredients = [],
}) => {
  // Calculate how many required liquors (alcoholic items) the user has
  const liquorIngredients = cocktail.ingredients.filter(
    (item) => ['spirit', 'liqueur', 'wine_vermouth'].includes(item.category) || item.isAlcoholic
  );
  const totalLiquors = liquorIngredients.length;
  const matchedLiquors = liquorIngredients.filter((item) =>
    userIngredients.includes(item.id)
  );

  const isFullyMakeable =
    userIngredients.length > 0 &&
    totalLiquors > 0 &&
    matchedLiquors.length === totalLiquors;

  const isMakeableWithSubs =
    userIngredients.length > 0 &&
    totalLiquors > 0 &&
    !isFullyMakeable &&
    liquorIngredients.every(
      (item) =>
        userIngredients.includes(item.id) ||
        (item.substituteIds && item.substituteIds.some((s) => userIngredients.includes(s)))
    );

  const methodKo = {
    shake: '셰이크 (Shake)',
    stir: '스터 (Stir)',
    build: '빌드 (Build)',
    blend: '블렌드 (Blend)',
    rolling: '롤링 (Rolling)',
    float: '띄우기 (Float)',
  }[cocktail.method] || cocktail.method;

  return (
    <article
      onClick={() => onSelect(cocktail)}
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#141419] border border-[#23232a] hover:border-amber-500/40 hover:bg-[#181820] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
    >
      <div>
        {/* Top Metadata Line (Unboxed, clean typographic separators per Section 1A) */}
        <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums text-amber-400 font-medium">
              {cocktail.abv}% ABV
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span>{methodKo}</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span>{cocktail.difficulty}</span>
          </div>

          {/* Bar Matching Status if user selected bar items */}
          {userIngredients.length > 0 && (
            <div>
              {isFullyMakeable ? (
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 술 완비 (제작 가능)
                </span>
              ) : isMakeableWithSubs ? (
                <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-amber-400" /> 대체 술로 가능
                </span>
              ) : totalLiquors > 0 ? (
                <span className="text-[11px] text-stone-400 font-mono">
                  술 {matchedLiquors.length}/{totalLiquors} 보유
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-2">
          <h3 className="font-display text-2xl font-bold text-[#fbf8f2] group-hover:text-amber-300 transition-colors">
            {cocktail.nameKo}
          </h3>
          <span className="text-xs text-stone-400 font-sans tracking-wide">
            {cocktail.nameEn}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed mb-5 font-light">
          {cocktail.description}
        </p>

        {/* Taste Profile Mini Bars */}
        <div className="grid grid-cols-4 gap-2 py-3 px-3.5 rounded-xl bg-[#0e0e12] border border-[#1f1f26] mb-5">
          <div>
            <span className="text-[10px] text-stone-400 block mb-1">단맛</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-sm ${
                    i <= cocktail.tasteProfile.sweetness ? 'bg-amber-400' : 'bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block mb-1">산미</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-sm ${
                    i <= cocktail.tasteProfile.sourness ? 'bg-emerald-400' : 'bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block mb-1">쌉쌀함</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-sm ${
                    i <= cocktail.tasteProfile.bitterness ? 'bg-rose-400' : 'bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block mb-1">도수감</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-sm ${
                    i <= cocktail.tasteProfile.strength ? 'bg-purple-400' : 'bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Ingredients Quick List */}
        <div className="mb-4">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium block mb-2">
            주요 재료 ({cocktail.ingredients.length})
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs text-stone-300">
            {cocktail.ingredients.map((ing) => {
              const isUserOwned = userIngredients.includes(ing.id);
              const hasSub =
                !isUserOwned &&
                ing.substituteIds &&
                ing.substituteIds.some((s) => userIngredients.includes(s));

              return (
                <span
                  key={ing.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                    isUserOwned
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                      : hasSub
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                      : 'bg-[#1b1b22] text-stone-300 border-[#2b2b35]'
                  }`}
                >
                  <span>{ing.nameKo}</span>
                  <span className="text-stone-400 font-mono text-[10px]">
                    {ing.amount}
                    {ing.unit}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer action */}
      <div className="pt-3 border-t border-[#1f1f26] flex items-center justify-between text-xs text-amber-400 group-hover:text-amber-300 transition-colors">
        <span className="font-medium flex items-center gap-1.5">
          {cocktail.substituteTips && cocktail.substituteTips.length > 0 && (
            <span className="text-stone-400 text-[11px] font-normal">
              대체 팁 {cocktail.substituteTips.length}개 수록
            </span>
          )}
        </span>
        <span className="flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform">
          <span>레시피 & 대체법 보기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
