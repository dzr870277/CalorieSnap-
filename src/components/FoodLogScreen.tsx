import React from 'react';
import {
  Coffee,
  Sun,
  Moon,
  Cookie,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import { Language, LoggedFood, MealType } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface FoodLogScreenProps {
  language: Language;
  loggedFoods: LoggedFood[];
  currentDate: string;
  onDateChange: (deltaDays: number) => void;
  onOpenAddModal: (mealType: MealType) => void;
  onDeleteFood: (id: string) => void;
}

export const FoodLogScreen: React.FC<FoodLogScreenProps> = ({
  language,
  loggedFoods,
  currentDate,
  onDateChange,
  onOpenAddModal,
  onDeleteFood,
}) => {
  const t = TRANSLATIONS[language];

  // Daily totals
  const dailyTotals = loggedFoods.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const mealSections: {
    type: MealType;
    title: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    timeHint: string;
  }[] = [
    {
      type: 'breakfast',
      title: t.breakfast,
      icon: Coffee,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200/60',
      timeHint: language === 'ar' ? 'صباحاً (07:00 - 11:00)' : 'Morning (07:00 - 11:00)',
    },
    {
      type: 'lunch',
      title: t.lunch,
      icon: Sun,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200/60',
      timeHint: language === 'ar' ? 'ظهراً (12:00 - 16:00)' : 'Afternoon (12:00 - 16:00)',
    },
    {
      type: 'dinner',
      title: t.dinner,
      icon: Moon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200/60',
      timeHint: language === 'ar' ? 'مساءً (19:00 - 22:00)' : 'Evening (19:00 - 22:00)',
    },
    {
      type: 'snack',
      title: t.snacks,
      icon: Cookie,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200/60',
      timeHint: language === 'ar' ? 'بين الوجبات أو سناك رياضي' : 'Between meals or snack',
    },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  let dateDisplayLabel = currentDate;
  if (currentDate === todayStr) {
    dateDisplayLabel = t.today;
  }

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Date Navigation & Daily Totals Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onDateChange(language === 'ar' ? 1 : -1)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            aria-label="Previous day"
          >
            {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="text-center">
            <span className="text-sm font-bold text-slate-800 block">
              {dateDisplayLabel}
            </span>
            <span className="text-xs text-slate-400">
              {currentDate}
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

        {/* Daily Macros Mini Summary */}
        <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-1.5">
            <span className="text-[10px] text-slate-400 block">{t.consumed}</span>
            <span className="text-xs font-bold text-slate-900">{dailyTotals.calories} {t.kcal}</span>
          </div>
          <div className="bg-sky-50/60 rounded-xl p-1.5">
            <span className="text-[10px] text-sky-600 block">{t.protein}</span>
            <span className="text-xs font-bold text-sky-900">{dailyTotals.protein}{t.grams}</span>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-1.5">
            <span className="text-[10px] text-emerald-600 block">{t.carbs}</span>
            <span className="text-xs font-bold text-emerald-900">{dailyTotals.carbs}{t.grams}</span>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-1.5">
            <span className="text-[10px] text-amber-600 block">{t.fats}</span>
            <span className="text-xs font-bold text-amber-900">{dailyTotals.fats}{t.grams}</span>
          </div>
        </div>
      </div>

      {/* Visual Timeline Split into 4 Sections */}
      <div className="relative space-y-4 before:absolute before:top-4 before:bottom-4 before:start-[22px] before:w-0.5 before:bg-slate-200/80">
        {mealSections.map((section) => {
          const Icon = section.icon;
          const foodsInMeal = loggedFoods.filter((f) => f.mealType === section.type);
          const mealCalories = foodsInMeal.reduce((sum, item) => sum + item.calories, 0);
          const mealProtein = foodsInMeal.reduce((sum, item) => sum + item.protein, 0);

          return (
            <div key={section.type} className="relative ps-11">
              {/* Timeline Node Icon */}
              <div
                className={`absolute start-0 top-3 w-9 h-9 rounded-2xl ${section.bgColor} ${section.color} border-2 ${section.borderColor} shadow-xs flex items-center justify-center z-10`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Meal Card Container */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
                {/* Meal Header with Functional "+" Button */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-800">
                        {section.title}
                      </h3>
                      {mealCalories > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {mealCalories} {t.kcal}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {section.timeHint}
                    </span>
                  </div>

                  {/* Functional "+" Button */}
                  <button
                    onClick={() => onOpenAddModal(section.type)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs active:scale-95 transition"
                    title={t.addFoodToMeal}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{t.add}</span>
                  </button>
                </div>

                {/* Items in this Meal */}
                {foodsInMeal.length === 0 ? (
                  <div
                    onClick={() => onOpenAddModal(section.type)}
                    className="py-5 px-3 text-center cursor-pointer group"
                  >
                    <p className="text-xs text-slate-400 group-hover:text-emerald-600 transition">
                      {t.emptyMealText}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600">
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>{t.addFoodToMeal}</span>
                    </span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 pt-1">
                    {foodsInMeal.map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between group"
                      >
                        <div className="flex-1 pe-2">
                          <div className="flex items-baseline gap-1.5">
                            <h4 className="text-xs font-bold text-slate-800">
                              {language === 'ar' ? item.nameAr : item.nameEn}
                            </h4>
                            {item.servings !== 1 && (
                              <span className="text-[10px] text-slate-400">
                                ({item.servings}x)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span>
                              {language === 'ar' ? item.servingUnitAr : item.servingUnitEn}
                            </span>
                            <span>•</span>
                            <span className="text-sky-600 font-semibold">{item.protein}g {language === 'ar' ? 'بروتين' : 'P'}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">{item.carbs}g {language === 'ar' ? 'كارب' : 'C'}</span>
                            <span>•</span>
                            <span className="text-amber-600 font-semibold">{item.fats}g {language === 'ar' ? 'دهون' : 'F'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-end">
                            <span className="text-xs font-extrabold text-slate-800 block">
                              {item.calories}
                            </span>
                            <span className="text-[9px] text-slate-400 block -mt-0.5">
                              {t.kcal}
                            </span>
                          </div>

                          <button
                            onClick={() => onDeleteFood(item.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition active:scale-90"
                            title={t.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
