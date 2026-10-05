import React, { useState, useEffect } from 'react';
import {
  User,
  Activity,
  Target,
  Calculator,
  Save,
  CheckCircle,
  Flame,
  Zap,
  TrendingDown,
  Equal,
  Dumbbell,
  Share2,
  Copy,
  ExternalLink,
  Globe,
  Smartphone,
  Terminal,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActivityLevel, AuthUser, Gender, Goal, Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { calculateTargets } from '../utils/nutritionCalculator';

interface ProfileScreenProps {
  language: Language;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  language,
  profile,
  onSaveProfile,
  currentUser,
  onOpenAuth,
  onSignOut,
}) => {
  const t = TRANSLATIONS[language];

  // Form State
  const [age, setAge] = useState<number>(profile.age);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [weight, setWeight] = useState<number>(profile.weight);
  const [height, setHeight] = useState<number>(profile.height);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  const publicAppUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-ghxkqcltpcu6jafd2shkg7-703782077748.europe-west2.run.app';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CalorieSnap (سُعرتي)',
          text: 'جرّب تطبيق سُعرتي لتتبع السعرات والماكروز وفحص الوجبات بالذكاء الاصطناعي!',
          url: publicAppUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  // Dynamic automatic TDEE computation whenever any input changes
  const computed = calculateTargets(weight, height, age, gender, activityLevel, goal);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedProfile: UserProfile = {
      age,
      gender,
      weight,
      height,
      activityLevel,
      goal,
      bmr: computed.bmr,
      tdee: computed.tdee,
      targets: computed.targets,
    };

    onSaveProfile(updatedProfile);

    // Show celebration and toast
    setShowSavedToast(true);
    try {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch {}

    setTimeout(() => {
      setShowSavedToast(false);
    }, 3500);
  };

  const activityOptions: { id: ActivityLevel; title: string; subtitle: string }[] = [
    {
      id: 'sedentary',
      title: language === 'ar' ? 'خامل / مكتبي' : 'Sedentary',
      subtitle: t.actSedentary,
    },
    {
      id: 'light',
      title: language === 'ar' ? 'نشاط خفيف' : 'Lightly Active',
      subtitle: t.actLight,
    },
    {
      id: 'moderate',
      title: language === 'ar' ? 'نشاط معتدل' : 'Moderately Active',
      subtitle: t.actModerate,
    },
    {
      id: 'very',
      title: language === 'ar' ? 'نشاط عالي' : 'Very Active',
      subtitle: t.actVery,
    },
    {
      id: 'extra',
      title: language === 'ar' ? 'نشاط فائق' : 'Extra Active',
      subtitle: t.actExtra,
    },
  ];

  const goalOptions: { id: Goal; title: string; desc: string; icon: React.ElementType; color: string }[] = [
    {
      id: 'lose',
      title: language === 'ar' ? 'إنقاص الوزن ونحت الجسم' : 'Lose Weight',
      desc: language === 'ar' ? '-500 سعرة (حرق الدهون مع حماية العضل)' : '-500 kcal deficit',
      icon: TrendingDown,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      id: 'maintain',
      title: language === 'ar' ? 'المحافظة على الوزن' : 'Maintain Weight',
      desc: language === 'ar' ? 'ثبات الوزن وتحسين الصحة العامة' : 'Energy balance equilibrium',
      icon: Equal,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'build',
      title: language === 'ar' ? 'بناء وتضخيم العضلات' : 'Build Muscle',
      desc: language === 'ar' ? '+350 سعرة مع زيادة نسبة البروتين' : '+350 kcal lean bulk',
      icon: Dumbbell,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-lg font-extrabold text-slate-900">
          {t.profileTitle}
        </h1>
        <p className="text-xs text-slate-500">
          {t.profileSubtitle}
        </p>
      </div>

      {/* User Account / Google Login Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/20 overflow-hidden ring-2 ring-emerald-500/20">
            {currentUser?.photoUrl ? (
              <img src={currentUser.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-slate-900">
                {currentUser ? currentUser.name : (language === 'ar' ? 'حساب زائر (غير مسجل)' : 'Guest User')}
              </h3>
              {currentUser?.provider === 'google' && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  Google
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {currentUser ? currentUser.email : (language === 'ar' ? 'سجّل دخولك لحفظ بياناتك ومزامنتها' : 'Sign in to sync your data')}
            </p>
          </div>
        </div>

        {currentUser ? (
          <button
            type="button"
            onClick={onSignOut}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 transition"
          >
            {language === 'ar' ? 'خروج' : 'Sign Out'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition flex items-center gap-1 border border-emerald-200"
          >
            <span>{language === 'ar' ? 'دخول Google' : 'Sign In'}</span>
          </button>
        )}
      </div>

      {/* Success Notification Banner */}
      {showSavedToast && (
        <div className="p-3 rounded-2xl bg-emerald-500 text-white flex items-center gap-2.5 text-xs font-bold shadow-md shadow-emerald-500/20 animate-fadeIn">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{t.saveProfileSuccess}</span>
        </div>
      )}

      {/* Share & Publish App Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-4 sm:p-5 border border-emerald-200/80 shadow-xs space-y-3 text-start">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">
                {language === 'ar' ? '🚀 رابط نشر ومشاركة التطبيق' : '🚀 Publish & Share App'}
              </h3>
              <p className="text-[10px] text-slate-500">
                {language === 'ar'
                  ? 'انشر هذا الرابط لأي شخص ليثبت التطبيق فوراً على هاتفه'
                  : 'Share this link with anyone to install directly'}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 uppercase">
            LIVE PWA
          </span>
        </div>

        {/* Link Box with Copy Button */}
        <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-emerald-200">
          <Globe className="w-4 h-4 text-emerald-600 shrink-0 ms-1" />
          <input
            type="text"
            readOnly
            value={publicAppUrl}
            className="w-full bg-transparent text-[11px] font-mono text-slate-700 outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 transition flex items-center gap-1 active:scale-95"
          >
            {copiedLink ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>

        {/* Share Button & Store Publish Helper */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleShareApp}
            className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مشاركة الرابط' : 'Share Link'}</span>
          </button>

          <a
            href={`https://www.pwabuilder.com?url=${encodeURIComponent(publicAppUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>{language === 'ar' ? 'تحويل لـ APK (متجر Play)' : 'Export APK / Play'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Native Android Project Details Trigger */}
        <button
          type="button"
          onClick={() => setShowAndroidModal(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'ar' ? '🤖 خيارات بناء حزمة Android الأصلية (Capacitor/Gradle)' : '🤖 Android Native Build Guide (Capacitor)'}</span>
        </button>
      </div>

      {/* Android Build Details Modal */}
      {showAndroidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 text-start space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {language === 'ar' ? 'بناء وتصدير تطبيق Android' : 'Build Android Application'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Package: com.caloriesnap.app
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAndroidModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Methods */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-2">
                <span className="font-extrabold text-emerald-900 block text-xs">
                  {language === 'ar' ? '⚡ الطريقة الأسهل: تحميل APK أونلاين مجاناً' : '⚡ Cloud Method: Instant Free APK/AAB'}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'عبر أداة PWABuilder المعتمدة من Google، يمكنك تحميل حزمة Android كاملة جاهزة للمتجر أو التثبيت دون الحاجة لأي برمجة:'
                    : 'Download ready-to-publish Android AAB or debug APK without installing Android Studio:'}
                </p>
                <a
                  href={`https://www.pwabuilder.com?url=${encodeURIComponent(publicAppUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                >
                  <span>{language === 'ar' ? 'افتح PWABuilder وحمّل APK' : 'Open PWABuilder & Get APK'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-900 block text-xs">
                  {language === 'ar' ? '💻 الطريقة الاحترافية: مشروع Android Studio الأصلي' : '💻 Local Method: Native Android Studio'}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'تم إنشاء مجلد android الأصلي بالكامل داخل مشروعك مع ملفات Gradle و AndroidManifest.xml.'
                    : 'The native android folder has been created with full Gradle & Capacitor configuration.'}
                </p>
                <div className="space-y-1.5 font-mono text-[11px] bg-slate-900 text-slate-100 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                    <span>Terminal Commands</span>
                    <Terminal className="w-3 h-3" />
                  </div>
                  <p className="text-emerald-400">npm run build:android</p>
                  <p className="text-slate-400"># or open directly in Android Studio:</p>
                  <p className="text-amber-300">npx cap open android</p>
                  <p className="text-slate-400"># to build debug APK directly:</p>
                  <p className="text-emerald-400">cd android && ./gradlew assembleDebug</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidModal(false)}
              className="w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Integrated Live TDEE Calculator Display Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-700/60">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold tracking-wide text-slate-200 uppercase">
              {t.tdeeCalculationTitle}
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {language === 'ar' ? 'حساب فوري' : 'Live Calculation'}
          </span>
        </div>

        {/* Live Target Calories Hero */}
        <div className="py-4 text-center">
          <span className="text-xs font-medium text-slate-400 block mb-1">
            {t.targetCalorieLabel}
          </span>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-4xl font-black tracking-tight text-white">
              {computed.targets.calories.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {t.kcal} / {language === 'ar' ? 'يومياً' : 'day'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t.bmrLabel}: <strong className="text-slate-200">{computed.bmr}</strong> • {t.tdeeLabel}: <strong className="text-slate-200">{computed.tdee}</strong>
          </p>
        </div>

        {/* Recommended Daily Macro Targets Split */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
          <div className="bg-slate-800/60 rounded-2xl p-2 border border-slate-700/50">
            <span className="text-[10px] text-sky-400 font-bold block mb-0.5">{t.protein}</span>
            <span className="text-base font-extrabold text-white">{computed.targets.protein}g</span>
            <span className="text-[9px] text-slate-400 block">
              {Math.round(((computed.targets.protein * 4) / computed.targets.calories) * 100)}%
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-2 border border-slate-700/50">
            <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">{t.carbs}</span>
            <span className="text-base font-extrabold text-white">{computed.targets.carbs}g</span>
            <span className="text-[9px] text-slate-400 block">
              {Math.round(((computed.targets.carbs * 4) / computed.targets.calories) * 100)}%
            </span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-2 border border-slate-700/50">
            <span className="text-[10px] text-amber-400 font-bold block mb-0.5">{t.fats}</span>
            <span className="text-base font-extrabold text-white">{computed.targets.fats}g</span>
            <span className="text-[9px] text-slate-400 block">
              {Math.round(((computed.targets.fats * 9) / computed.targets.calories) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Profile User Form */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-5">
        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>{t.personalInfo}</span>
        </h2>

        {/* Gender Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            {t.gender}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                gender === 'male'
                  ? 'bg-sky-50 text-sky-700 border-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-base">👨</span>
              <span>{t.male}</span>
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                gender === 'female'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-base">👩</span>
              <span>{t.female}</span>
            </button>
          </div>
        </div>

        {/* Age, Weight, Height Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Age */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              {t.age}
            </label>
            <input
              type="number"
              min={13}
              max={100}
              value={age}
              onChange={(e) => setAge(Math.max(13, Math.min(100, Number(e.target.value) || 25)))}
              className="w-full py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              {t.weight}
            </label>
            <input
              type="number"
              min={30}
              max={250}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(Math.max(30, Math.min(250, Number(e.target.value) || 70)))}
              className="w-full py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Height */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              {t.height}
            </label>
            <input
              type="number"
              min={100}
              max={230}
              value={height}
              onChange={(e) => setHeight(Math.max(100, Math.min(230, Number(e.target.value) || 170)))}
              className="w-full py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Goal Selection Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.goalSelection}</span>
          </label>
          <div className="space-y-2">
            {goalOptions.map((g) => {
              const Icon = g.icon;
              const isSelected = goal === g.id;

              return (
                <div
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${g.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{g.title}</h4>
                      <p className="text-[10px] text-slate-400">{g.desc}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Level Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.activityLevel}</span>
          </label>
          <div className="space-y-1.5">
            {activityOptions.map((act) => {
              const isSelected = activityLevel === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => setActivityLevel(act.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-bold'
                      : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">{act.title}</span>
                    <span className="text-[10px] text-slate-400">{act.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-[0.99]"
        >
          <Save className="w-4 h-4" />
          <span>{t.save}</span>
        </button>
      </div>
    </div>
  );
};
