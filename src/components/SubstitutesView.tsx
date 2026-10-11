import React, { useState } from 'react';
import { SUBSTITUTIONS_DATABASE } from '../data/substitutesData';
import { Search, Scale, RefreshCw, AlertCircle, CheckCircle, Lightbulb, FlaskConical, Sliders } from 'lucide-react';
import { COCKTAIL_ASSETS } from '../assets/images';

export const SubstitutesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<string>('all');

  // AI Consultation States
  const [aiTarget, setAiTarget] = useState('');
  const [aiCocktail, setAiCocktail] = useState('');
  const [aiPantry, setAiPantry] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredRules = SUBSTITUTIONS_DATABASE.filter((rule) => {
    const matchesSearch =
      searchQuery === '' ||
      rule.originalNameKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.substituteNameKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.flavorImpact.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIngredient =
      selectedIngredient === 'all' || rule.originalId === selectedIngredient;

    return matchesSearch && matchesIngredient;
  });

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTarget.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch('/api/gemini/substitute-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetIngredient: aiTarget,
          cocktailContext: aiCocktail,
          availableIngredients: aiPantry,
        }),
      });

      if (!res.ok) {
        throw new Error('대체 조언 생성에 실패했습니다.');
      }

      const data = await res.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Editorial Header Section */}
      <div className="relative rounded-2xl overflow-hidden bg-[#131318] border border-[#23232c] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">
            <span>Mixology Substitution Encyclopedia</span>
            <span aria-hidden="true">·</span>
            <span>대체 재료 공식 백과</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#fbf8f2] mb-3">
            비싼 보틀이 없어도 괜찮습니다.<br />
            <span className="text-amber-400">과학적 대체 공식</span>으로 밸런스를 지켜냅니다
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
            리큐어의 당도, 과즙의 pH 산도, 스피릿의 도수와 오크 숙성도를 분석하여
            맛의 오차를 최소화하는 바텐더 공인 비율 조절법을 확인하세요.
          </p>
        </div>

        {/* Visual Showcase Card */}
        <div className="w-full md:w-72 h-44 rounded-xl overflow-hidden relative border border-[#2d2d38] shrink-0">
          <img
            src={COCKTAIL_ASSETS.substitutes}
            alt="Cocktail Substitute Tasting Comparison"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
            <span className="text-[11px] text-stone-300 font-light">
              풍미 유사도 80~95% 검증 레시피
            </span>
          </div>
        </div>
      </div>

      {/* Search & Quick Target Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="대체하고 싶은 재료 검색 (예: 코앙트로, 캄파리, 베르무트, 라임, 설탕시럽)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#14141a] border border-[#262632] text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
            />
          </div>

          <select
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
            className="px-4 py-3 rounded-xl bg-[#14141a] border border-[#262632] text-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">전체</option>
            <option value="cointreau">코앙트로 (트리플 섹)</option>
            <option value="campari">캄파리 (Campari)</option>
            <option value="sweet_vermouth">스위트 베르무트</option>
            <option value="dry_vermouth">드라이 베르무트</option>
            <option value="lime_juice">생 라임 즙</option>
            <option value="bourbon">버번 위스키</option>
            <option value="gin">드라이 진</option>
            <option value="angostura_bitters">앙고스투라 비터스</option>
            <option value="kahlua">깔루아 (커피 리큐어)</option>
            <option value="simple_syrup">심플 시럽</option>
            <option value="egg_white">계란 흰자</option>
            <option value="ginger_beer">진저 비어</option>
            <option value="orgeat_syrup">오르샤 시럽</option>
          </select>
        </div>
      </div>

      {/* Master Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRules.map((rule) => (
          <article
            key={rule.id}
            className="p-6 rounded-2xl bg-[#131318] border border-[#22222b] hover:border-amber-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header: Original -> Substitute */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#202028]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-stone-200">
                    {rule.originalNameKo}
                  </span>
                  <span className="text-stone-500">→</span>
                  <span className="font-bold text-sm text-amber-300">
                    {rule.substituteNameKo}
                  </span>
                </div>

                {/* Similarity Badge */}
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  {rule.similarity}% 유사
                </span>
              </div>

              {/* Ratio Rule */}
              <div className="p-3 rounded-xl bg-[#0e0e12] border border-[#1b1b22] mb-3.5 text-xs">
                <span className="text-amber-400 font-semibold block mb-0.5 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>용량 및 비율 조절 공식</span>
                </span>
                <span className="text-stone-200 font-medium">{rule.ratioRule}</span>
              </div>

              {/* Flavor Impact */}
              <div className="space-y-1 mb-3.5 text-xs">
                <span className="text-stone-400 font-medium block">
                  풍미와 밸런스 변화:
                </span>
                <p className="text-stone-300 font-light leading-relaxed">
                  {rule.flavorImpact}
                </p>
              </div>

              {/* Bartender Pro Tip */}
              <div className="p-3 rounded-xl bg-[#181611] border border-amber-800/30 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block mb-0.5">실전 팁</span>
                  <p>{rule.bartenderTip}</p>
                </div>
              </div>
            </div>

            {/* Applicable in */}
            <div className="mt-4 pt-3 border-t border-[#1e1e26] text-[11px] text-stone-400 flex items-center justify-between">
              <span>적용: {rule.applicability}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Live Mixology Custom Ratio Calculator */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#131319] border border-[#242432] shadow-xl">
        <div className="max-w-2xl mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1.5">
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <span>Custom Ratio & Balance Calculator</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#fbf8f2] mb-2">
            냉장고 속 특이한 재료, 최적의 대체 비율을 계산합니다
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
            사전에 등록되지 않은 재료(예: 매실청, 유자청, 소주, 복분자주, 한라봉 등)가 있을 때,
            당도와 산도, 알코올 밸런스를 고려한 조주 비율과 플레이버 보정 가이드를 실시간으로 계산해 드립니다.
          </p>
        </div>

        <form onSubmit={handleAskAi} className="space-y-4 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                대체하고 싶은 재료 (필수)
              </label>
              <input
                type="text"
                required
                value={aiTarget}
                onChange={(e) => setAiTarget(e.target.value)}
                placeholder="예: 코앙트로, 라임즙, 앙고스투라 비터스..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0d12] border border-[#272b38] text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                만들고자 하는 칵테일 (선택)
              </label>
              <input
                type="text"
                value={aiCocktail}
                onChange={(e) => setAiCocktail(e.target.value)}
                placeholder="예: 마가리타, 올드 패션드, 모히토..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0d12] border border-[#272b38] text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              현재 집에 있는 대체 후보 재료 / 상황
            </label>
            <input
              type="text"
              value={aiPantry}
              onChange={(e) => setAiPantry(e.target.value)}
              placeholder="예: 매실청, 유자청, 레몬즙, 한라산 소주, 꿀..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0d12] border border-[#272b38] text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={aiLoading || !aiTarget.trim()}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0c0c0e] font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {aiLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#0c0c0e]" />
                <span>최적 비율 계산 중...</span>
              </>
            ) : (
              <>
                <Sliders className="w-4 h-4 text-[#0c0c0e]" />
                <span>대체 공식 계산하기</span>
              </>
            )}
          </button>
        </form>

        {/* Error */}
        {aiError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {/* Results */}
        {aiResult && (
          <div className="mt-6 p-6 rounded-xl bg-[#0f0f15] border border-[#2c2c3e] space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>믹솔로지스트의 대체 배합 분석서</span>
            </div>

            {aiResult.bestSubstitutes && aiResult.bestSubstitutes.length > 0 && (
              <div className="space-y-3">
                {aiResult.bestSubstitutes.map((sub: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-[#15151e] border border-[#252533] text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-amber-300 text-sm">{sub.name}</span>
                      {sub.similarityScore && (
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {sub.similarityScore}% 매칭
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 text-stone-300">
                      <p><strong className="text-stone-400">비율 조절:</strong> {sub.ratioAdjustment}</p>
                      <p><strong className="text-stone-400">풍미 변화:</strong> {sub.flavorImpact}</p>
                      {sub.bartenderTip && (
                        <p className="text-amber-200/90"><strong className="text-amber-400">바텐더 팁:</strong> {sub.bartenderTip}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aiResult.creativeAlternative && (
              <div className="p-3.5 rounded-lg bg-[#181611] border border-amber-800/40 text-xs text-amber-200">
                <strong className="block text-amber-300 mb-0.5">마트/가정용 크리에이티브 대안:</strong>
                <p>{aiResult.creativeAlternative}</p>
              </div>
            )}

            {aiResult.overallAdvice && (
              <p className="text-xs text-stone-300 italic pt-2 border-t border-[#232330]">
                "{aiResult.overallAdvice}"
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
