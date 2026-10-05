import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Scan,
  Camera,
  ChefHat,
  MessageSquare,
  BarChart3,
  FileText,
  Flame,
  Zap,
  Check,
  Plus,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, LoggedFood, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { AIMealPlanner } from './premium/AIMealPlanner';
import { AINutritionistChat } from './premium/AINutritionistChat';
import { AdvancedAnalytics } from './premium/AdvancedAnalytics';

interface PremiumScreenProps {
  language: Language;
  currentDate: string;
  onAddFood: (food: Omit<LoggedFood, 'id' | 'timestamp'>) => void;
  profile: UserProfile;
  loggedFoods: LoggedFood[];
  isPro: boolean;
  onTogglePro: (status: boolean) => void;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({
  language,
  currentDate,
  onAddFood,
  profile,
  loggedFoods,
  isPro,
  onTogglePro,
}) => {
  const t = TRANSLATIONS[language];

  const PAYPAL_PAYMENT_URL = 'https://www.paypal.com/ncp/payment/SLR4A6C2R33BU';

  // Active tab in unlocked mode - defaults to analytics as requested
  const [unlockedTab, setUnlockedTab] = useState<'mealPlanner' | 'chat' | 'analytics' | 'scanner'>('analytics');

  // Scanner Simulator Demo State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    nameAr: string;
    nameEn: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    portionAr: string;
    portionEn: string;
    emoji: string;
    confidence: number;
  } | null>(null);
  const [hasAddedToLog, setHasAddedToLog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showVerifyBox, setShowVerifyBox] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Initialize PayPal Hosted Buttons if available from the SDK in head
  useEffect(() => {
    if (!isPro) {
      try {
        const paypalWindow = window as unknown as {
          paypal?: {
            HostedButtons?: (options: {
              hostedButtonId: string;
              onApprove?: (data: unknown, actions: unknown) => void;
              onComplete?: (data: unknown) => void;
              onError?: (err: unknown) => void;
            }) => {
              render: (selector: string) => Promise<void>;
            };
          };
        };

        if (paypalWindow.paypal?.HostedButtons) {
          const container = document.getElementById('paypal-container-SLR4A6C2R33BU');
          if (container && container.childNodes.length === 0) {
            paypalWindow.paypal
              .HostedButtons({
                hostedButtonId: 'SLR4A6C2R33BU',
                onApprove: () => {
                  handleActivatePro();
                },
                onComplete: () => {
                  handleActivatePro();
                },
                onError: (err) => {
                  console.warn('PayPal Hosted Button error:', err);
                },
              })
              .render('#paypal-container-SLR4A6C2R33BU');
          }
        }
      } catch (err) {
        console.warn('PayPal hosted button render:', err);
      }
    }
  }, [isPro]);

  // Listen to messages from PayPal checkout flow
  useEffect(() => {
    const handlePayPalMessage = (e: MessageEvent) => {
      if (
        typeof e.origin === 'string' &&
        (e.origin.includes('paypal.com') || e.origin.includes('paypalobjects.com'))
      ) {
        try {
          const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (
            d?.action === 'approved' ||
            d?.name === 'approved' ||
            d?.status === 'COMPLETED' ||
            d?.event === 'CheckoutSuccess'
          ) {
            handleActivatePro();
          }
        } catch {}
      }
    };

    window.addEventListener('message', handlePayPalMessage);

    return () => {
      window.removeEventListener('message', handlePayPalMessage);
    };
  }, [isPro]);

  const handleActivatePro = () => {
    sessionStorage.removeItem('pending_paypal_payment');
    setUnlockedTab('analytics'); // Automatically opens the Analytics & Charts screen upon purchase!
    onTogglePro(true);
    setShowSuccessToast(true);
    try {
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch {}
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = verifyInput.trim();
    if (trimmed.length < 5) {
      setVerifyError(language === 'ar' ? 'يرجى إدخال رقم المعاملة أو بريد PayPal بشكل صحيح' : 'Please enter a valid Transaction ID or PayPal Email');
      return;
    }
    try {
      localStorage.setItem('caloriesnap_paypal_tx', trimmed);
    } catch {}
    setVerifyError('');
    setShowVerifyBox(false);
    handleActivatePro();
  };

  const handleLockedCardClick = () => {
    const cta = document.getElementById('paypal-button-cta');
    if (cta) {
      cta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cta.classList.add('ring-4', 'ring-amber-400');
      setTimeout(() => cta.classList.remove('ring-4', 'ring-amber-400'), 1500);
    }
  };

  const sampleScans = [
    {
      nameAr: 'شاورما دجاج عربية مع بطاطس',
      nameEn: 'Arabic Chicken Shawarma Plate',
      calories: 520,
      protein: 34,
      carbs: 48,
      fats: 22,
      portionAr: 'وجبة كاملة (280غ)',
      portionEn: 'Full Meal (280g)',
      emoji: '🌯',
      confidence: 98,
    },
    {
      nameAr: 'كبسة لحم نعيمي بالأرز البسمتي',
      nameEn: 'Saudi Lamb Kabsa with Rice',
      calories: 680,
      protein: 42,
      carbs: 76,
      fats: 24,
      portionAr: 'طبق متوسط (350غ)',
      portionEn: 'Medium Plate (350g)',
      emoji: '🍛',
      confidence: 96,
    },
    {
      nameAr: 'سلطة سيزر بالدجاج المشوي',
      nameEn: 'Grilled Chicken Caesar Salad',
      calories: 320,
      protein: 29,
      carbs: 12,
      fats: 16,
      portionAr: 'صحن كبير (260غ)',
      portionEn: 'Large Bowl (260g)',
      emoji: '🥗',
      confidence: 99,
    },
  ];

  const handleSimulateScan = (index = 0) => {
    setIsScanning(true);
    setScannedResult(null);
    setHasAddedToLog(false);

    setTimeout(() => {
      setIsScanning(false);
      setScannedResult(sampleScans[index % sampleScans.length]);
      try {
        confetti({
          particleCount: 20,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {}
    }, 1200);
  };

  const handleAddScannedToLog = () => {
    if (!scannedResult) return;

    onAddFood({
      nameAr: scannedResult.nameAr,
      nameEn: scannedResult.nameEn,
      mealType: 'lunch',
      servings: 1,
      servingUnitAr: scannedResult.portionAr,
      servingUnitEn: scannedResult.portionEn,
      calories: scannedResult.calories,
      protein: scannedResult.protein,
      carbs: scannedResult.carbs,
      fats: scannedResult.fats,
      dateStr: currentDate,
    });

    setHasAddedToLog(true);
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  // Calculate consumed for remaining calories calculation
  const consumedCalories = loggedFoods.reduce((acc, item) => acc + item.calories, 0);
  const remainingCalories = profile.targets.calories - consumedCalories;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* ============================================================== */}
      {/* 1. UNLOCKED PRO ZONE (Displays after user subscribes)          */}
      {/* ============================================================== */}
      {isPro ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Active VIP Member Top Card */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white p-4 rounded-3xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
                <Crown className="w-5 h-5 fill-amber-200 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-black">
                    {language === 'ar' ? 'العضوية المميزة نشطة ⭐' : 'PRO Membership Active ⭐'}
                  </h2>
                </div>
                <p className="text-[11px] text-amber-100">
                  {language === 'ar' ? 'جميع ميزات الذكاء الاصطناعي مفتوحة بلا حدود' : 'All AI & Pro features unlocked'}
                </p>
              </div>
            </div>

            {/* Toggle button to test lock/unlock */}
            <button
              onClick={() => onTogglePro(false)}
              className="text-[10px] font-bold px-2 py-1 rounded-xl bg-black/20 hover:bg-black/30 text-amber-100 border border-white/20 transition"
              title="Switch to paywall preview"
            >
              {language === 'ar' ? 'معاينة القفل' : 'Lock Mode'}
            </button>
          </div>

          {/* 4 Professional Feature Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setUnlockedTab('mealPlanner')}
              className={`py-2 text-xs font-bold rounded-xl transition flex flex-col items-center gap-1 ${
                unlockedTab === 'mealPlanner'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span className="text-[10px]">{language === 'ar' ? 'منشئ الوجبات' : 'Planner'}</span>
            </button>

            <button
              onClick={() => setUnlockedTab('chat')}
              className={`py-2 text-xs font-bold rounded-xl transition flex flex-col items-center gap-1 ${
                unlockedTab === 'chat'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px]">{language === 'ar' ? 'أخصائي التغذية' : 'AI Chat'}</span>
            </button>

            <button
              onClick={() => setUnlockedTab('analytics')}
              className={`py-2 text-xs font-bold rounded-xl transition flex flex-col items-center gap-1 ${
                unlockedTab === 'analytics'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-[10px]">{language === 'ar' ? 'التحليلات وPDF' : 'Analytics'}</span>
            </button>

            <button
              onClick={() => {
                setUnlockedTab('scanner');
                if (!scannedResult && !isScanning) {
                  handleSimulateScan(0);
                }
              }}
              className={`py-2 text-xs font-bold rounded-xl transition flex flex-col items-center gap-1 ${
                unlockedTab === 'scanner'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Scan className="w-4 h-4" />
              <span className="text-[10px]">{language === 'ar' ? 'الماسح الذكي' : 'Scanner'}</span>
            </button>
          </div>

          {/* Tab 1: AI Meal Planner */}
          {unlockedTab === 'mealPlanner' && (
            <AIMealPlanner
              language={language}
              remainingCalories={remainingCalories}
              targets={profile.targets}
              currentDate={currentDate}
              onAddFood={onAddFood}
            />
          )}

          {/* Tab 2: AI Nutritionist Chat */}
          {unlockedTab === 'chat' && (
            <AINutritionistChat
              language={language}
              profile={profile}
            />
          )}

          {/* Tab 3: Advanced Analytics & PDF Export */}
          {unlockedTab === 'analytics' && (
            <AdvancedAnalytics
              language={language}
              profile={profile}
              loggedFoods={loggedFoods}
            />
          )}

          {/* Tab 4: AI Food Scanner Viewfinder */}
          {unlockedTab === 'scanner' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border-2 border-slate-800 shadow-2xl p-4 min-h-[340px] flex flex-col justify-between">
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-[11px] font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AI Vision Engine PRO</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {language === 'ar' ? 'ماسح الوجبات بالكاميرا' : 'Smart Camera Scanner'}
                  </span>
                </div>

                <div className="relative my-4 flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 border-2 border-dashed border-emerald-400/60 rounded-3xl flex items-center justify-center p-3">
                    <span className="absolute -top-1 -start-1 w-4 h-4 border-t-2 border-s-2 border-emerald-400" />
                    <span className="absolute -top-1 -end-1 w-4 h-4 border-t-2 border-e-2 border-emerald-400" />
                    <span className="absolute -bottom-1 -start-1 w-4 h-4 border-b-2 border-s-2 border-emerald-400" />
                    <span className="absolute -bottom-1 -end-1 w-4 h-4 border-b-2 border-e-2 border-emerald-400" />

                    {isScanning && (
                      <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce" />
                    )}

                    {isScanning ? (
                      <div className="text-center space-y-2">
                        <Camera className="w-8 h-8 text-emerald-400 animate-pulse mx-auto" />
                        <p className="text-xs font-bold text-emerald-300">
                          {t.analyzingMeal}
                        </p>
                      </div>
                    ) : scannedResult ? (
                      <div className="text-center space-y-1">
                        <span className="text-5xl block">{scannedResult.emoji}</span>
                        <span className="text-xs font-bold text-emerald-300 px-2 py-0.5 bg-emerald-950/80 rounded-full border border-emerald-700/50">
                          {scannedResult.confidence}% {language === 'ar' ? 'دقة' : 'match'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 space-y-1">
                        <Camera className="w-8 h-8 mx-auto text-slate-600" />
                        <p className="text-[11px]">
                          {language === 'ar' ? 'ضع الطبق داخل الإطار' : 'Center dish in frame'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="z-10 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold block text-center uppercase tracking-wider">
                    {language === 'ar' ? 'أمثلة جاهزة للفحص السريع:' : 'Quick dish test samples:'}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {sampleScans.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSimulateScan(idx)}
                        className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1 transition"
                      >
                        <span>{sample.emoji}</span>
                        <span className="truncate">{language === 'ar' ? sample.nameAr.split(' ')[0] : sample.nameEn.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {scannedResult && (
                <div className="bg-white rounded-3xl p-4 border border-emerald-200 shadow-lg space-y-3 animate-fadeIn">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{scannedResult.emoji}</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">
                          {language === 'ar' ? scannedResult.nameAr : scannedResult.nameEn}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {language === 'ar' ? scannedResult.portionAr : scannedResult.portionEn}
                        </p>
                      </div>
                    </div>

                    <div className="text-end">
                      <span className="text-base font-black text-emerald-600 block">
                        {scannedResult.calories}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">
                        {t.kcal}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                    <div className="bg-sky-50 rounded-xl p-1.5">
                      <span className="text-[10px] text-sky-600 font-bold block">{t.protein}</span>
                      <span className="text-xs font-black text-sky-900">{scannedResult.protein}g</span>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-1.5">
                      <span className="text-[10px] text-emerald-600 font-bold block">{t.carbs}</span>
                      <span className="text-xs font-black text-emerald-900">{scannedResult.carbs}g</span>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-1.5">
                      <span className="text-[10px] text-amber-600 font-bold block">{t.fats}</span>
                      <span className="text-xs font-black text-amber-900">{scannedResult.fats}g</span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddScannedToLog}
                    disabled={hasAddedToLog}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      hasAddedToLog
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95'
                    }`}
                  >
                    {hasAddedToLog ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{t.alreadyAdded}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>{t.addToMyLog}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ============================================================== */
        /* 2. LOCKED STATE (PAYWALL SCREEN WITH PAYPAL $2.99)             */
        /* ============================================================== */
        <div className="space-y-4 animate-fadeIn">
          {/* Hero VIP Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white p-6 shadow-xl shadow-amber-500/20 text-center">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-400/30 rounded-full blur-2xl pointer-events-none" />

            {/* VIP Crown Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-amber-100 text-xs font-black tracking-wider uppercase mb-3 border border-white/20">
              <Crown className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>{t.premiumBadge}</span>
            </div>

            {/* Clear Mandatory Headline */}
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug drop-shadow-xs">
              {t.paywallHeadline}
            </h1>

            {/* Subheadline */}
            <p className="text-xs text-amber-100 mt-2 font-medium leading-relaxed max-w-sm mx-auto">
              {language === 'ar'
                ? 'افتح مُنشئ الوجبات الذكي، شات أخصائي التغذية الفوري، والتحليلات المتقدمة وتصدير PDF'
                : 'Unlock AI Meal Planner, AI Nutritionist Chat, and Advanced Analytics with PDF Export'}
            </p>

            {/* Pricing Tag Display */}
            <div className="mt-4 inline-flex items-baseline justify-center gap-1 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <span className="text-3xl font-black tracking-tight text-white">$2.99</span>
              <span className="text-xs font-bold text-amber-100">
                / {language === 'ar' ? 'شهرياً فقط' : 'month only'}
              </span>
            </div>
          </div>

          {/* Golden-Yellow PayPal Styled Button Container */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md space-y-3.5">
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-500">
                {language === 'ar' ? 'طريقة الدفع الفورية والمعتمدة' : 'Instant & Certified Payment'}
              </span>
            </div>

            {/* PayPal Hosted Button Container (Mounted by PayPal SDK) */}
            <div id="paypal-container-SLR4A6C2R33BU" className="w-full min-h-0 empty:hidden mb-2"></div>

            {/*
              CRITICAL REQUIREMENT:
              - Place a single prominent golden-yellow PayPal styled button that reads: "اشترك الآن عبر PayPal"
              - Configure this button to securely open official live PayPal link in a new browser tab: https://www.paypal.com/ncp/payment/SLR4A6C2R33BU
            */}
            <a
              id="paypal-button-cta"
              href={PAYPAL_PAYMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sessionStorage.setItem('pending_paypal_payment', 'true')}
              className="w-full py-4 px-6 rounded-2xl bg-[#FFC439] hover:bg-[#F5B000] active:scale-[0.98] transition-all duration-200 shadow-md shadow-amber-400/30 flex items-center justify-center gap-2.5 text-slate-900 font-extrabold text-base border border-amber-400 cursor-pointer group"
              style={{
                backgroundColor: '#FFC439',
              }}
            >
              {/* PayPal Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.855.855 0 0 1 .844-.72h7.028c2.378 0 4.135.534 5.223 1.588 1.05 1.018 1.405 2.456 1.056 4.274-.633 3.32-2.776 5.2-6.368 5.2h-2.18a.855.855 0 0 0-.844.72l-.963 6.079a.641.641 0 0 1-.664.476z"
                  fill="#003087"
                />
                <path
                  d="M9.13 14.062h2.366c3.592 0 5.735-1.88 6.368-5.2.35-1.818-.006-3.256-1.056-4.274-.68-.659-1.62-1.096-2.825-1.328a6.38 6.38 0 0 0-1.86-.198H5.788a.855.855 0 0 0-.844.72L2.47 20.597a.641.641 0 0 0 .633.74h4.606l.963-6.079a.855.855 0 0 1 .844-.72l-.386-4.476z"
                  fill="#0079C1"
                  opacity="0.9"
                />
              </svg>

              <span className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
                {t.paypalButtonText}
              </span>

              <ExternalLink className="w-4 h-4 text-slate-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Locked notice & manual receipt verification */}
            <div className="pt-2 text-center space-y-2">
              <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed font-medium">
                {language === 'ar'
                  ? '🔒 جميع الميزات مقفلة وتفتح شاشة التحليلات تلقائياً فور تأكيد اشتراك 2.99$ عبر PayPal.'
                  : '🔒 All features are locked and unlock automatically upon $2.99 PayPal checkout.'}
              </div>

              {/* Secure Receipt Verification Trigger */}
              <div className="border border-slate-200/80 rounded-2xl p-2.5 bg-slate-50/70 text-start space-y-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyBox(!showVerifyBox)}
                  className="w-full text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center justify-between px-1"
                >
                  <span>
                    {language === 'ar'
                      ? 'أتممت الدفع وتريد إدخال رقم المعاملة للتأكيد؟'
                      : 'Completed payment? Enter transaction ID to verify'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showVerifyBox ? 'rotate-180' : ''}`} />
                </button>

                {showVerifyBox && (
                  <form onSubmit={handleManualVerify} className="space-y-2 pt-1 animate-fadeIn">
                    <input
                      type="text"
                      required
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل رقم المعاملة أو بريد PayPal (مثال: 5AB12345CD678901E)' : 'Enter PayPal Transaction ID or Email'}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-xs transition"
                    >
                      {language === 'ar' ? 'التحقق من إيصال PayPal وتفعيل الحساب' : 'Verify Receipt & Activate'}
                    </button>
                    {verifyError && (
                      <p className="text-[10px] text-rose-600 font-medium text-center">{verifyError}</p>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Trust and Guarantee Subtext */}
            <div className="space-y-1 text-center pt-1">
              <p className="text-[11px] text-slate-500 font-medium">
                {t.cancelAnytime}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.paypalSecurityNote}</span>
              </div>
            </div>
          </div>

          {/* Locked Features Preview Showcase */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider px-1">
              {language === 'ar' ? 'الميزات الاحترافية المقفلة خلف الاشتراك ($2.99):' : 'Locked Premium Features Behind Paywall ($2.99):'}
            </h3>

            {/* Feature 1: Advanced Analytics, Charts & PDF Export */}
            <div
              onClick={handleLockedCardClick}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs relative overflow-hidden group cursor-pointer hover:border-amber-400 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{language === 'ar' ? '1. قسم التحليلات والرسوم البيانية وتصدير PDF' : '1. Advanced Analytics, Charts & PDF'}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                        PRO
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {language === 'ar'
                        ? 'رسوم بيانية تفاعلية لتطور وزن الجسم ونسبة الدهون وزر تصدير تقرير PDF'
                        : 'Interactive weight & body fat trajectory charts with certified PDF export'}
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="truncate">📊 تتبع الوزن ونسبة الدهون أسبوعياً + تقرير PDF معتمد</span>
                <span className="text-indigo-600 font-bold text-[10px] shrink-0">
                  {language === 'ar' ? 'مقفل 🔒' : 'Locked 🔒'}
                </span>
              </div>
            </div>

            {/* Feature 2: AI Meal Planner */}
            <div
              onClick={handleLockedCardClick}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs relative overflow-hidden group cursor-pointer hover:border-amber-400 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{language === 'ar' ? '2. مُنشئ الوجبات الذكي بالذكاء الاصطناعي' : '2. AI Meal Planner'}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                        PRO
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {language === 'ar'
                        ? 'أدخل مكونات منزلك ويولّد لك وصفة صحية مطابقة لسعراتك المتبقية'
                        : 'Input kitchen ingredients to generate a calorie-matched healthy recipe'}
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="truncate">🍅 طماطم + 🍗 دجاج + 🍚 أرز ← وصفة محسوبة السعرات</span>
                <span className="text-emerald-600 font-bold text-[10px] shrink-0">
                  {language === 'ar' ? 'مقفل 🔒' : 'Locked 🔒'}
                </span>
              </div>
            </div>

            {/* Feature 3: AI Nutritionist Chat */}
            <div
              onClick={handleLockedCardClick}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs relative overflow-hidden group cursor-pointer hover:border-amber-400 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{language === 'ar' ? '3. مساعد التغذية الفوري (AI Nutritionist Chat)' : '3. AI Nutritionist Chat'}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                        PRO
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {language === 'ar'
                        ? 'شات بوت ذكي بتصميم أنيق للإجابة الفورية عن الدايت والتمارين'
                        : 'Instant expert nutritional chatbot tailored to your exact stats'}
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="truncate">💬 د. نور: "نصيحة اليوم لبناء العضلات مع حرق الدهون..."</span>
                <span className="text-sky-600 font-bold text-[10px] shrink-0">
                  {language === 'ar' ? 'مقفل 🔒' : 'Locked 🔒'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner when Membership is Activated */}
      {showSuccessToast && (
        <div className="fixed top-16 inset-x-4 max-w-sm mx-auto z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-fadeIn border border-emerald-400">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="text-xs">
            <h4 className="font-extrabold text-white">
              {language === 'ar' ? '🎉 تم تفعيل العضوية المميزة بنجاح!' : '🎉 PRO Membership Activated!'}
            </h4>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              {language === 'ar'
                ? 'تم تأكيد اشتراك 2.99$، وجميع ميزات الذكاء الاصطناعي مفتوحة الآن.'
                : 'Your $2.99 plan is verified. All AI features are now unlocked.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
