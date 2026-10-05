import React from 'react';
import { Flame, Globe, Sparkles, User, LogIn } from 'lucide-react';
import { AuthUser, Language, Screen } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentScreen: Screen;
  onNavigateToPremium: () => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onNavigateToPremium,
  currentUser,
  onOpenAuth,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* App Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/20">
            <Flame className="w-5 h-5 fill-amber-300 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-['Cairo']">
                {language === 'ar' ? 'سُعرتي' : 'CalorieSnap'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                {language === 'ar' ? 'CalorieSnap' : 'سُعرتي'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* User Account / Google Sign-In Pill */}
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 p-1 pe-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition"
              title={currentUser.name}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black overflow-hidden ring-1 ring-emerald-500/30">
                {currentUser.photoUrl ? (
                  <img src={currentUser.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser.name.charAt(0)}</span>
                )}
              </div>
              <span className="max-w-[70px] truncate text-[11px] font-bold">
                {currentUser.provider === 'google' ? 'Google' : currentUser.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition"
              title={language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="text-[11px]">{language === 'ar' ? 'دخول' : 'Login'}</span>
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton language={language} />

          {/* Premium Quick Pill */}
          <button
            onClick={onNavigateToPremium}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-800 text-xs font-bold border border-amber-300 hover:brightness-105 transition"
            title="Premium"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>PRO</span>
          </button>

          {/* Instant Language Toggle AR / EN */}
          <button
            onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-700 text-xs font-bold transition-all border border-slate-200 active:scale-95 shadow-xs"
            aria-label="Toggle language"
            title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span className="uppercase tracking-wider">{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
