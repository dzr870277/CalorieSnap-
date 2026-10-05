import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Check, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [selectedOS, setSelectedOS] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');

  // If already running inside installed standalone app, hide install button
  if (isInstalled) {
    return null;
  }

  const handleButtonClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 text-xs font-bold border border-emerald-500/30 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
        title={language === 'ar' ? 'تثبيت التطبيق على هاتفك' : 'Install App to Phone'}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="text-[11px] sm:text-xs">
          {language === 'ar' ? 'تحميل التطبيق' : 'Install'}
        </span>
      </button>

      {/* Comprehensive Phone Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-start space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {language === 'ar' ? 'تثبيت التطبيق على هاتفك' : 'Install on Your Phone'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {language === 'ar' ? 'يعمل بدون متجر بملء الشاشة وسرعة فائقة' : 'Works offline & full-screen like native app'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* OS Tabs: Android vs iPhone */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedOS('android')}
                className={`py-2 text-xs font-bold rounded-xl transition ${
                  selectedOS === 'android'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'ar' ? '🤖 أندرويد (Android)' : '🤖 Android'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedOS('ios')}
                className={`py-2 text-xs font-bold rounded-xl transition ${
                  selectedOS === 'ios'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'ar' ? '🍎 آيفون (iPhone)' : '🍎 iPhone (iOS)'}
              </button>
            </div>

            {/* Android Guide Content */}
            {selectedOS === 'android' && (
              <div className="space-y-2.5 text-xs text-slate-700 animate-fadeIn">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      {language === 'ar' ? '1. افتح قائمة المتصفح' : '1. Open browser menu'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {language === 'ar'
                        ? 'في متصفح كروم (Chrome)، اضغط على زر النقاط الثلاث (⋮) في أعلى أو أسفل الزاوية.'
                        : 'In Google Chrome, tap the three dots (⋮) menu icon.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      {language === 'ar' ? '2. اختر "تثبيت التطبيق"' : '2. Tap "Install App"'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {language === 'ar'
                        ? 'انقر على "تثبيت التطبيق" (Install app) أو "الإضافة إلى الشاشة الرئيسية".'
                        : 'Select "Install app" or "Add to Home screen".'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      {language === 'ar' ? '3. اكتمل التحميل!' : '3. Ready!'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {language === 'ar'
                        ? 'ستجد أيقونة تطبيق "سُعرتي" على شاشة هاتفك الرئيسية، وتفتح مباشرة بملء الشاشة.'
                        : 'CalorieSnap icon will appear on your home screen and launch in full-screen mode.'}
                    </p>
                  </div>
                </div>

                {/* Direct APK Build Option */}
                <div className="pt-1">
                  <a
                    href="https://www.pwabuilder.com?url=https%3A%2F%2Fais-pre-ghxkqcltpcu6jafd2shkg7-703782077748.europe-west2.run.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <span>{language === 'ar' ? '📦 تحميل ملف APK للتثبيت المباشر' : '📦 Download APK Package'}</span>
                  </a>
                </div>
              </div>
            )}

            {/* iOS / iPhone Guide Content */}
            {selectedOS === 'ios' && (
              <div className="space-y-2.5 text-xs text-slate-700 animate-fadeIn">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      {language === 'ar' ? '1. اضغط زر المشاركة (Share)' : '1. Tap Share button'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {language === 'ar'
                        ? 'في متصفح Safari، اضغط على زر المشاركة (المربع الذي يخرج منه سهم للأعلى ⬆️) في شريط أسفل الشاشة.'
                        : 'In Safari, tap the Share icon (square with upward arrow ⬆️) at the bottom toolbar.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      {language === 'ar' ? '2. إضافة إلى الشاشة الرئيسية' : '2. Add to Home Screen'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {language === 'ar'
                        ? 'مرر للأسفل في القائمة وانقر على "إضافة إلى الصفحة الرئيسية" (Add to Home Screen ➕).'
                        : 'Scroll down the list and tap "Add to Home Screen ➕".'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      {language === 'ar' ? '3. اضغط "إضافة" (Add)' : '3. Tap "Add"'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {language === 'ar'
                        ? 'انقر على "إضافة" في أعلى الزاوية ليتم تثبيت التطبيق على آيفون كأنه محمل من App Store.'
                        : 'Tap "Add" at the top right. CalorieSnap will now appear on your home screen!'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-3 w-full rounded-2xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-700 active:scale-98 transition shadow-md shadow-emerald-600/20"
            >
              {language === 'ar' ? 'حسناً، فهمت ذلك 👍' : 'Got it 👍'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

