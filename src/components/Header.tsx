import React from 'react';
import { GlassWater, Search, Wine, FlaskConical, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'recipes' | 'mybar' | 'substitutes' | 'ai';
  setActiveTab: (tab: 'recipes' | 'mybar' | 'substitutes' | 'ai') => void;
  selectedBarCount: number;
  onOpenMyBar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedBarCount,
  onOpenMyBar,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/90 backdrop-blur-md border-b border-[#24242a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <button
          onClick={() => setActiveTab('recipes')}
          className="text-left group flex items-center gap-2.5 transition-opacity hover:opacity-90 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#181822] border border-[#2d2d3c] flex items-center justify-center text-white shadow-sm">
            <Wine className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-[#f4efe6]">
            Atelier Mixology
          </span>
        </button>

        {/* Zone 2: Navigation Links (Clean text with hover indicators) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer pb-0.5 ${
              activeTab === 'recipes'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-stone-300 hover:text-[#f4efe6]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>레시피 도감</span>
          </button>
          <button
            onClick={() => setActiveTab('mybar')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer pb-0.5 ${
              activeTab === 'mybar'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-stone-300 hover:text-[#f4efe6]'
            }`}
          >
            <GlassWater className="w-4 h-4" />
            <span>내 홈바 매칭</span>
          </button>
          <button
            onClick={() => setActiveTab('substitutes')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer pb-0.5 ${
              activeTab === 'substitutes'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-stone-300 hover:text-[#f4efe6]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>대체 재료 백과</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer pb-0.5 ${
              activeTab === 'ai'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-stone-300 hover:text-[#f4efe6]'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>커스텀 칵테일 랩</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMyBar}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#1a1a20] border border-[#34343d] text-stone-200 hover:text-white hover:border-amber-500/50 hover:bg-[#22222a] transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
            <span>내 보유 술</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px]">
              {selectedBarCount}종
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
