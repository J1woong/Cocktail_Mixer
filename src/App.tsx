import React, { useState, useEffect, useMemo } from 'react';
import { COCKTAILS_DATABASE } from './data/cocktailsData';
import { CocktailRecipe } from './types/cocktail';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CocktailCard } from './components/CocktailCard';
import { CocktailDetailModal } from './components/CocktailDetailModal';
import { MyBarMatcher } from './components/MyBarMatcher';
import { SubstitutesView } from './components/SubstitutesView';
import { AiBartenderView } from './components/AiBartenderView';
import { Footer } from './components/Footer';
import { Filter, SlidersHorizontal, BookOpen, Search, Check, Plus, Wine } from 'lucide-react';
import {
  findBottleMatchesAndSuggestions,
  findCocktailSuggestions,
  doesCocktailUseBottleLiquor,
  SearchSuggestionItem,
} from './utils/bottleSearch';
import { BottleItem } from './data/bottlesData';

const CATEGORY_FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'classic', label: '클래식 (Classic)' },
  { id: 'modern', label: '모던 (Modern)' },
  { id: 'refreshing', label: '롱드링크 (Long Drink)' },
  { id: 'aperitif', label: '식전주 (Aperitif)' },
  { id: 'tropical', label: '트로피컬 (Tropical)' },
  { id: 'spirit-forward', label: '스피릿 포워드 (Spirit-Forward)' },
];

const METHOD_FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'shake', label: '셰이크 (Shake)' },
  { id: 'stir', label: '스터 (Stir)' },
  { id: 'build', label: '빌드 (Build)' },
  { id: 'blend', label: '블렌드 (Blend)' },
  { id: 'rolling', label: '롤링 (Rolling)' },
  { id: 'float', label: '띄우기 (Float)' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'mybar' | 'substitutes' | 'ai'>('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredientFilter, setSelectedIngredientFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  
  // Selected Cocktail for Detail View
  const [selectedCocktail, setSelectedCocktail] = useState<CocktailRecipe | null>(null);

  // User Home Bar Liquors
  const [userIngredients, setUserIngredients] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_user_bar');
      return saved ? JSON.parse(saved) : ['gin', 'bourbon', 'cointreau'];
    } catch {
      return ['gin', 'bourbon', 'cointreau'];
    }
  });

  // User Home Bar Bottles stored in localStorage
  const [userBottleIds, setUserBottleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_user_bottles');
      return saved ? JSON.parse(saved) : ['makers_mark', 'tanqueray_london_dry', 'cointreau_orange'];
    } catch {
      return ['makers_mark', 'tanqueray_london_dry', 'cointreau_orange'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('atelier_user_bar', JSON.stringify(userIngredients));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [userIngredients]);

  // Bottle search result & fuzzy suggestions
  const bottleSearchResult = useMemo(() => {
    return findBottleMatchesAndSuggestions(searchQuery);
  }, [searchQuery]);

  const cocktailSuggestions = useMemo(() => {
    return findCocktailSuggestions(searchQuery, COCKTAILS_DATABASE);
  }, [searchQuery]);

  // Combined suggestions for '이걸 찾으셨나요?'
  const searchSuggestions: SearchSuggestionItem[] = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const normQ = searchQuery.trim().toLowerCase().replace(/\s/g, '');

    const bSuggs = bottleSearchResult.suggestions.filter(
      (s) => s.nameKo.toLowerCase().replace(/\s/g, '') !== normQ
    );
    const cSuggs = cocktailSuggestions.filter(
      (s) => s.nameKo.toLowerCase().replace(/\s/g, '') !== normQ
    );

    return [...bSuggs, ...cSuggs].slice(0, 4);
  }, [searchQuery, bottleSearchResult.suggestions, cocktailSuggestions]);

  // Direct bottle matches (e.g. user typed '메이커스 마크' or '와일드 터키' or '산토리')
  const directMatchedBottles = bottleSearchResult.directMatches;
  const primaryMatchedBottle = directMatchedBottles.length > 0 ? directMatchedBottles[0] : null;

  // Best fuzzy candidate for typo auto-matching
  const bestFuzzyBottle = bottleSearchResult.bestMatch;

  // Toggle/Add bottle to user's home bar
  const handleToggleBottleInBar = (bottle: BottleItem) => {
    const isAlreadyIn = userBottleIds.includes(bottle.id);
    let nextBottleIds: string[];
    if (isAlreadyIn) {
      nextBottleIds = userBottleIds.filter((id) => id !== bottle.id);
    } else {
      nextBottleIds = [...userBottleIds, bottle.id];
    }
    setUserBottleIds(nextBottleIds);
    try {
      localStorage.setItem('atelier_user_bottles', JSON.stringify(nextBottleIds));
    } catch {
      // ignore
    }

    if (!isAlreadyIn) {
      setUserIngredients((prev) =>
        prev.includes(bottle.liquorId) ? prev : [...prev, bottle.liquorId]
      );
    }
  };

  // 1. Direct Filtering
  const directlyFilteredCocktails = useMemo(() => {
    return COCKTAILS_DATABASE.filter((cocktail) => {
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName =
          cocktail.nameKo.toLowerCase().includes(query) ||
          cocktail.nameEn.toLowerCase().includes(query) ||
          cocktail.description.toLowerCase().includes(query);
        const matchIng = cocktail.ingredients.some(
          (ing) =>
            ing.nameKo.toLowerCase().includes(query) ||
            ing.nameEn.toLowerCase().includes(query)
        );
        // Match if cocktail uses the liquor of any bottle matched directly
        const matchBottle = directMatchedBottles.some((b) =>
          doesCocktailUseBottleLiquor(cocktail, b)
        );

        if (!matchName && !matchIng && !matchBottle) return false;
      }

      // Simplified Representative Liquor Filter (버번 분리, 위스키, 리큐르[코앙트로 등], 와인[베르무트 포함], 캄파리 제외)
      if (selectedIngredientFilter) {
        let matches = false;
        if (selectedIngredientFilter === 'bourbon') {
          matches = cocktail.ingredients.some((ing) => ing.id === 'bourbon');
        } else if (selectedIngredientFilter === 'whiskey' || selectedIngredientFilter === 'whiskey_other') {
          matches = cocktail.ingredients.some((ing) =>
            ['rye_whiskey', 'scotch', 'single_malt_peat', 'single_malt_scotch', 'irish_whiskey', 'japanese_whiskey'].includes(ing.id)
          );
        } else if (selectedIngredientFilter === 'gin') {
          matches = cocktail.ingredients.some((ing) =>
            ['gin', 'dry_gin', 'botanical_gin'].includes(ing.id)
          );
        } else if (selectedIngredientFilter === 'vodka') {
          matches = cocktail.ingredients.some((ing) =>
            ['vodka', 'citron_vodka'].includes(ing.id)
          );
        } else if (selectedIngredientFilter === 'rum') {
          matches = cocktail.ingredients.some((ing) =>
            ['white_rum', 'dark_rum', 'spiced_rum'].includes(ing.id)
          );
        } else if (selectedIngredientFilter === 'tequila') {
          matches = cocktail.ingredients.some((ing) =>
            ['tequila_blanco', 'tequila_reposado', 'mezcal'].includes(ing.id)
          );
        } else if (selectedIngredientFilter === 'brandy') {
          matches = cocktail.ingredients.some((ing) =>
            ['cognac', 'brandy', 'calvados', 'pisco'].includes(ing.id)
          );
        } else if (selectedIngredientFilter === 'wine') {
          matches = cocktail.ingredients.some((ing) =>
            ['sweet_vermouth', 'dry_vermouth', 'prosecco_champagne', 'red_wine', 'dry_white_wine', 'ruby_port'].includes(ing.id) ||
            ing.category === 'wine_vermouth'
          );
        } else if (selectedIngredientFilter === 'liqueur') {
          matches = cocktail.ingredients.some((ing) =>
            ['cointreau', 'triple_sec_generic', 'grand_marnier', 'kahlua', 'maraschino', 'amaretto', 'creme_de_cassis', 'chartreuse_green', 'baileys', 'benedictine'].includes(ing.id)
          );
        } else {
          matches = cocktail.ingredients.some((ing) => ing.id === selectedIngredientFilter);
        }

        if (!matches) return false;
      }

      // Category Filter
      if (selectedCategory !== 'all' && cocktail.category !== selectedCategory) {
        return false;
      }

      // Method Filter
      if (selectedMethod !== 'all' && cocktail.method !== selectedMethod) {
        return false;
      }

      return true;
    });
  }, [searchQuery, directMatchedBottles, selectedIngredientFilter, selectedCategory, selectedMethod]);

  // 2. Fuzzy Auto-Match if direct search produced 0 results but we have a close bottle match
  // (e.g. user typed '버펄로' -> matches '버팔로 트레이스', '와일키' -> matches '와일드 터키 101')
  const isFuzzyAutoMatched =
    searchQuery.trim().length >= 2 &&
    directlyFilteredCocktails.length === 0 &&
    Boolean(bestFuzzyBottle);

  const autoMatchedBottle = isFuzzyAutoMatched ? bestFuzzyBottle : null;

  const filteredCocktails = useMemo(() => {
    if (directlyFilteredCocktails.length > 0) return directlyFilteredCocktails;
    if (autoMatchedBottle) {
      return COCKTAILS_DATABASE.filter((cocktail) => {
        const matchesBottle = doesCocktailUseBottleLiquor(cocktail, autoMatchedBottle);
        if (!matchesBottle) return false;
        if (selectedCategory !== 'all' && cocktail.category !== selectedCategory) return false;
        if (selectedMethod !== 'all' && cocktail.method !== selectedMethod) return false;
        return true;
      });
    }
    return directlyFilteredCocktails;
  }, [directlyFilteredCocktails, autoMatchedBottle, selectedCategory, selectedMethod]);

  const handleConsultAi = (cocktailName: string) => {
    setActiveTab('substitutes');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#f4efe6] flex flex-col font-sans selection:bg-amber-600/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedBarCount={userIngredients.length}
        onOpenMyBar={() => setActiveTab('mybar')}
      />

      <main className="flex-1">
        {activeTab === 'recipes' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedIngredientFilter={selectedIngredientFilter}
              setSelectedIngredientFilter={setSelectedIngredientFilter}
              onNavigateToMyBar={() => setActiveTab('mybar')}
              suggestions={searchSuggestions}
              onSelectSuggestion={(item) => setSearchQuery(item.searchTerm)}
            />

            {/* Recipes Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
              {/* Filter Controls: Stacked Rows (칵테일 종류 & 칵테일 기법) */}
              <div className="space-y-3.5 pb-6 border-b border-[#21212a]">
                {/* 칵테일 종류 (Category) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 shrink-0 font-medium">
                    <Filter className="w-3.5 h-3.5 text-amber-500" />
                    <span>칵테일 종류:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {CATEGORY_FILTERS.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-amber-500 text-[#0c0c0e] font-semibold shadow-sm'
                            : 'bg-[#15151c] text-stone-400 hover:text-stone-200 hover:bg-[#1a1a24] border border-[#23232d]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 칵테일 기법 (Method) - 칵테일 종류 카테고리 아래에 위치 */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 shrink-0 font-medium">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                    <span>칵테일 기법:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {METHOD_FILTERS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          selectedMethod === m.id
                            ? 'bg-stone-200 text-stone-900 font-semibold shadow-sm'
                            : 'bg-[#15151c] text-stone-400 hover:text-stone-200 hover:bg-[#1a1a24] border border-[#23232d]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <span>총 <strong className="text-amber-400 font-mono">{filteredCocktails.length}</strong>개의 칵테일</span>
                  {(selectedIngredientFilter || selectedCategory !== 'all' || selectedMethod !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedIngredientFilter(null);
                        setSelectedCategory('all');
                        setSelectedMethod('all');
                      }}
                      className="text-amber-500 hover:underline ml-2 cursor-pointer"
                    >
                      필터 모두 해제
                    </button>
                  )}
                </div>

                {userIngredients.length > 0 && (
                  <span className="hidden sm:inline text-stone-400">
                    내 홈바 술 ({userIngredients.length}종) 기반 매칭 표시 중
                  </span>
                )}
              </div>

              {/* Primary Bottle Match Banner */}
              {primaryMatchedBottle && searchQuery.trim() && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#14141d] border border-[#262636] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#1c1c28] border border-[#2e2e42] flex items-center justify-center shrink-0">
                      <Wine className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-xs text-stone-400">
                        <span className="text-amber-400 font-medium">보틀 검색 매칭</span>
                        <span aria-hidden="true" className="text-stone-600">·</span>
                        <span className="text-stone-300">{primaryMatchedBottle.groupNameKo}</span>
                        <span aria-hidden="true" className="text-stone-600">·</span>
                        <span className="font-mono text-stone-300">{primaryMatchedBottle.abv}% ABV</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#fbf8f2]">
                        '{primaryMatchedBottle.nameKo}' 베이스 칵테일
                      </h3>
                      <p className="text-xs text-stone-400 font-light mt-0.5">
                        {primaryMatchedBottle.flavorDesc || primaryMatchedBottle.nameEn}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBottleInBar(primaryMatchedBottle)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto ${
                      userBottleIds.includes(primaryMatchedBottle.id)
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-amber-500 hover:bg-amber-400 text-[#0c0c0e] font-semibold'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {userBottleIds.includes(primaryMatchedBottle.id)
                        ? '홈바 등록됨 (해제)'
                        : '내 홈바에 이 보틀 등록'}
                    </span>
                  </button>
                </div>
              )}

              {/* Fuzzy Auto-Match Notice Banner */}
              {isFuzzyAutoMatched && autoMatchedBottle && (
                <div className="p-3.5 rounded-xl bg-[#14141d] border border-[#272736] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-300 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-medium shrink-0">검색 제안</span>
                    <span aria-hidden="true" className="text-stone-600">·</span>
                    <span>
                      '{searchQuery}' 대신 연관 보틀인 <strong className="text-amber-300 font-medium">{autoMatchedBottle.nameKo}</strong> ({autoMatchedBottle.groupNameKo}) 레시피를 표시하고 있습니다.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleBottleInBar(autoMatchedBottle)}
                      className="px-3 py-1.5 rounded-md bg-[#1e1e2a] hover:bg-[#282838] border border-[#2e2e40] text-amber-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {userBottleIds.includes(autoMatchedBottle.id) ? '홈바 등록됨' : '+ 내 홈바에 등록'}
                    </button>
                  </div>
                </div>
              )}

              {/* Cocktails Grid */}
              {filteredCocktails.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-[#121217] border border-dashed border-[#262632]">
                  <Search className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-stone-300 mb-1">
                    '{searchQuery}'에 대한 검색 결과가 없습니다
                  </h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto mb-5">
                    검색어나 필터 조건을 변경해보시거나, 아래의 연관 추천 보틀을 확인해보세요.
                  </p>

                  {/* Empty state suggestions */}
                  {searchSuggestions.length > 0 && (
                    <div className="mt-4 mb-6 p-4 rounded-xl bg-[#14141c] border border-[#242430] max-w-lg mx-auto">
                      <p className="text-xs font-medium text-stone-400 mb-2.5">
                        연관 추천 검색어:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {searchSuggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSearchQuery(item.searchTerm)}
                            className="px-3 py-1.5 rounded-md bg-[#181822] hover:bg-[#20202e] border border-[#262634] text-stone-200 hover:text-amber-300 text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span className="font-medium text-stone-100">{item.nameKo}</span>
                            <span className="text-[10px] text-stone-400">· {item.subText}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedIngredientFilter(null);
                      setSelectedCategory('all');
                      setSelectedMethod('all');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#20202a] text-xs font-medium text-amber-300 hover:bg-[#282836] transition-colors cursor-pointer"
                  >
                    전체 목록 다시 보기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCocktails.map((cocktail) => (
                    <CocktailCard
                      key={cocktail.id}
                      cocktail={cocktail}
                      onSelect={(c) => setSelectedCocktail(c)}
                      userIngredients={userIngredients}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: My Bar Matcher */}
        {activeTab === 'mybar' && (
          <MyBarMatcher
            userIngredients={userIngredients}
            setUserIngredients={setUserIngredients}
            onSelectCocktail={(c) => setSelectedCocktail(c)}
          />
        )}

        {/* Tab 3: Substitutes Encyclopedia */}
        {activeTab === 'substitutes' && <SubstitutesView />}

        {/* Tab 4: AI Mixologist Custom Studio */}
        {activeTab === 'ai' && (
          <AiBartenderView userIngredients={userIngredients} />
        )}
      </main>

      {/* Cocktail Detail Modal */}
      <CocktailDetailModal
        cocktail={selectedCocktail}
        onClose={() => setSelectedCocktail(null)}
        onConsultAi={handleConsultAi}
        userIngredients={userIngredients}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
