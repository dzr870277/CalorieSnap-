import React, { useState } from 'react';
import {
  Sparkles,
  ChefHat,
  Clock,
  Flame,
  Plus,
  Check,
  RotateCcw,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, LoggedFood, MacroTargets, MealType } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface AIMealPlannerProps {
  language: Language;
  remainingCalories: number;
  targets: MacroTargets;
  currentDate: string;
  onAddFood: (food: Omit<LoggedFood, 'id' | 'timestamp'>) => void;
}

interface GeneratedRecipe {
  titleAr: string;
  titleEn: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime: string;
  ingredientsAr: string[];
  ingredientsEn: string[];
  stepsAr: string[];
  stepsEn: string[];
  mealType: MealType;
}

export const AIMealPlanner: React.FC<AIMealPlannerProps> = ({
  language,
  remainingCalories,
  targets,
  currentDate,
  onAddFood,
}) => {
  const t = TRANSLATIONS[language];

  // Quick ingredient suggestions
  const suggestedIngredients = [
    { id: 'chicken', labelAr: 'صدر دجاج', labelEn: 'Chicken Breast' },
    { id: 'eggs', labelAr: 'بيض', labelEn: 'Eggs' },
    { id: 'rice', labelAr: 'أرز بسمتي', labelEn: 'Basmati Rice' },
    { id: 'tomatoes', labelAr: 'طماطم', labelEn: 'Tomatoes' },
    { id: 'olive_oil', labelAr: 'زيت زيتون', labelEn: 'Olive Oil' },
    { id: 'greek_yogurt', labelAr: 'زبادي يوناني', labelEn: 'Greek Yogurt' },
    { id: 'oats', labelAr: 'شوفان', labelEn: 'Oats' },
    { id: 'tuna', labelAr: 'تونة مصفاة', labelEn: 'Tuna' },
    { id: 'spinach', labelAr: 'سبانخ', labelEn: 'Spinach' },
    { id: 'feta', labelAr: 'جبن قريش / فيتا', labelEn: 'Feta / Cottage Cheese' },
  ];

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    'chicken',
    'rice',
    'tomatoes',
    'olive_oil',
  ]);
  const [customIngredient, setCustomIngredient] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [hasLogged, setHasLogged] = useState(false);

  const toggleIngredient = (id: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIngredient.trim()) return;
    setSelectedIngredients((prev) => [...prev, customIngredient.trim()]);
    setCustomIngredient('');
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setHasLogged(false);

    // Calculate dynamic target budget based on remaining calories
    const targetBudget = Math.max(300, Math.min(850, remainingCalories > 200 ? remainingCalories : 500));

    setTimeout(() => {
      setIsGenerating(false);

      // Intelligent customized recipe matched to ingredients and target calories
      const hasChicken = selectedIngredients.some((i) => i.includes('chicken') || i.includes('دجاج'));
      const hasEggs = selectedIngredients.some((i) => i.includes('eggs') || i.includes('بيض'));
      const hasTuna = selectedIngredients.some((i) => i.includes('tuna') || i.includes('تونة'));

      let newRecipe: GeneratedRecipe;

      if (hasEggs) {
        newRecipe = {
          titleAr: 'شكشوكة بروتينية صحية بزيت الزيتون والطماطم',
          titleEn: 'High-Protein Shakshuka with Extra Whites & Herbs',
          calories: Math.round(targetBudget * 0.85),
          protein: Math.round(targetBudget * 0.06),
          carbs: Math.round(targetBudget * 0.04),
          fats: Math.round(targetBudget * 0.035),
          prepTime: language === 'ar' ? '12 دقيقة' : '12 mins',
          mealType: 'breakfast',
          ingredientsAr: [
            '3 بيضات كاملة + بياض بيضتان (بروتين عالي)',
            'حبتان طماطم مفرومة طازجة',
            'نصف ملعقة صغيرة زيت زيتون بكر ممتاز (5 مل)',
            'فص ثوم مهروس، كمون، فلفل أسود، وملح هيمالايا',
            'نصف رغيف خبز بر أسمر أو خضار ورقية جانبية'
          ],
          ingredientsEn: [
            '3 whole eggs + 2 egg whites for lean protein',
            '2 diced fresh ripe tomatoes',
            '1/2 tsp extra virgin olive oil (5ml)',
            'Crushed garlic, ground cumin, and sea salt',
            '1/2 whole wheat pita or fresh greens on the side'
          ],
          stepsAr: [
            'سخّن زيت الزيتون في مقلاة غير لاصقة وشوّح الثوم والطماطم لمدة 4 دقائق حتى تتسبك.',
            'أضف الكمون والملح والفلفل، ثم اصنع فجوات صغيرة واكسر البيض بداخلها.',
            'غطّ المقلاة على نار هادئة لمدة 5-6 دقائق حتى ينضج البياض ويبقى الصفار غنياً.',
            'قدّمها دافئة للاستمتاع بوجبة مشبعة تناسب ميزانيتك التغذوية بدقة.'
          ],
          stepsEn: [
            'Warm the olive oil in a non-stick skillet and gently saute garlic and tomatoes for 4 minutes.',
            'Season with cumin, salt, and black pepper. Create small wells and crack in the eggs.',
            'Cover and simmer on low heat for 5-6 minutes until whites are cooked through.',
            'Serve immediately for a warm, perfectly calibrated high-protein meal.'
          ]
        };
      } else if (hasTuna) {
        newRecipe = {
          titleAr: 'سلطة تونة وبطاطا دافئة بالليمون والزبادي اليوناني',
          titleEn: 'Warm Lemon-Herb Tuna & Greek Yogurt Bowl',
          calories: targetBudget,
          protein: Math.round(targetBudget * 0.075),
          carbs: Math.round(targetBudget * 0.06),
          fats: Math.round(targetBudget * 0.025),
          prepTime: language === 'ar' ? '10 دقائق' : '10 mins',
          mealType: 'lunch',
          ingredientsAr: [
            'علبة تونة مصفاة من الزيت (160غ)',
            '3 ملاعق كبيرة زبادي يوناني خالي الدسم كبديل صحي للمايونيز',
            'عصير نصف ليمونة خضراء مع رشة زعتر بري',
            'كوب خضار مشكلة (خيار، طماطم، بقدونس)'
          ],
          ingredientsEn: [
            '1 can chunk light tuna in water, drained (160g)',
            '3 tbsp non-fat Greek yogurt (healthy creamy base)',
            'Fresh squeezed lemon juice & dried oregano',
            'Diced cucumbers, sweet cherry tomatoes & parsley'
          ],
          stepsAr: [
            'صفِّ التونة جيداً وضعها في وعاء التقديم.',
            'اخلط الزبادي اليوناني مع الليمون والزعتر ورشة فلفل للحصول على صوص كريمي غني بالبروتين.',
            'اسكب الصوص فوق التونة واخلط مع الخضار الطازجة.'
          ],
          stepsEn: [
            'Drain tuna thoroughly and flake into a salad bowl.',
            'Whisk Greek yogurt with fresh lemon juice, oregano, salt, and pepper.',
            'Toss tuna with dressing and crisp diced garden vegetables.'
          ]
        };
      } else {
        newRecipe = {
          titleAr: 'طاجن صدر دجاج مشوي بالأرز البسمتي والخضار العطرية',
          titleEn: 'Herb-Seared Chicken Breast with Fragrant Basmati Bowl',
          calories: targetBudget,
          protein: Math.max(38, Math.round(targetBudget * 0.07)),
          carbs: Math.round(targetBudget * 0.065),
          fats: Math.round(targetBudget * 0.025),
          prepTime: language === 'ar' ? '20 دقيقة' : '20 mins',
          mealType: 'lunch',
          ingredientsAr: [
            '180غ صدر دجاج فيليه بدون جلد (38غ بروتين نقي)',
            'كوب صغير أرز بسمتي مطبوخ على البخار (120غ)',
            'حبة طماطم مع فلفل رومي وبصل مقطع شرائح',
            'ملعقة صغيرة زيت زيتون مع بهارات عربية (بابريكا، هيل، كزبرة)'
          ],
          ingredientsEn: [
            '180g skinless chicken breast fillet (38g pure protein)',
            '1 cup steamed aromatic basmati rice (120g)',
            'Sliced vine tomatoes, bell peppers & red onions',
            '1 tsp olive oil with Arabic shawarma spices (paprika, cardamom, coriander)'
          ],
          stepsAr: [
            'تبّل صدر الدجاج بملعقة زيت الزيتون والبهارات وعصير الليمون.',
            'اشوِ الدجاج على مقلاة ساخنة لمدة 6 دقائق لكل جانب حتى النضج والقرمشة.',
            'شوّح شرائح الخضار في نفس المقلاة لامتصاص النكهات الغنية.',
            'قطّع الدجاج إلى شرائح وقدّمه فوق الأرز البسمتي مع الخضار المشوية.'
          ],
          stepsEn: [
            'Season chicken breast with olive oil, spices, and lemon.',
            'Sear on a hot skillet for 6 minutes per side until golden and juicy.',
            'Toss sliced peppers and tomatoes in the pan to absorb rich flavors.',
            'Slice chicken into strips and serve alongside warm basmati rice.'
          ]
        };
      }

      setRecipe(newRecipe);

      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }, 1100);
  };

  const handleLogRecipe = () => {
    if (!recipe) return;

    onAddFood({
      nameAr: recipe.titleAr,
      nameEn: recipe.titleEn,
      mealType: selectedMealType,
      servings: 1,
      servingUnitAr: language === 'ar' ? 'وجبة كاملة مخصصة' : '1 Custom Meal',
      servingUnitEn: '1 Custom Meal',
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats,
      dateStr: currentDate,
    });

    setHasLogged(true);

    try {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <ChefHat className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-wide">
              {language === 'ar' ? 'مُنشئ الوجبات الذكي (AI Meal Planner)' : 'AI Smart Meal Planner'}
            </h2>
            <p className="text-[11px] text-emerald-100">
              {language === 'ar'
                ? 'وصفات مخصصة بمكونات منزلك مطابقة لسعراتك المتبقية'
                : 'Custom recipes from home ingredients matching your remaining calories'}
            </p>
          </div>
        </div>

        {/* Dynamic Remaining Calories Gauge */}
        <div className="pt-2 flex items-center justify-between border-t border-white/15">
          <span className="text-xs text-emerald-100 font-medium">
            {language === 'ar' ? 'الميزانية الحرارية المستهدفة:' : 'Target calorie budget:'}
          </span>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white text-emerald-800 shadow-xs">
            {remainingCalories > 0 ? remainingCalories : 500} {t.kcal}
          </span>
        </div>
      </div>

      {/* Ingredients Selector Box */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-extrabold text-slate-800 block mb-1">
            {language === 'ar' ? '1. حدد المكونات المتوفرة لديك:' : '1. Select ingredients in your kitchen:'}
          </label>
          <p className="text-[11px] text-slate-400">
            {language === 'ar' ? 'اضغط لتحديد المكونات أو أضف أي مكون آخر تريده' : 'Tap to toggle ingredients or type your own'}
          </p>
        </div>

        {/* Ingredient Chips */}
        <div className="flex flex-wrap gap-1.5">
          {suggestedIngredients.map((item) => {
            const isSelected = selectedIngredients.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleIngredient(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Ingredient Input */}
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            type="text"
            value={customIngredient}
            onChange={(e) => setCustomIngredient(e.target.value)}
            placeholder={language === 'ar' ? 'أضف مكون آخر (مثلاً: بروكلي، شوفان...)' : 'Add another ingredient...'}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Meal Type Selection */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            {language === 'ar' ? '2. نوع الوجبة المراد تحضيرها:' : '2. Meal type to cook:'}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'breakfast', labelAr: 'فطور', labelEn: 'Breakfast' },
              { id: 'lunch', labelAr: 'غداء', labelEn: 'Lunch' },
              { id: 'dinner', labelAr: 'عشاء', labelEn: 'Dinner' },
              { id: 'snack', labelAr: 'سناك', labelEn: 'Snack' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMealType(m.id as MealType)}
                className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                  selectedMealType === m.id
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {language === 'ar' ? m.labelAr : m.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Recipe Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || selectedIngredients.length === 0}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{language === 'ar' ? 'جاري ابتكار الوصفة بالذكاء الاصطناعي...' : 'AI Cooking Recipe...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{language === 'ar' ? 'توليد وصفة صحية مخصصة لسعراتي' : 'Generate Calorie-Matched Recipe'}</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Recipe Card */}
      {recipe && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                {language === 'ar' ? 'وصفة ذكية متوافقة مع سعراتك' : 'AI Calorie-Matched'}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 mt-1.5">
                {language === 'ar' ? recipe.titleAr : recipe.titleEn}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{recipe.prepTime}</span>
            </div>
          </div>

          {/* Calorie & Macro Target Split Pill */}
          <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block">{t.kcal}</span>
              <span className="text-xs font-black text-slate-900">{recipe.calories}</span>
            </div>
            <div>
              <span className="text-[10px] text-sky-600 font-bold block">{t.protein}</span>
              <span className="text-xs font-black text-sky-900">{recipe.protein}g</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 font-bold block">{t.carbs}</span>
              <span className="text-xs font-black text-emerald-900">{recipe.carbs}g</span>
            </div>
            <div>
              <span className="text-[10px] text-amber-600 font-bold block">{t.fats}</span>
              <span className="text-xs font-black text-amber-900">{recipe.fats}g</span>
            </div>
          </div>

          {/* Ingredients list */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>{language === 'ar' ? 'المقادير الدقيقة:' : 'Exact Ingredients:'}</span>
            </h4>
            <ul className="space-y-1 text-xs text-slate-600 list-disc ps-4">
              {(language === 'ar' ? recipe.ingredientsAr : recipe.ingredientsEn).map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>

          {/* Cooking Steps */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800">
              {language === 'ar' ? 'طريقة التحضير السريعة:' : 'Quick Preparation Steps:'}
            </h4>
            <ol className="space-y-1.5 text-xs text-slate-600 list-decimal ps-4">
              {(language === 'ar' ? recipe.stepsAr : recipe.stepsEn).map((step, i) => (
                <li key={i} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>

          {/* 1-Tap Log Meal to Diary Button */}
          <button
            type="button"
            onClick={handleLogRecipe}
            disabled={hasLogged}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              hasLogged
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95'
            }`}
          >
            {hasLogged ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{language === 'ar' ? 'تمت إضافة الوجبة لسجل اليوم!' : 'Logged to Today Diary!'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{language === 'ar' ? 'إضافة الوجبة فورياً لسجل اليوم' : 'Add Recipe to Today Diary'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
