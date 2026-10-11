import React from 'react';
import { Search, Filter } from 'lucide-react';
import { COCKTAIL_ASSETS } from '../assets/images';
import { SearchSuggestionItem } from '../utils/bottleSearch';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedIngredientFilter: string | null;
  setSelectedIngredientFilter: (ing: string | null) => void;
  onNavigateToMyBar: () => void;
  suggestions?: SearchSuggestionItem[];
  onSelectSuggestion?: (item: SearchSuggestionItem) => void;
}

const POPULAR_LIQUORS = [
  { id: null, label: '전체' },
  { id: 'bourbon', label: '버번 위스키 (Bourbon)' },
  { id: 'whiskey', label: '위스키 (Whiskey)' },
  { id: 'gin', label: '진 (Gin)' },
  { id: 'vodka', label: '보드카 (Vodka)' },
  { id: 'rum', label: '럼 (Rum)' },
  { id: 'tequila', label: '데킬라 (Tequila)' },
  { id: 'brandy', label: '브랜디 (Brandy)' },
  { id: 'wine', label: '와인 (Wine)' },
  { id: 'liqueur', label: '리큐르 (Liqueur)' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  selectedIngredientFilter,
  setSelectedIngredientFilter,
  onNavigateToMyBar,
  suggestions = [],
  onSelectSuggestion,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-[#24242a] bg-[#0f0f13]">
      {/* Background Image Scrim */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={COCKTAIL_ASSETS.hero}
          alt="Luxury Cocktail Bar Speakeasy"
          className="w-full h-full object-cover object-center opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-transparent to-[#0c0c0e]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18 lg:py-20">
        <div className="max-w-3xl">
          {/* Editorial Header */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">
            <span>Craft Mixology & Substitution Guide</span>
            <span aria-hidden="true">·</span>
            <span>Est. 2026</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#fbf8f2] leading-[1.15] mb-5 text-balance">
            재료가 부족해도 완성되는<br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              황금비율 칵테일
            </span>의 세계
          </h1>

          <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8 max-w-2xl font-light">
            세계 공인 클래식 레시피부터 정밀한 재료별 검색, 그리고 빠진 재료를 완벽히
            대체하는 프로 바텐더의 솔루션까지 한곳에서 탐색하세요.
          </p>

          {/* Search Box */}
          <div className="relative flex flex-col sm:flex-row gap-3 max-w-2xl mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="칵테일 또는 보틀 검색 (예: 메이커스 마크)"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#141419] border border-[#272733] text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 text-sm shadow-xl transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white px-2 py-1 rounded bg-[#202029] border border-[#2f2f3d] cursor-pointer"
                >
                  지우기
                </button>
              )}
            </div>

            <button
              onClick={onNavigateToMyBar}
              className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-[#0c0c0e] font-semibold text-sm transition-all shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Filter className="w-4 h-4 text-[#0c0c0e]" />
              <span>내 홈바 술로 찾기</span>
            </button>
          </div>

          {/* Clean Search Suggestions (Zero-Emoji, Restrained Editorial Style) */}
          {suggestions && suggestions.length > 0 && searchQuery.trim().length >= 2 && (
            <div className="flex items-center gap-2 flex-wrap mb-5 text-xs">
              <span className="text-stone-400 font-medium">연관 검색어:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSuggestion && onSelectSuggestion(item)}
                    className="px-2.5 py-1 rounded-md bg-[#161620] hover:bg-[#1f1f2e] border border-[#272736] hover:border-amber-500/40 text-stone-200 hover:text-amber-300 text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span className="font-medium text-stone-100">{item.nameKo}</span>
                    <span className="text-[10px] text-stone-400">· {item.subText}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Liquor Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-400 mr-1 flex items-center gap-1">
              <span>대표 주류 필터:</span>
            </span>
            {POPULAR_LIQUORS.map((item) => {
              const isSelected = selectedIngredientFilter === item.id;
              return (
                <button
                  key={item.label}
                  onClick={() => setSelectedIngredientFilter(isSelected ? null : item.id)}
                  className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-medium'
                      : 'bg-[#15151b] text-stone-400 border border-[#262630] hover:text-stone-200 hover:border-stone-600'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
