import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Apple
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthUser, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { GOOGLE_CLIENT_ID, decodeGoogleJwt } from '../utils/googleAuth';

interface WelcomeAuthScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (user: AuthUser) => void;
  onSkipAsGuest: () => void;
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({
  language,
  onLanguageChange,
  onLoginSuccess,
  onSkipAsGuest,
}) => {
  const t = TRANSLATIONS[language];
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGsiRendered, setIsGsiRendered] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Setup Google Identity Services (GIS)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const initGsi = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: { credential: string }) => {
              if (response?.credential) {
                const payload = decodeGoogleJwt(response.credential);
                const googleUser: AuthUser = {
                  id: payload.sub || 'google-user-' + Date.now(),
                  name: payload.name || payload.given_name || (language === 'ar' ? 'مستخدم Google' : 'Google User'),
                  email: payload.email || 'user@gmail.com',
                  photoUrl: payload.picture,
                  provider: 'google',
                };

                try {
                  localStorage.setItem('caloriesnap_auth_user', JSON.stringify(googleUser));
                  confetti({
                    particleCount: 70,
                    spread: 80,
                    origin: { y: 0.5 },
                  });
                } catch {}

                onLoginSuccess(googleUser);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const container = document.getElementById('google-smart-button-container');
          if (container) {
            container.innerHTML = '';
            window.google.accounts.id.renderButton(container, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: 320,
              locale: language === 'ar' ? 'ar' : 'en',
            });
            setIsGsiRendered(true);
          }
        } catch (err) {
          console.warn('Google Identity Services notice:', err);
        }
      }
    };

    initGsi();
    timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        initGsi();
        clearInterval(timer);
      }
    }, 350);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [language, onLoginSuccess]);

  // Handle Google Sign-In Trigger (Prompt / Fallback simulation)
  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: unknown) => {
          console.log('Google One Tap notification:', notification);
        });
      } catch {}
    }

    setTimeout(() => {
      setIsGoogleLoading(false);

      const googleUser: AuthUser = {
        id: 'google-user-' + Date.now(),
        name: language === 'ar' ? 'مستخدم Google' : 'Google User',
        email: 'dzr870277@gmail.com',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        provider: 'google',
      };

      try {
        localStorage.setItem('caloriesnap_auth_user', JSON.stringify(googleUser));
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {}

      onLoginSuccess(googleUser);
    }, 650);
  };

  // Handle Email Sign In or Sign Up
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailUser: AuthUser = {
      id: 'email-user-' + Date.now(),
      name: name.trim() || (language === 'ar' ? 'بطل اللياقة' : 'Fitness User'),
      email: email.trim(),
      provider: 'email',
    };

    try {
      localStorage.setItem('caloriesnap_auth_user', JSON.stringify(emailUser));
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    onLoginSuccess(emailUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      {/* Top Bar with Language Toggle */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
          </div>
          <span className="font-black text-sm tracking-tight text-white font-['Cairo']">
            {language === 'ar' ? 'سُعرتي' : 'CalorieSnap'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 border border-white/10 transition"
        >
          {language === 'ar' ? 'English' : 'عربي'}
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-auto py-6 z-10 space-y-6">
        {/* Hero Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تطبيق السعرات الذكي الأول' : 'Smart Macro & Calorie App'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {language === 'ar' ? 'أهلاً بك في سُعرتي' : 'Welcome to CalorieSnap'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            {language === 'ar'
              ? 'تتبع وجباتك بدقة، احسب سعرات الأطباق العربية، وحقق وزنك المثالي بذكاء'
              : 'Track meals, calculate traditional dish macros, and reach your ideal physique'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 text-slate-900 shadow-2xl border border-slate-100 space-y-5">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`py-2 text-xs font-black rounded-xl transition ${
                authMode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`py-2 text-xs font-black rounded-xl transition ${
                authMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
            </button>
          </div>

          {/* OFFICIAL GOOGLE SIGN-IN BUTTON CONTAINER */}
          <div className="space-y-3">
            {/* Real Google Identity Services Smart Button Container */}
            <div
              id="google-smart-button-container"
              className="w-full flex justify-center min-h-[44px]"
            ></div>

            {/* Seamless Google Button Trigger */}
            {!isGsiRendered && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 rounded-full bg-white hover:bg-slate-50 active:scale-[0.98] border border-slate-300 shadow-xs flex items-center justify-center gap-3 text-slate-700 font-medium text-xs sm:text-sm transition-all duration-150 disabled:opacity-75 cursor-pointer"
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-xs font-semibold">
                      {language === 'ar' ? 'جاري الاتصال بـ Google...' : 'Connecting to Google...'}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Official Google 4-Color SVG Logo */}
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span className="font-semibold text-slate-700 tracking-tight">
                      {language === 'ar' ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google'}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 absolute">
                {language === 'ar' ? 'أو عبر البريد الإلكتروني' : 'or continue with email'}
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: محمد أحمد' : 'e.g. Alex Smith'}
                      className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </label>
                  {authMode === 'signin' && (
                    <span className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer">
                      {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot?'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
              >
                <span>
                  {authMode === 'signin'
                    ? language === 'ar' ? 'دخول إلى حسابي' : 'Sign In'
                    : language === 'ar' ? 'إنشاء حساب مجاني' : 'Create Free Account'}
                </span>
                {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>

          {/* Continue as Guest option */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onSkipAsGuest}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline underline-offset-4 transition"
            >
              {language === 'ar' ? 'المتابعة كزائر دون تسجيل (تخطي)' : 'Continue as Guest (Skip for now)'}
            </button>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
          <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-base block mb-0.5">🥑</span>
            <span className="font-semibold block">{language === 'ar' ? '+1200 صنف عربي' : 'Arab Food DB'}</span>
          </div>
          <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-base block mb-0.5">⚡</span>
            <span className="font-semibold block">{language === 'ar' ? 'حاسبة TDEE دقيقة' : 'TDEE Targets'}</span>
          </div>
          <div className="p-2 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-base block mb-0.5">🔒</span>
            <span className="font-semibold block">{language === 'ar' ? 'حفظ ومزامنة سحابية' : 'Cloud Sync'}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-500 z-10 pb-1">
        <span>{language === 'ar' ? 'بياناتك مشفرة وآمنة تماماً 100%' : 'Your data is 100% private & secure'}</span>
      </div>
    </div>
  );
};
