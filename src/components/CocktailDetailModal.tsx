import React, { useState } from 'react';
import { CocktailRecipe } from '../types/cocktail';
import { X, ArrowRightLeft, FlaskConical, RefreshCw, Check, ArrowRight, Lightbulb } from 'lucide-react';

interface CocktailDetailModalProps {
  cocktail: CocktailRecipe | null;
  onClose: () => void;
  onConsultAi: (cocktailName: string, ingredient?: string) => void;
  userIngredients?: string[];
}

export const CocktailDetailModal: React.FC<CocktailDetailModalProps> = ({
  cocktail,
  onClose,
  onConsultAi,
  userIngredients = [],
}) => {
  const [useOz, setUseOz] = useState(false);
  const [useSubstitutesMode, setUseSubstitutesMode] = useState(false);

  if (!cocktail) return null;

  // Convert ml to oz helper (30ml ≈ 1 oz)
  const formatAmount = (amountStr: string, unit: string) => {
    if (!useOz || unit !== 'ml') return `${amountStr} ${unit}`;
    const num = parseFloat(amountStr);
    if (isNaN(num)) return `${amountStr} ${unit}`;
    const oz = (num / 30).toFixed(1).replace('.0', '');
    return `${oz} oz`;
  };

  const methodKo = {
    shake: '셰이크 (Shake)',
    stir: '스터 (Stir)',
    build: '빌드 (Build)',
    blend: '블렌드 (Blend)',
    rolling: '롤링 (Rolling)',
    float: '띄우기 (Float)',
  }[cocktail.method] || cocktail.method;

  const categoryKo = {
    classic: '클래식 (Classic)',
    modern: '모던 (Modern)',
    refreshing: '롱드링크 (Long Drink)',
    aperitif: '식전주 (Aperitif)',
    tropical: '트로피컬 (Tropical)',
    digestif: '식후주 (Digestif)',
    'spirit-forward': '스피릿 포워드 (Spirit-Forward)',
  }[cocktail.category] || cocktail.category;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#131318] border border-[#272733] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#16161c]/95 border-b border-[#23232c] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
              {cocktail.abv}% ABV
            </span>
            <span className="text-xs text-stone-400">
              {cocktail.glass} · {methodKo}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Title & Hero Meta */}
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#fbf8f2] mb-1">
              {cocktail.nameKo}
            </h2>
            <p className="text-sm text-stone-400 font-sans tracking-wide mb-3">
              {cocktail.nameEn} · 카테고리: {categoryKo} · 난이도: {cocktail.difficulty}
            </p>
            <p className="text-sm text-stone-300 leading-relaxed font-light">
              {cocktail.description}
            </p>
          </div>

          {/* Core Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#0d0d10] border border-[#1e1e24] text-xs">
            <div>
              <span className="text-stone-400 block text-[11px] mb-0.5">글라스웨어</span>
              <span className="font-medium text-stone-200">{cocktail.glass}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px] mb-0.5">얼음</span>
              <span className="font-medium text-stone-200">{cocktail.ice}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px] mb-0.5">조주 기법</span>
              <span className="font-medium text-amber-300">{methodKo}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px] mb-0.5">가니시</span>
              <span className="font-medium text-stone-200">{cocktail.garnish}</span>
            </div>
          </div>

          {/* Taste Radar Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              맛과 풍미 밸런스 프로필
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: '단맛 (Sweet)', val: cocktail.tasteProfile.sweetness, color: 'bg-amber-400' },
                { label: '산미 (Sour)', val: cocktail.tasteProfile.sourness, color: 'bg-emerald-400' },
                { label: '쌉쌀함 (Bitter)', val: cocktail.tasteProfile.bitterness, color: 'bg-rose-400' },
                { label: '알코올 강도 (Strength)', val: cocktail.tasteProfile.strength, color: 'bg-purple-400' },
                { label: '청량감 (Fresh)', val: cocktail.tasteProfile.freshness, color: 'bg-sky-400' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-[#16161c] border border-[#24242e]">
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="text-stone-300 font-medium">{item.label}</span>
                    <span className="font-mono text-amber-300 font-bold">{item.val}/5</span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <span
                        key={idx}
                        className={`flex-1 rounded-sm ${idx <= item.val ? item.color : 'bg-stone-800'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients Section with Unit Switcher & Substitute Mode Toggle */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-base font-semibold text-[#fbf8f2]">
                  정규 레시피 재료
                </h4>
                <p className="text-xs text-stone-400">
                  정확한 계량이 칵테일의 밸런스를 좌우합니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Unit Switcher */}
                <div className="flex items-center rounded-lg bg-[#16161c] border border-[#292933] p-0.5 text-xs">
                  <button
                    onClick={() => setUseOz(false)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      !useOz ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ml
                  </button>
                  <button
                    onClick={() => setUseOz(true)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      useOz ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    oz
                  </button>
                </div>

                {/* Substitute Mode Switch */}
                {cocktail.substituteTips && cocktail.substituteTips.length > 0 && (
                  <button
                    onClick={() => setUseSubstitutesMode(!useSubstitutesMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      useSubstitutesMode
                        ? 'bg-amber-500 text-[#0c0c0e] border-amber-400 font-semibold shadow-md'
                        : 'bg-[#181822] text-amber-300 border-amber-600/40 hover:bg-[#20202d]'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${useSubstitutesMode ? 'rotate-180 transition-transform' : ''}`} />
                    <span>대체 재료 적용 모드</span>
                  </button>
                )}
              </div>
            </div>

            {/* Ingredients Cards Grid */}
            <div className="space-y-2.5">
              {cocktail.ingredients.map((ing) => {
                const isOwned = userIngredients.includes(ing.id);
                // Check if this cocktail has a specific substitute tip for this ingredient
                const matchingSubTip = cocktail.substituteTips?.find(
                  (tip) => tip.ingredient.includes(ing.nameKo) || ing.nameKo.includes(tip.ingredient)
                );

                return (
                  <div
                    key={ing.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      useSubstitutesMode && matchingSubTip
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : isOwned
                        ? 'bg-[#151a17] border-emerald-900/40'
                        : 'bg-[#141419] border-[#22222a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {isOwned ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500/50" />
                        )}
                        <div>
                          <span className="font-semibold text-sm text-stone-100">
                            {ing.nameKo}
                          </span>
                          <span className="text-xs text-stone-400 block">
                            {ing.nameEn}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-amber-300">
                          {formatAmount(ing.amount, ing.unit)}
                        </span>
                        {ing.isCore && (
                          <span className="block text-[10px] text-amber-500/80 uppercase">
                            핵심 기주
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Show Substitute Advice if available */}
                    {matchingSubTip && (
                      <div className="mt-2.5 pt-2 border-t border-[#23232c] text-xs flex items-start gap-2 text-stone-300">
                        <ArrowRightLeft className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-amber-300 font-medium">
                            대체 옵션: {matchingSubTip.substitute} ({matchingSubTip.ratio})
                          </span>
                          <p className="text-stone-400 text-[11px] mt-0.5 leading-normal">
                            {matchingSubTip.tip}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="text-base font-semibold text-[#fbf8f2] mb-3">
              조주 가이드 (Step by Step)
            </h4>
            <ol className="space-y-3">
              {cocktail.instructions.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#141419] border border-[#1f1f26] text-xs sm:text-sm text-stone-200 leading-relaxed"
                >
                  <span className="font-mono text-amber-400 font-bold text-sm shrink-0 w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Pro Bartender Secret Tip */}
          <div className="p-4 rounded-xl bg-[#191612] border border-amber-600/30 flex items-start gap-3 text-xs sm:text-sm">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-1">
                마스터 믹솔로지스트의 프로 팁
              </span>
              <p className="text-amber-100/90 leading-relaxed font-light">
                {cocktail.proTip}
              </p>
            </div>
          </div>

          {/* Custom Variant Lab Section */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#15151e] border border-[#272738] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span>보유 재료로 {cocktail.nameKo} 커스텀 변형하기</span>
              </span>
              <p className="text-xs text-stone-400">
                집에 있는 특이한 과일, 청, 전통주로 {cocktail.nameKo}의 비율과 밸런스를 재구성해보세요.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onConsultAi(cocktail.nameKo);
              }}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0c0c0e] font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>커스텀 랩에서 변형 레시피 조주</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
