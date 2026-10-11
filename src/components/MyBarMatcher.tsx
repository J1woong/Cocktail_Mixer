import React, { useState, useEffect, useMemo } from 'react';
import { BOTTLE_GROUPS, BottleItem } from '../data/bottlesData';
import { COCKTAILS_DATABASE } from '../data/cocktailsData';
import { CocktailRecipe, LiquorCategory } from '../types/cocktail';
import { CocktailCard } from './CocktailCard';
import { Check, Plus, Trash2, Wine, Info, Search, Filter, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { calculateHangulSimilarity, findBottleMatchesAndSuggestions } from '../utils/bottleSearch';

interface MyBarMatcherProps {
  userIngredients: string[];
  setUserIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  onSelectCocktail: (cocktail: CocktailRecipe) => void;
}

// Flattened list of all bottles
const ALL_BOTTLES: BottleItem[] = BOTTLE_GROUPS.flatMap((g) => g.bottles);

// Filter Tabs for Cabinet
const CABINET_CATEGORY_TABS: { id: 'all' | LiquorCategory; nameKo: string }[] = [
  { id: 'all', nameKo: '전체' },
  { id: 'bourbon', nameKo: '버번 위스키' },
  { id: 'whiskey', nameKo: '위스키' },
  { id: 'gin', nameKo: '진' },
  { id: 'vodka', nameKo: '보드카' },
  { id: 'rum', nameKo: '럼' },
  { id: 'tequila_mezcal', nameKo: '데킬라' },
  { id: 'brandy', nameKo: '브랜디' },
  { id: 'wine', nameKo: '와인' },
  { id: 'liqueur', nameKo: '리큐르' },
  { id: 'traditional', nameKo: '전통주' },
];

// Presets using bottle collections
const PRESET_BOTTLE_SETS = [
  {
    name: '홈텐딩 3대 기주 세트',
    description: '탱커레이, 앱솔루트, 바카디 슈페리어',
    bottleIds: ['tanqueray_london_dry', 'absolut_blue', 'bacardi_superior'],
  },
  {
    name: '버번 & 맨해튼 세트',
    description: '메이커스 마크, 불렛 라이, 마티니 로쏘',
    bottleIds: ['makers_mark', 'bulleit_rye', 'martini_rosso'],
  },
  {
    name: '클래식 마티니 세트',
    description: '탱커레이, 마티니 엑스트라 드라이',
    bottleIds: ['tanqueray_london_dry', 'martini_extra_dry'],
  },
  {
    name: '갓파더 & 아마레또 세트',
    description: '조니워커 블랙, 디사론노 아마레또',
    bottleIds: ['johnnie_walker_black', 'disaronno_amaretto'],
  },
  {
    name: '데킬라 & 마가리타 세트',
    description: '호세 쿠에르보 실버, 코앙트로',
    bottleIds: ['jose_cuervo_silver', 'cointreau_orange'],
  },
  {
    name: '카페 & 커피 칵테일 세트',
    description: '앱솔루트, 깔루아',
    bottleIds: ['absolut_blue', 'kahlua_coffee'],
  },
];

export const MyBarMatcher: React.FC<MyBarMatcherProps> = ({
  userIngredients,
  setUserIngredients,
  onSelectCocktail,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | LiquorCategory>('all');
  const [matchTab, setMatchTab] = useState<'all' | 'ready' | 'substitute' | 'missing1'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Section-level collapse (fold entire checklist to focus on matched recipes)
  const [isCabinetCollapsed, setIsCabinetCollapsed] = useState(false);

  // Group-level collapse state (Set of group IDs that are collapsed)
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Persisted checked bottle IDs
  const [selectedBottleIds, setSelectedBottleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('atelier_user_bottles');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Initialize default bottles if user already has initial userIngredients
    const initial: string[] = [];
    if (userIngredients.includes('bourbon')) initial.push('makers_mark');
    if (userIngredients.includes('gin')) initial.push('tanqueray_london_dry');
    if (userIngredients.includes('cointreau')) initial.push('cointreau_orange');
    if (userIngredients.includes('vodka')) initial.push('absolut_blue');
    if (userIngredients.includes('white_rum')) initial.push('bacardi_superior');
    if (userIngredients.includes('scotch')) initial.push('johnnie_walker_black');
    return initial.length > 0 ? initial : ['makers_mark', 'tanqueray_london_dry', 'cointreau_orange'];
  });

  // Sync selected bottles to localStorage and to parent userIngredients (recipe liquor IDs)
  useEffect(() => {
    try {
      localStorage.setItem('atelier_user_bottles', JSON.stringify(selectedBottleIds));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }

    // Map checked bottle IDs into distinct recipe liquor IDs
    const activeLiquors = Array.from(
      new Set(
        selectedBottleIds
          .map((bId) => ALL_BOTTLES.find((b) => b.id === bId)?.liquorId)
          .filter(Boolean) as string[]
      )
    );

    setUserIngredients(activeLiquors);
  }, [selectedBottleIds, setUserIngredients]);

  // Toggle single bottle
  const toggleBottle = (bottleId: string) => {
    setSelectedBottleIds((prev) =>
      prev.includes(bottleId)
        ? prev.filter((id) => id !== bottleId)
        : [...prev, bottleId]
    );
  };

  // Presets
  const applyPreset = (bottleIds: string[]) => {
    const combined = Array.from(new Set([...selectedBottleIds, ...bottleIds]));
    setSelectedBottleIds(combined);
  };

  // Clear all
  const clearBar = () => {
    setSelectedBottleIds([]);
    setUserIngredients([]);
  };

  // Cabinet search suggestions for typos/similar names
  const cabinetSearchResult = useMemo(() => {
    return findBottleMatchesAndSuggestions(searchFilter);
  }, [searchFilter]);

  const cabinetSuggestions = cabinetSearchResult.suggestions;

  // Filter Groups based on Category Tab and Search Query (including aliases & fuzzy matching)
  const filteredGroups = useMemo(() => {
    const rawQuery = searchFilter.trim();
    const query = rawQuery.toLowerCase();

    return BOTTLE_GROUPS.map((group) => {
      // Check category match
      const matchesCategory =
        selectedCategory === 'all' ||
        group.category === selectedCategory;

      if (!matchesCategory) return null;

      // Filter bottles within the group by search query
      const matchingBottles = group.bottles.filter((b) => {
        if (!query) return true;

        // 1. Direct name/group/flavor match
        if (
          b.nameKo.toLowerCase().includes(query) ||
          b.nameEn.toLowerCase().includes(query) ||
          group.nameKo.toLowerCase().includes(query) ||
          (b.flavorDesc && b.flavorDesc.toLowerCase().includes(query))
        ) {
          return true;
        }

        // 2. Aliases match
        if (
          b.aliases &&
          b.aliases.some(
            (a) => a.toLowerCase().includes(query) || query.includes(a.toLowerCase())
          )
        ) {
          return true;
        }

        // 3. Korean phonetic / Jamo similarity (for typos like 버펄로, 와일키, 봄배이, 탱거레이, 쿠앙트로, 디사로노)
        if (rawQuery.length >= 2) {
          const simName = calculateHangulSimilarity(rawQuery, b.nameKo);
          if (simName >= 0.6) return true;

          if (b.aliases && b.aliases.some((a) => calculateHangulSimilarity(rawQuery, a) >= 0.65)) {
            return true;
          }
        }

        return false;
      });

      if (matchingBottles.length === 0) return null;

      return {
        ...group,
        bottles: matchingBottles,
      };
    }).filter(Boolean) as (typeof BOTTLE_GROUPS[0])[];
  }, [selectedCategory, searchFilter]);

  const collapseAllGroups = () => {
    setCollapsedGroupIds(new Set(filteredGroups.map((g) => g.id)));
  };

  const expandAllGroups = () => {
    setCollapsedGroupIds(new Set());
  };

  const isAllGroupsCollapsed =
    filteredGroups.length > 0 &&
    filteredGroups.every((g) => collapsedGroupIds.has(g.id));

  // If user enters a search query, automatically unfold matching groups so results are immediately visible
  useEffect(() => {
    if (searchFilter.trim().length > 0) {
      setCollapsedGroupIds(new Set());
    }
  }, [searchFilter]);

  // Calculate Cocktails based on REQUIRED LIQUORS ONLY
  const analyzedCocktails = useMemo(() => {
    return COCKTAILS_DATABASE.map((cocktail) => {
      const requiredLiquors = cocktail.ingredients.filter(
        (ing) => ['spirit', 'liqueur', 'wine_vermouth'].includes(ing.category) || ing.isAlcoholic
      );

      const totalLiquorCount = requiredLiquors.length;

      const ownedLiquors = requiredLiquors.filter((ing) =>
        userIngredients.includes(ing.id)
      );

      const missingLiquors = requiredLiquors.filter(
        (ing) => !userIngredients.includes(ing.id)
      );

      const replaceableMissing = missingLiquors.filter((missing) => {
        if (!missing.substituteIds) return false;
        return missing.substituteIds.some((subId) => userIngredients.includes(subId));
      });

      const isFullyReady = totalLiquorCount > 0 && ownedLiquors.length === totalLiquorCount;
      const isReadyWithSubs =
        !isFullyReady &&
        totalLiquorCount > 0 &&
        ownedLiquors.length + replaceableMissing.length === totalLiquorCount;
      const isMissingOnlyOne =
        !isFullyReady && !isReadyWithSubs && missingLiquors.length === 1;

      const matchRate =
        totalLiquorCount > 0
          ? Math.round((ownedLiquors.length / totalLiquorCount) * 100)
          : 0;

      return {
        cocktail,
        requiredLiquors,
        ownedLiquors,
        missingLiquors,
        replaceableMissing,
        isFullyReady,
        isReadyWithSubs,
        isMissingOnlyOne,
        matchRate,
      };
    });
  }, [userIngredients]);

  const fullyReadyCocktails = analyzedCocktails.filter((item) => item.isFullyReady);
  const readyWithSubsCocktails = analyzedCocktails.filter((item) => item.isReadyWithSubs);
  const missingOneCocktails = analyzedCocktails.filter((item) => item.isMissingOnlyOne);

  const displayList = useMemo(() => {
    if (matchTab === 'ready') return fullyReadyCocktails;
    if (matchTab === 'substitute') return readyWithSubsCocktails;
    if (matchTab === 'missing1') return missingOneCocktails;

    return [...analyzedCocktails].sort((a, b) => {
      if (a.isFullyReady && !b.isFullyReady) return -1;
      if (!a.isFullyReady && b.isFullyReady) return 1;
      if (a.isReadyWithSubs && !b.isReadyWithSubs) return -1;
      if (!a.isReadyWithSubs && b.isReadyWithSubs) return 1;
      if (a.isMissingOnlyOne && !b.isMissingOnlyOne) return -1;
      if (!a.isMissingOnlyOne && b.isMissingOnlyOne) return 1;
      return b.matchRate - a.matchRate;
    });
  }, [matchTab, fullyReadyCocktails, readyWithSubsCocktails, missingOneCocktails, analyzedCocktails]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#131318] border border-[#23232c] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">
            <span>Home Bar Bottle Cabinet</span>
            <span aria-hidden="true">·</span>
            <span>보유 보틀 이름 기반 스마트 매칭</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#fbf8f2] mb-3">
            집에 어떤 <span className="text-amber-400">보틀</span>을 가지고 계신가요?
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed mb-4">
            어려운 술 종류를 몰라도 괜찮습니다. 메이커스 마크, 와일드 터키, 조니워커, 산토리 가쿠빈, 바카디 등
            집에 있는 <strong className="text-stone-100 font-medium">실제 보틀 이름</strong>을 체크하시면
            자동으로 완성 가능한 칵테일과 대체 레시피를 계산해 드립니다.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>비터스, 라임/레몬즙, 시럽, 탄산수 등 부가 재료는 기본 구비된 것으로 계산됩니다.</span>
          </div>
        </div>

        {/* Quick Bottle Sets */}
        <div className="w-full md:w-80 shrink-0 space-y-2 p-4 rounded-xl bg-[#0c0c0e]/80 border border-[#272733]">
          <span className="text-xs font-semibold text-stone-300 block mb-2">
            인기 홈바 보틀 세트 담기:
          </span>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {PRESET_BOTTLE_SETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.bottleIds)}
                className="text-left px-3 py-2 rounded-lg bg-[#181822] hover:bg-[#222230] text-xs transition-colors flex items-center justify-between gap-3 border border-[#2b2b3a] cursor-pointer"
              >
                <div>
                  <span className="font-medium text-amber-300 block">{preset.name}</span>
                  <span className="text-[10px] text-stone-400 block">{preset.description}</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liquor Cabinet Section (Checkable Bottles by Groups) */}
      <div className="rounded-2xl bg-[#111116] border border-[#23232c] p-6 sm:p-8 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#21212a]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-bold text-[#fbf8f2] flex items-center gap-2.5">
                <span>내 홈바 보틀 체크리스트 (Bottle Cabinet)</span>
              </h3>
              <span className="text-xs font-mono font-normal text-amber-400 px-2.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                선택된 보틀: {selectedBottleIds.length}병
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              보틀 이름을 확인하고 체크하세요. 각 주류 카테고리를 클릭하여 접거나 펼칠 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input (visible when cabinet is not collapsed) */}
            {!isCabinetCollapsed && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="보틀 검색 (예: 메이커스 마크)"
                  className="pl-8 pr-3 py-2 text-xs rounded-lg bg-[#181822] border border-[#2f2f3d] text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 w-44 sm:w-60"
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-white px-1 py-0.5 rounded bg-stone-800 cursor-pointer"
                  >
                    지우기
                  </button>
                )}
              </div>
            )}

            {selectedBottleIds.length > 0 && !isCabinetCollapsed && (
              <button
                onClick={clearBar}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-rose-400 transition-colors px-3 py-2 rounded-lg bg-[#1a1a22] border border-[#2c2c38] cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">전체 비우기</span>
              </button>
            )}

            {/* Toggle Entire Cabinet Section */}
            <button
              type="button"
              onClick={() => setIsCabinetCollapsed(!isCabinetCollapsed)}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer shrink-0 font-medium"
            >
              {isCabinetCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>체크리스트 열기</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>체크리스트 접기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* When Cabinet Section itself is collapsed */}
        {isCabinetCollapsed ? (
          <div className="py-6 px-5 rounded-xl bg-[#14141c] border border-[#21212b] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-medium text-stone-200">
                체크리스트가 접혀 있습니다 (선택된 보틀:{' '}
                <span className="text-amber-400 font-mono font-bold">{selectedBottleIds.length}병</span>
                {userIngredients.length > 0 && (
                  <span className="text-stone-400 text-xs font-normal ml-1">
                    · {userIngredients.length}종 기주 카테고리
                  </span>
                )}
                )
              </p>
              <p className="text-xs text-stone-400 font-light">
                {selectedBottleIds.length > 0
                  ? '선택된 보틀을 바탕으로 하단에서 바로 완성 가능한 칵테일 분석을 확인하실 수 있습니다.'
                  : '체크리스트를 펼쳐 집에 보유 중인 보틀을 등록해보세요.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCabinetCollapsed(false)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0c0c0e] font-semibold text-xs transition-colors cursor-pointer shrink-0"
            >
              보틀 목록 펼쳐서 수정하기
            </button>
          </div>
        ) : (
          <>
            {/* Search Suggestions (Clean Editorial Style) */}
            {cabinetSuggestions.length > 0 && searchFilter.trim().length >= 2 && (
              <div className="flex items-center gap-2 flex-wrap mb-6 text-xs">
                <span className="text-stone-400 font-medium shrink-0">연관 추천 보틀:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cabinetSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSearchFilter(item.searchTerm);
                        setSelectedCategory('all');
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#161622] hover:bg-[#1e1e2c] border border-[#262636] hover:border-amber-500/40 text-stone-200 hover:text-amber-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="font-medium text-stone-100">{item.nameKo}</span>
                      <span className="text-[10px] text-stone-400">· {item.subText}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter Tabs and Master Expand/Collapse Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin">
                {CABINET_CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-[#0c0c0e] font-bold shadow-sm'
                        : 'bg-[#181820] text-stone-400 hover:text-stone-200 border border-[#262632]'
                    }`}
                  >
                    <span>{cat.nameKo}</span>
                  </button>
                ))}
              </div>

              {/* Master Fold / Unfold Button */}
              {filteredGroups.length > 0 && (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={isAllGroupsCollapsed ? expandAllGroups : collapseAllGroups}
                    className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-[#181822] hover:bg-[#20202c] border border-[#292938] transition-colors cursor-pointer"
                  >
                    <ChevronsUpDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAllGroupsCollapsed ? '모든 술 목록 펼치기' : '모든 술 목록 접기'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Group-by-Group Bottle Checklists */}
            <div className="space-y-4">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl bg-[#14141c] border border-dashed border-[#282836] text-xs">
                  <p className="text-stone-400 mb-3">'{searchFilter}'에 일치하는 보틀이 보관함에 없습니다.</p>
                  {cabinetSuggestions.length > 0 && (
                    <div className="max-w-md mx-auto">
                      <p className="text-stone-400 font-medium mb-2.5">
                        연관 추천 보틀:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {cabinetSuggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSearchFilter(item.searchTerm);
                              setSelectedCategory('all');
                            }}
                            className="px-3 py-1.5 rounded-md bg-[#1a1a24] hover:bg-[#222230] border border-[#282838] text-stone-200 text-xs transition-colors cursor-pointer"
                          >
                            <span className="font-medium text-amber-300">{item.nameKo}</span>
                            <span className="text-[10px] text-stone-400 ml-1.5">({item.subText})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const isGroupCollapsed = collapsedGroupIds.has(group.id);
                  const selectedBottlesInGroup = group.bottles.filter((b) =>
                    selectedBottleIds.includes(b.id)
                  );
                  const selectedCountInGroup = selectedBottlesInGroup.length;

                  return (
                    <div
                      key={group.id}
                      className="rounded-xl border border-[#21212c] bg-[#14141b] overflow-hidden transition-all duration-200"
                    >
                      {/* Clickable Header Accordion Bar */}
                      <button
                        type="button"
                        onClick={() => toggleGroupCollapse(group.id)}
                        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left bg-[#161622] hover:bg-[#1c1c2a] transition-colors cursor-pointer select-none"
                        aria-expanded={!isGroupCollapsed}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-1 rounded-md text-amber-400 transition-transform duration-200 ${
                              isGroupCollapsed ? '-rotate-90' : 'rotate-0'
                            }`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <h4 className="text-sm sm:text-base font-semibold text-[#fbf8f2] tracking-wide">
                              {group.nameKo}
                            </h4>
                            <span className="text-xs text-stone-400 font-mono">
                              ({group.bottles.length}종)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {selectedCountInGroup > 0 && (
                            <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-md flex items-center gap-1 font-mono">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>{selectedCountInGroup}병 선택됨</span>
                            </span>
                          )}
                          <span className="text-xs text-stone-400 hover:text-stone-200">
                            {isGroupCollapsed ? '펼치기' : '접기'}
                          </span>
                        </div>
                      </button>

                      {/* Folded State Summary: When collapsed & has selected bottles, display preview tags */}
                      {isGroupCollapsed && selectedCountInGroup > 0 && (
                        <div className="px-4 sm:px-5 py-2.5 bg-[#121218] border-t border-[#1e1e28] flex items-center gap-2 flex-wrap text-xs">
                          <span className="text-[11px] text-stone-400 shrink-0 font-medium">선택된 보틀:</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {selectedBottlesInGroup.map((b) => (
                              <span
                                key={b.id}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]"
                              >
                                <span>{b.nameKo}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBottle(b.id);
                                  }}
                                  className="text-stone-400 hover:text-rose-400 ml-1 cursor-pointer font-bold leading-none"
                                  title="선택 해제"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expanded Bottle Cards Grid */}
                      {!isGroupCollapsed && (
                        <div className="p-4 sm:p-5 border-t border-[#1e1e28]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {group.bottles.map((bottle) => {
                              const isChecked = selectedBottleIds.includes(bottle.id);

                              return (
                                <button
                                  key={bottle.id}
                                  type="button"
                                  onClick={() => toggleBottle(bottle.id)}
                                  className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group select-none ${
                                    isChecked
                                      ? 'bg-amber-950/30 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                                      : 'bg-[#15151c] border-[#22222a] hover:border-amber-500/40 hover:bg-[#181822]'
                                  }`}
                                >
                                  {/* Checkbox Icon Box */}
                                  <div
                                    className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 transition-all ${
                                      isChecked
                                        ? 'bg-amber-500 border-amber-400 text-[#0c0c0e]'
                                        : 'border-stone-700 bg-stone-900 group-hover:border-stone-500'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>

                                  {/* Bottle Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between gap-1.5 mb-0.5">
                                      <span
                                        className={`font-bold text-xs sm:text-sm leading-tight transition-colors line-clamp-1 ${
                                          isChecked
                                            ? 'text-amber-200'
                                            : 'text-stone-100 group-hover:text-amber-300'
                                        }`}
                                      >
                                        {bottle.nameKo}
                                      </span>
                                      <span className="text-[10px] font-mono text-stone-400 shrink-0 font-medium">
                                        {bottle.abv}%
                                      </span>
                                    </div>

                                    <span className="text-[11px] text-stone-400 block font-light truncate mb-1">
                                      {bottle.nameEn}
                                    </span>

                                    {bottle.flavorDesc && (
                                      <p className="text-[10px] text-stone-400 line-clamp-1 font-light leading-snug">
                                        {bottle.flavorDesc}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Match Results Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#21212a]">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#fbf8f2]">
              보유 주류 매칭 분석 ({displayList.length}종)
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              선택한 {selectedBottleIds.length}병의 보틀({userIngredients.length}개 기주 카테고리)을 기반으로 조주 가능한 레시피를 계산했습니다.
            </p>
          </div>

          {/* Result Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#14141a] border border-[#242430]">
            <button
              onClick={() => setMatchTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                matchTab === 'all'
                  ? 'bg-[#22222d] text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              전체 ({analyzedCocktails.length})
            </button>
            <button
              onClick={() => setMatchTab('ready')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                matchTab === 'ready'
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                  : 'text-stone-400 hover:text-emerald-400'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>바로 조주 가능 ({fullyReadyCocktails.length})</span>
            </button>
            <button
              onClick={() => setMatchTab('substitute')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                matchTab === 'substitute'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                  : 'text-stone-400 hover:text-amber-300'
              }`}
            >
              <span>대체 재료 활용 ({readyWithSubsCocktails.length})</span>
            </button>
            <button
              onClick={() => setMatchTab('missing1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                matchTab === 'missing1'
                  ? 'bg-[#22222d] text-stone-200 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              1개만 더 있으면 ({missingOneCocktails.length})
            </button>
          </div>
        </div>

        {/* Empty State */}
        {displayList.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-[#111116] border border-[#21212a] p-8">
            <Wine className="w-12 h-12 text-stone-600 mx-auto mb-3 stroke-[1.5]" />
            <h4 className="text-base font-semibold text-stone-200 mb-1">
              해당 조건에 맞는 칵테일이 없습니다
            </h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4 font-light">
              보유 보틀을 추가로 체크하거나 '전체' 탭을 눌러 필요한 보틀을 확인해보세요.
            </p>
            <button
              onClick={() => setMatchTab('all')}
              className="px-4 py-2 rounded-lg bg-amber-500 text-[#0c0c0e] font-semibold text-xs cursor-pointer"
            >
              전체 칵테일 보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayList.map(({ cocktail, isFullyReady, isReadyWithSubs, missingLiquors, replaceableMissing }) => (
              <div key={cocktail.id} className="flex flex-col">
                <CocktailCard
                  cocktail={cocktail}
                  onSelect={onSelectCocktail}
                  userIngredients={userIngredients}
                />

                {/* Cabinet-Specific Missing Bottle Guidance */}
                <div className="mt-2 px-3 py-2 rounded-xl bg-[#0e0e12] border border-[#1e1e26] text-xs space-y-1">
                  {isFullyReady ? (
                    <div className="text-emerald-400 flex items-center gap-1.5 font-medium text-[11px]">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>보유 중인 보틀로 즉시 완벽 조주 가능!</span>
                    </div>
                  ) : isReadyWithSubs ? (
                    <div className="text-amber-300 flex items-center gap-1.5 text-[11px]">
                      <span>대체 보틀 활용 가능:</span>
                      <span className="text-stone-300">
                        {replaceableMissing.map((m) => m.nameKo).join(', ')} 대체
                      </span>
                    </div>
                  ) : missingLiquors.length > 0 ? (
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>필요한 술:</span>
                      <span className="text-rose-400 font-medium">
                        {missingLiquors.map((m) => m.nameKo).join(', ')} 필요
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
