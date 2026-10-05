import React from 'react';
import {
  Flame,
  Plus,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Camera
} from 'lucide-react';
import { Language, LoggedFood, MacroTargets, MealType, Screen } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface DashboardScreenProps {
  language: Language;
  targets: MacroTargets;
  loggedFoods: LoggedFood[];
  currentDate: string;
  onDateChange: (deltaDays: number) => void;
  onNavigate: (screen: Screen) => void;
  onOpenAddFoodModal: (mealType?: MealType) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  language,
  targets,
  loggedFoods,
  currentDate,
  onDateChange,
  onNavigate,
  onOpenAddFoodModal,
}) => {
  const t = TRANSLATIONS[language];

  // Calculate totals
  const consumed = loggedFoods.reduce((acc, item) => {
    return {
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats,
    };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const remainingCalories = targets.calories - consumed.calories;
  const isOverBudget = remainingCalories < 0;
  const caloriePercentage = Math.min(100, Math.round((consumed.calories / targets.calories) * 100));

  // Circular progress ring calculations
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, consumed.calories / targets.calories);
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Meal breakdown
  const mealBreakdown: Record<MealType, { calories: number; itemsCount: number }> = {
    breakfast: { calories: 0, itemsCount: 0 },
    lunch: { calories: 0, itemsCount: 0 },
    dinner: { calories: 0, itemsCount: 0 },
    snack: { calories: 0, itemsCount: 0 },
  };

  loggedFoods.forEach((food) => {
    if (mealBreakdown[food.mealType]) {
      mealBreakdown[food.mealType].calories += food.calories;
      mealBreakdown[food.mealType].itemsCount += 1;
    }
  });

  const mealCards: {
    type: MealType;
    title: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }[] = [
    { type: 'breakfast', title: t.breakfast, icon: Coffee, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { type: 'lunch', title: t.lunch, icon: Sun, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { type: 'dinner', title: t.dinner, icon: Moon, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { type: 'snack', title: t.snacks, icon: Cookie, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  ];

  // Format display date
  const todayStr = new Date().toISOString().split('T')[0];
  let dateDisplayLabel = currentDate;
  if (currentDate === todayStr) {
    dateDisplayLabel = t.today;
  }

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Date Navigation & Streak Bar */}
      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => onDateChange(language === 'ar' ? 1 : -1)}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          aria-label="Previous day"
        >
          {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">
            {dateDisplayLabel}
          </span>
          <span className="text-xs text-slate-400">
            ({currentDate})
          </span>
        </div>

        <button
          onClick={() => onDateChange(language === 'ar' ? -1 : 1)}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          aria-label="Next day"
        >
          {language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Calories Circular Progress Ring Card */}
      <div className="relative bg-gradient-to-b from-white to-slate-50/80 rounded-3xl p-6 border border-slate-200/90 shadow-md shadow-slate-100/80 text-center">
        {/* Streak & Status Pill */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200/60 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>5 {t.streakDays}</span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <Award className="w-3.5 h-3.5" />
            <span>{caloriePercentage}% {language === 'ar' ? 'مكتمل' : 'met'}</span>
          </div>
        </div>

        {/* SVG Circular Ring */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="calorieProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="calorieOverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Dynamic Progress Arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={isOverBudget ? 'url(#calorieOverGradient)' : 'url(#calorieProgressGradient)'}
              strokeWidth="16"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Info inside Circular Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              {isOverBudget ? t.overBudget : t.caloriesRemaining}
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-4xl font-extrabold tracking-tight ${
                isOverBudget ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {Math.abs(remainingCalories).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {t.kcal}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-medium text-slate-500">
              {isOverBudget
                ? (language === 'ar' ? 'تجاوزت الحد اليومي' : 'Target exceeded')
                : (language === 'ar' ? 'ضمن النطاق الصحي' : 'Remaining to eat')}
            </div>
          </div>
        </div>

        {/* Consumed vs Target Details Sub-bar */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
              {t.consumed}
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-lg font-bold text-slate-800">
                {consumed.calories.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">{t.kcal}</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
              {t.dailyTarget}
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-lg font-bold text-slate-800">
                {targets.calories.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">{t.kcal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Meal Photo Scanner Card with $2.99 PayPal Integration */}
      <div
        onClick={() => onNavigate('premium')}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-4 text-white shadow-md cursor-pointer group hover:brightness-105 transition active:scale-[0.99]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Camera className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black tracking-wide text-white">
                  {language === 'ar' ? 'فحص الوجبات بكاميرا الذكاء الاصطناعي 📸' : 'AI Meal Photo Scanner 📸'}
                </h3>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase shadow-xs">
                  PRO $2.99
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5 line-clamp-1">
                {language === 'ar'
                  ? 'صوّر أي طبق لمعرفة سعراته وماكروزه فورياً بدقة 98%'
                  : 'Snap any dish to auto-detect calories & macros instantly'}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
            {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Daily Macronutrients Progress Indicators */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>{t.macrosTitle}</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {language === 'ar' ? 'الهدف بالجرام' : 'Grams Target'}
          </span>
        </div>

        {/* 3 Horizontal Mini Progress Indicators */}
        <div className="space-y-3.5">
          {/* 1. Protein Indicator */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span className="font-bold text-slate-800">{t.protein}</span>
              </div>
              <div className="text-slate-600 font-semibold text-xs">
                <span className="text-slate-900 font-bold">{consumed.protein}</span>
                <span className="text-slate-400 font-normal"> / {targets.protein}{t.grams}</span>
                <span className="ms-1.5 text-[10px] px-1.5 py-0.2 rounded-md bg-sky-50 text-sky-700 font-bold">
                  {Math.round((consumed.protein / (targets.protein || 1)) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (consumed.protein / (targets.protein || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Carbs Indicator */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-slate-800">{t.carbs}</span>
              </div>
              <div className="text-slate-600 font-semibold text-xs">
                <span className="text-slate-900 font-bold">{consumed.carbs}</span>
                <span className="text-slate-400 font-normal"> / {targets.carbs}{t.grams}</span>
                <span className="ms-1.5 text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                  {Math.round((consumed.carbs / (targets.carbs || 1)) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (consumed.carbs / (targets.carbs || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3. Fats Indicator */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="font-bold text-slate-800">{t.fats}</span>
              </div>
              <div className="text-slate-600 font-semibold text-xs">
                <span className="text-slate-900 font-bold">{consumed.fats}</span>
                <span className="text-slate-400 font-normal"> / {targets.fats}{t.grams}</span>
                <span className="ms-1.5 text-[10px] px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 font-bold">
                  {Math.round((consumed.fats / (targets.fats || 1)) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (consumed.fats / (targets.fats || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Meal Summary & 1-Click Add */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>{t.mealsOverview}</span>
          </h2>
          <button
            onClick={() => onNavigate('foodLog')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            {t.viewAllLog}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {mealCards.map((meal) => {
            const Icon = meal.icon;
            const data = mealBreakdown[meal.type];

            return (
              <div
                key={meal.type}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl ${meal.bgColor} ${meal.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{meal.title}</h4>
                      <p className="text-[10px] text-slate-400">
                        {data.itemsCount} {language === 'ar' ? 'أصناف' : 'items'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenAddFoodModal(meal.type)}
                    className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 flex items-center justify-center transition active:scale-90"
                    title={t.addFoodToMeal}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-medium">{t.totalMealCalories}</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {data.calories} <span className="text-[10px] text-slate-400 font-normal">{t.kcal}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Daily Tip Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/70 rounded-2xl p-4 border border-emerald-100/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {t.dailyAdvice}
          </p>
        </div>
      </div>

      {/* Floating Action Button for Quick Add */}
      <div className="pt-1">
        <button
          onClick={() => onOpenAddFoodModal()}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{t.quickAddMeal}</span>
        </button>
      </div>
    </div>
  );
};
