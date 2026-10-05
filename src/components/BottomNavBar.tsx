import React from 'react';
import { Home, UtensilsCrossed, ScanLine, User, Sparkles } from 'lucide-react';
import { Language, Screen } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface BottomNavBarProps {
  currentScreen: Screen;
  onSelectScreen: (screen: Screen) => void;
  language: Language;
  foodCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onSelectScreen,
  language,
  foodCount,
}) => {
  const t = TRANSLATIONS[language];

  const navItems = [
    {
      id: 'dashboard' as Screen,
      label: t.navDashboard,
      icon: Home,
      badge: null,
    },
    {
      id: 'foodLog' as Screen,
      label: t.navFoodLog,
      icon: UtensilsCrossed,
      badge: foodCount > 0 ? foodCount : null,
    },
    {
      id: 'premium' as Screen,
      label: t.navPremium,
      icon: ScanLine,
      badge: 'PRO',
      isPro: true,
    },
    {
      id: 'profile' as Screen,
      label: t.navProfile,
      icon: User,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg safe-bottom">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 group ${
                isActive
                  ? item.isPro
                    ? 'text-amber-600 font-bold'
                    : 'text-emerald-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Active subtle background pill */}
              {isActive && (
                <span
                  className={`absolute inset-x-2 inset-y-0.5 rounded-xl transition-all ${
                    item.isPro ? 'bg-amber-50' : 'bg-emerald-50'
                  }`}
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative z-10 flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'group-hover:scale-105'
                  }`}
                />

                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -end-2.5 px-1.5 min-w-[18px] h-[18px] text-[10px] font-extrabold flex items-center justify-center rounded-full leading-none shadow-xs ${
                      item.isPro
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {item.isPro ? <Sparkles className="w-2.5 h-2.5" /> : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`relative z-10 text-[11px] mt-1 truncate max-w-full leading-tight font-medium ${
                  isActive ? 'font-bold' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
