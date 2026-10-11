import React, { useState } from 'react';
import { RefreshCw, Wine, FlaskConical, AlertCircle, RotateCcw, Sliders } from 'lucide-react';
import { COCKTAIL_ASSETS } from '../assets/images';

interface AiBartenderViewProps {
  userIngredients: string[];
}

const SWEET_DESCRIPTORS: Record<number, string> = {
  1: '엑스트라 드라이 (Extra Dry)',
  2: '드라이 (Dry)',
  3: '라이트 드라이 (Light Dry)',
  4: '세미 드라이 (Semi Dry)',
  5: '클래식 밸런스 (Balanced)',
  6: '은은한 단맛 (Slightly Sweet)',
  7: '부드러운 스위트 (Pleasantly Sweet)',
  8: '선명한 단맛 (Sweet)',
  9: '리치 스위트 (Rich Sweet)',
  10: '디저트급 (Dessert Sweet)',
};

const SOUR_DESCRIPTORS: Record<number, string> = {
  1: '마일드 (Mild / Low Acid)',
  2: '은은한 부드러움 (Soft)',
  3: '소프트 시트러스 (Delicate)',
  4: '라이트 산미 (Light Tart)',
  5: '산뜻한 밸런스 (Balanced Tart)',
  6: '상큼한 시트러스 (Fresh Citrus)',
  7: '선명한 청량감 (Vibrant Crisp)',
  8: '강한 산미 (Crisp Citrus)',
  9: '짜릿한 산미 (Sharp Tart)',
  10: '하이 사워 (High Acidity)',
};

const STRONG_DESCRIPTORS: Record<number, string> = {
  1: '극저도수 · 이지 (~5% 미만)',
  2: '라이트 스프리츠 (~8%)',
  3: '부드러운 저도수 (~12%)',
  4: '미디엄 라이트 (~15%)',
  5: '클래식 표준 (~18-20%)',
  6: '기분 좋은 타격감 (~22%)',
  7: '단단한 스피릿감 (~25%)',
  8: '묵직한 풀바디 (~30%)',
  9: '강한 고도수 (~35%)',
  10: '헤비 하이프루프 (40%+)',
};

interface SliderControlProps {
  label: string;
  subLabel: string;
  value: number;
  onChange: (val: number) => void;
  descriptors: Record<number, string>;
  leftText: string;
  midText: string;
  rightText: string;
}

const AtelierSlider: React.FC<SliderControlProps> = ({
  label,
  subLabel,
  value,
  onChange,
  descriptors,
  leftText,
  midText,
  rightText,
}) => {
  const min = 1;
  const max = 10;
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="p-4 rounded-xl bg-[#0f0f14] border border-[#1f1f28] hover:border-[#2d2d3a] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-semibold text-stone-200 block">{label}</span>
          <span className="text-[11px] text-stone-500 font-mono">{subLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#171720] border border-[#262634] text-amber-300 font-semibold shadow-xs">
            Lv.{value} · {descriptors[value]}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onChange(Math.max(min, value - 1))}
              disabled={value <= min}
              aria-label={`${label} 1 감소`}
              className="w-6 h-6 rounded-md flex items-center justify-center bg-[#15151c] hover:bg-[#20202a] border border-[#262634] text-stone-400 hover:text-stone-200 disabled:opacity-25 disabled:cursor-not-allowed text-xs font-mono transition-colors"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => onChange(Math.min(max, value + 1))}
              disabled={value >= max}
              aria-label={`${label} 1 증가`}
              className="w-6 h-6 rounded-md flex items-center justify-center bg-[#15151c] hover:bg-[#20202a] border border-[#262634] text-stone-400 hover:text-stone-200 disabled:opacity-25 disabled:cursor-not-allowed text-xs font-mono transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex items-center h-6 my-1">
        {/* Track Bar Background */}
        <div className="w-full h-2 rounded-full bg-[#181822] border border-[#22222f] overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-amber-600/90 to-amber-400 rounded-full transition-all duration-75"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Discrete Notches for 1..10 */}
        <div className="absolute inset-x-2 flex justify-between pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${
                i + 1 <= value ? 'bg-amber-200/60' : 'bg-[#292936]'
              }`}
            />
          ))}
        </div>

        {/* Visual Slider Thumb Indicator */}
        <div
          className="absolute -translate-x-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center"
          style={{ left: `calc(${percent}% * 0.94 + 3%)` }}
        >
          <div className="w-4.5 h-4.5 rounded-full bg-[#fbf9f4] border-2 border-amber-500 shadow-md shadow-black/80 ring-2 ring-black/40" />
        </div>

        {/* Native Range for full browser and touch accessibility */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>

      <div className="flex justify-between text-[11px] text-stone-400 mt-1 font-medium">
        <span>{leftText}</span>
        <span className="text-stone-500">{midText}</span>
        <span>{rightText}</span>
      </div>
    </div>
  );
};

const MOOD_OPTIONS = [
  {
    id: '클래식 & 밸런스드',
    title: '클래식 밸런스',
    desc: '균형 잡힌 정통 비율',
  },
  {
    id: '시트러스 & 청량함',
    title: '시트러스 & 청량',
    desc: '상쾌하고 가벼운 피니시',
  },
  {
    id: '스모키 & 딥 아로마',
    title: '스모키 & 딥',
    desc: '깊고 복합적인 바디감',
  },
  {
    id: '아페리티프 & 스위트',
    title: '아페리티프',
    desc: '달콤하고 포근한 여운',
  },
];

export const AiBartenderView: React.FC<AiBartenderViewProps> = ({ userIngredients }) => {
  const [ingredientsInput, setIngredientsInput] = useState(
    userIngredients.length > 0 ? userIngredients.join(', ') : ''
  );
  const [mood, setMood] = useState('클래식 & 밸런스드');
  const [sweet, setSweet] = useState(5);
  const [sour, setSour] = useState(5);
  const [strong, setStrong] = useState(5);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetSliders = () => {
    setSweet(5);
    setSour(5);
    setStrong(5);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientsInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/gemini/custom-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredientsInput.split(',').map((s) => s.trim()),
          mood,
          preferSweet: sweet,
          preferSour: sour,
          preferStrong: strong,
        }),
      });

      if (!res.ok) {
        throw new Error('칵테일 레시피 생성에 실패했습니다.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '네트워크 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest mb-3">
          <span>Custom Mixology Atelier</span>
          <span aria-hidden="true">·</span>
          <span>오더메이드 칵테일 랩</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#fbf8f2] mb-3">
          내 냉장고 속 재료로 만드는<br />
          <span className="text-amber-400">나만의 오더메이드 시그니처</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
          어떤 조합이라도 좋습니다. 남은 양주, 과일, 음료를 입력하면 바텐더가
          황금비율로 조합한 맞춤 레시피와 대체 비법을 만들어드립니다.
        </p>
      </div>

      {/* Input Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#131318] border border-[#23232c] shadow-xl">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              현재 보유 중인 재료 목록 (쉼표로 구분)
            </label>
            <textarea
              rows={3}
              required
              value={ingredientsInput}
              onChange={(e) => setIngredientsInput(e.target.value)}
              placeholder="예: 보드카, 오렌지주스, 사이다, 레몬, 유자청, 꿀, 각얼음..."
              className="w-full p-4 rounded-xl bg-[#0d0d11] border border-[#262632] text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
            />
          </div>

          {/* Mood Direction Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              칵테일 지향 스타일 (Profile)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {MOOD_OPTIONS.map((opt) => {
                const isActive = mood === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMood(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/60 text-stone-100 ring-1 ring-amber-500/30'
                        : 'bg-[#0d0d12] border-[#22222b] text-stone-400 hover:text-stone-200 hover:border-[#2d2d3a]'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold block ${
                        isActive ? 'text-amber-400' : 'text-stone-300'
                      }`}
                    >
                      {opt.title}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5 leading-tight font-light">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refined Tasting Profile Sliders */}
          <div className="space-y-3 pt-2 border-t border-[#202029]">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>테이스팅 프로필 미세 조율 (Sliders)</span>
              </div>
              <button
                type="button"
                onClick={handleResetSliders}
                className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>표준 밸런스(5) 리셋</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <AtelierSlider
                label="단맛 밸런스"
                subLabel="Sweetness"
                value={sweet}
                onChange={setSweet}
                descriptors={SWEET_DESCRIPTORS}
                leftText="1 드라이"
                midText="5 클래식 밸런스"
                rightText="10 스위트"
              />

              <AtelierSlider
                label="산미 · 시트러스"
                subLabel="Acidity & Citrus"
                value={sour}
                onChange={setSour}
                descriptors={SOUR_DESCRIPTORS}
                leftText="1 마일드"
                midText="5 산뜻한 밸런스"
                rightText="10 하이 사워"
              />

              <AtelierSlider
                label="알코올 바디감 · 도수"
                subLabel="Strength / ABV"
                value={strong}
                onChange={setStrong}
                descriptors={STRONG_DESCRIPTORS}
                leftText="1 저도수 (Light)"
                midText="5 클래식 표준 (~20%)"
                rightText="10 고도수 (Strong)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !ingredientsInput.trim()}
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>시그니처 레시피 조주 계산 중...</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4 text-stone-950" />
                <span>시그니처 레시피 조주 공식 산출</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Result Card */}
      {result && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141419] border border-amber-500/40 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-[#24242e]">
            <div>
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest block mb-1">
                Custom Created Recipe
              </span>
              <h3 className="font-display text-3xl font-bold text-white">
                {result.nameKo}
              </h3>
              <span className="text-xs text-stone-400">
                {result.nameEn} · 약 {result.abvEstimate || 15}% ABV
              </span>
            </div>

            <span className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Wine className="w-6 h-6" />
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
            {result.concept}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#0e0e12] border border-[#1e1e24] text-xs">
            <div>
              <span className="text-stone-400 block text-[11px]">글라스웨어</span>
              <span className="font-medium text-stone-200">{result.glassType}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">얼음</span>
              <span className="font-medium text-stone-200">{result.iceType}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">가니시</span>
              <span className="font-medium text-stone-200">{result.garnish}</span>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              조주 계량 재료
            </h4>
            <div className="space-y-2">
              {result.ingredients?.map((ing: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#181822] border border-[#272733] text-xs"
                >
                  <span className="font-medium text-stone-200">{ing.name}</span>
                  <span className="font-mono text-amber-300 font-bold">{ing.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Substitutes Used Logic */}
          {result.substitutesUsed && result.substitutesUsed.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-600/30 text-xs">
              <span className="font-bold text-amber-300 block mb-2">
                대체 재료 활용 포인트
              </span>
              <div className="space-y-2">
                {result.substitutesUsed.map((sub: any, idx: number) => (
                  <div key={idx} className="text-stone-300">
                    <span className="text-stone-400">원래 재료: </span>
                    <span className="line-through text-stone-500 mr-2">{sub.original}</span>
                    <span className="text-amber-300 font-medium">→ 대체: {sub.substitutedWith}</span>
                    <p className="text-[11px] text-stone-400 mt-0.5">{sub.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              조주 순서 (Directions)
            </h4>
            <ol className="space-y-2.5">
              {result.steps?.map((step: string, i: number) => (
                <li
                  key={i}
                  className="p-3 rounded-lg bg-[#0e0e12] border border-[#1e1e24] text-xs sm:text-sm text-stone-200 flex items-start gap-3"
                >
                  <span className="font-mono text-amber-400 font-bold shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {result.bartenderComment && (
            <div className="pt-3 border-t border-[#202028] text-xs text-amber-200 italic">
              "바텐더 코멘트: {result.bartenderComment}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
