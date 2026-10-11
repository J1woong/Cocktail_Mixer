import React from 'react';
import { Wine } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1e1e24] bg-[#09090b] text-stone-500 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-amber-600/20 text-amber-500 flex items-center justify-center">
            <Wine className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-semibold text-stone-300 text-sm">
            Atelier Mixology
          </span>
          <span aria-hidden="true" className="text-stone-700">·</span>
          <span>클래식 칵테일 & 대체 재료 믹솔로지 가이드</span>
        </div>

        <div className="flex items-center gap-6 text-stone-400">
          <span>과도한 음주는 건강을 해칩니다</span>
          <span aria-hidden="true" className="text-stone-700">·</span>
          <span>© 2026 Atelier Mixology. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
