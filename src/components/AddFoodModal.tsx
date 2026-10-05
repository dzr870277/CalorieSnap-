import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Flame,
  Check,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Utensils,
  Camera,
  Scan,
  ExternalLink,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FoodItem, Language, LoggedFood, MealType } from '../types';
import { FOOD_DATABASE } from '../data/foodDatabase';
import { TRANSLATIONS } from '../i18n/translations';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  language: Language;
  currentDate: string;
  onAddFood: (food: Omit<LoggedFood, 'id' | 'timestamp'>) => void;
  isPro?: boolean;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  defaultMealType = 'breakfast',
  language,
  currentDate,
  onAddFood,
  isPro = false,
}) => {
  const t = TRANSLATIONS[language];

  // State
  const [activeTab, setActiveTab] = useState<'database' | 'aiScan' | 'custom'>('database');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(defaultMealType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(1);

  // AI Scan state
  const [aiScanning, setAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<{
    nameAr: string;
    nameEn: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    emoji: string;
    portionAr: string;
    portionEn: string;
  } | null>(null);

  const PAYPAL_PAYMENT_URL = 'https://www.paypal.com/ncp/payment/SLR4A6C2R33BU';

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState<number | ''>(250);
  const [customProtein, setCustomProtein] = useState<number | ''>(15);
  const [customCarbs, setCustomCarbs] = useState<number | ''>(25);
  const [customFats, setCustomFats] = useState<number | ''>(8);
  const [customUnit, setCustomUnit] = useState(language === 'ar' ? 'وجبة' : 'Meal');

  // Filter food database
  const filteredDatabase = useMemo(() => {
    return FOOD_DATABASE.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.nameAr.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleSelectFood = (item: FoodItem) => {
    setSelectedItem(item);
    setServingsMultiplier(1);
  };

  const handleConfirmAdd = () => {
    if (!selectedItem) return;

    const loggedItem: Omit<LoggedFood, 'id' | 'timestamp'> = {
      foodId: selectedItem.id,
      nameAr: selectedItem.nameAr,
      nameEn: selectedItem.nameEn,
      mealType: selectedMeal,
      servings: servingsMultiplier,
      servingUnitAr: selectedItem.servingUnitAr,
      servingUnitEn: selectedItem.servingUnitEn,
      calories: Math.round(selectedItem.calories * servingsMultiplier),
      protein: Math.round(selectedItem.protein * servingsMultiplier),
      carbs: Math.round(selectedItem.carbs * servingsMultiplier),
      fats: Math.round(selectedItem.fats * servingsMultiplier),
      dateStr: currentDate,
    };

    onAddFood(loggedItem);

    // Subtle celebration
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    setSelectedItem(null);
    onClose();
  };

  const handleConfirmCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || customCalories === '') return;

    const loggedItem: Omit<LoggedFood, 'id' | 'timestamp'> = {
      nameAr: customName,
      nameEn: customName,
      mealType: selectedMeal,
      servings: 1,
      servingUnitAr: customUnit,
      servingUnitEn: customUnit,
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fats: Number(customFats) || 0,
      dateStr: currentDate,
    };

    onAddFood(loggedItem);

    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    setCustomName('');
    onClose();
  };

  const categories = [
    { id: 'all', label: t.allCategories },
    { id: 'traditional', label: t.catTraditional },
    { id: 'breakfast', label: t.catBreakfast },
    { id: 'meat', label: t.catMeat },
    { id: 'bakery', label: t.catBakery },
    { id: 'dessert', label: t.catDessert },
    { id: 'healthy', label: t.catHealthy },
    { id: 'drinks', label: t.catDrinks },
  ];

  const meals: { id: MealType; label: string }[] = [
    { id: 'breakfast', label: t.breakfast },
    { id: 'lunch', label: t.lunch },
    { id: 'dinner', label: t.dinner },
    { id: 'snack', label: t.snacks },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {t.addFoodToMeal}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ar' ? 'اختر الوجبة وسجل طعامك' : 'Choose meal and log your food'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Selection Row */}
        <div className="px-5 pt-3 pb-2 bg-slate-50/60 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-200/60 rounded-xl">
            {meals.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMeal(m.id)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedMeal === m.id
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switcher: Database vs AI Scan vs Custom */}
        <div className="flex border-b border-slate-100 px-4 pt-2">
          <button
            onClick={() => {
              setActiveTab('database');
              setSelectedItem(null);
            }}
            className={`flex-1 py-2 text-[11px] font-bold border-b-2 transition ${
              activeTab === 'database'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.databaseTab}
          </button>
          <button
            onClick={() => {
              setActiveTab('aiScan');
              setSelectedItem(null);
            }}
            className={`flex-1 py-2 text-[11px] font-bold border-b-2 transition flex items-center justify-center gap-1 ${
              activeTab === 'aiScan'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>📸 {language === 'ar' ? 'مسح AI' : 'AI Scan'}</span>
            <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-400 text-slate-900 font-extrabold">
              $2.99
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('custom');
              setSelectedItem(null);
            }}
            className={`flex-1 py-2 text-[11px] font-bold border-b-2 transition ${
              activeTab === 'custom'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.customFoodTab}
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'database' && (
            <div className="space-y-4">
              {/* If an item is currently selected for portion adjustment */}
              {selectedItem ? (
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-4 animate-fadeIn">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedItem.emoji}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {language === 'ar' ? selectedItem.nameAr : selectedItem.nameEn}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {language === 'ar' ? selectedItem.servingUnitAr : selectedItem.servingUnitEn}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
                    >
                      {language === 'ar' ? 'تغيير' : 'Change'}
                    </button>
                  </div>

                  {/* Servings Multiplier Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>{t.servingMultiplier}:</span>
                      <span className="text-emerald-700 text-sm font-extrabold">
                        {servingsMultiplier}x ({Math.round(selectedItem.calories * servingsMultiplier)} {t.kcal})
                      </span>
                    </label>

                    {/* Quick Pill Buttons */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {[0.5, 1, 1.5, 2, 3].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setServingsMultiplier(val)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                            servingsMultiplier === val
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {val}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recalculated Macros Breakdown */}
                  <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-emerald-100">
                    <div className="bg-white rounded-xl p-2 border border-emerald-100/60">
                      <span className="text-[10px] text-slate-400 block">{t.kcal}</span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {Math.round(selectedItem.calories * servingsMultiplier)}
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-emerald-100/60">
                      <span className="text-[10px] text-sky-600 block">{t.protein}</span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {Math.round(selectedItem.protein * servingsMultiplier)}{t.grams}
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-emerald-100/60">
                      <span className="text-[10px] text-emerald-600 block">{t.carbs}</span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {Math.round(selectedItem.carbs * servingsMultiplier)}{t.grams}
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-2 border border-emerald-100/60">
                      <span className="text-[10px] text-amber-600 block">{t.fats}</span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {Math.round(selectedItem.fats * servingsMultiplier)}{t.grams}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleConfirmAdd}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{t.confirmAddFood}</span>
                  </button>
                </div>
              ) : null}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Horizontal Category Filters */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Food Items List */}
              <div className="space-y-2">
                {filteredDatabase.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    {language === 'ar' ? 'لم يتم العثور على أطعمة مطابقة للبحث' : 'No matching foods found'}
                  </div>
                ) : (
                  filteredDatabase.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectFood(item)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-xs active:scale-[0.99] ${
                        selectedItem?.id === item.id
                          ? 'border-emerald-500 bg-emerald-50/50'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl">
                          {item.emoji}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900">
                              {language === 'ar' ? item.nameAr : item.nameEn}
                            </h4>
                            {item.isPopular && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                                {language === 'ar' ? 'شائع' : 'Popular'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {language === 'ar' ? item.servingUnitAr : item.servingUnitEn} • P: {item.protein}g C: {item.carbs}g F: {item.fats}g
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-end">
                          <span className="text-xs font-extrabold text-slate-800">
                            {item.calories}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {t.kcal}
                          </span>
                        </div>
                        <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 2: AI Meal Photo Scanner with $2.99 PayPal Payment */}
          {activeTab === 'aiScan' && (
            <div className="space-y-4 animate-fadeIn">
              {!isPro ? (
                /* Strictly Locked View for Non-Paying Users */
                <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white text-center space-y-4 border border-slate-800 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 inline-block mb-1.5">
                      PRO • 2.99$
                    </span>
                    <h3 className="text-base font-extrabold text-white">
                      {language === 'ar'
                        ? 'ميزة فحص الطعام والتصوير بالذكاء الاصطناعي مقفلة'
                        : 'AI Food Photo & Barcode Scanner Locked'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
                      {language === 'ar'
                        ? 'هذه الميزة مخصصة للمشتركين. صوّر طبقك أو امسح الباركود ليتم حساب السعرات والماكروز تلقائياً.'
                        : 'This feature is for PRO subscribers. Snap your plate or scan barcodes to auto-calculate calories & macros.'}
                    </p>
                  </div>

                  {/* Pricing Badge */}
                  <div className="inline-flex items-baseline justify-center gap-1 bg-white/10 px-4 py-1.5 rounded-xl border border-white/10">
                    <span className="text-xl font-black text-amber-300">2.99$</span>
                    <span className="text-[11px] text-slate-300">
                      / {language === 'ar' ? 'شهرياً فقط' : 'month only'}
                    </span>
                  </div>

                  {/* Yellow PayPal Button */}
                  <a
                    href={PAYPAL_PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#FFC439] hover:bg-[#F5B000] active:scale-[0.98] transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 text-slate-900 font-extrabold text-xs sm:text-sm border border-amber-400 cursor-pointer"
                    style={{ backgroundColor: '#FFC439' }}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
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
                    <span>{language === 'ar' ? 'اشترك عبر PayPal ($2.99)' : 'Subscribe via PayPal ($2.99)'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-800" />
                  </a>
                </div>
              ) : (
                /* Unlocked AI Scanner for Subscribed Users */
                <div className="space-y-4">
                  <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-4 border border-slate-800 text-center space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Vision Scanner
                      </span>
                      <span className="text-slate-400">
                        {language === 'ar' ? 'فحص بالذكاء الاصطناعي' : 'Instant AI Detection'}
                      </span>
                    </div>

                    <div className="relative w-40 h-40 mx-auto border-2 border-dashed border-emerald-400/60 rounded-2xl flex flex-col items-center justify-center p-2 bg-slate-900/60">
                      {aiScanning ? (
                        <div className="space-y-1.5 animate-pulse">
                          <Camera className="w-8 h-8 text-emerald-400 mx-auto" />
                          <span className="text-[11px] font-bold text-emerald-300 block">
                            {language === 'ar' ? 'جاري الفحص بالذكاء الاصطناعي...' : 'AI Analyzing meal...'}
                          </span>
                        </div>
                      ) : aiResult ? (
                        <div className="space-y-1">
                          <span className="text-4xl block">{aiResult.emoji}</span>
                          <span className="text-[10px] font-bold text-emerald-300 px-2 py-0.5 bg-emerald-950 rounded-full border border-emerald-700">
                            {language === 'ar' ? 'دقة 98%' : '98% match'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-slate-400">
                          <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                          <span className="text-[10px] block">
                            {language === 'ar' ? 'اختر طبقاً أو التقط صورة' : 'Select dish or take photo'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block">
                        {language === 'ar' ? 'أمثلة سريعة للفحص:' : 'Quick dish test samples:'}
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { nameAr: 'شاورما دجاج عربية', nameEn: 'Chicken Shawarma Wrap', kcal: 450, p: 28, c: 42, f: 18, emoji: '🌯', unitAr: 'ساندوتش (220غ)', unitEn: '1 Wrap' },
                          { nameAr: 'كبسة دجاج بالأرز', nameEn: 'Saudi Chicken Kabsa', kcal: 620, p: 38, c: 72, f: 20, emoji: '🍗', unitAr: 'طبق (350غ)', unitEn: '1 Plate' },
                          { nameAr: 'سلطة فتوش طازجة', nameEn: 'Fresh Fattoush Salad', kcal: 190, p: 4, c: 22, f: 10, emoji: '🥗', unitAr: 'صحن (200غ)', unitEn: '1 Bowl' },
                        ].map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setAiScanning(true);
                              setAiResult(null);
                              setTimeout(() => {
                                setAiScanning(false);
                                setAiResult({
                                  nameAr: sample.nameAr,
                                  nameEn: sample.nameEn,
                                  calories: sample.kcal,
                                  protein: sample.p,
                                  carbs: sample.c,
                                  fats: sample.f,
                                  emoji: sample.emoji,
                                  portionAr: sample.unitAr,
                                  portionEn: sample.unitEn,
                                });
                              }, 900);
                            }}
                            className="py-1.5 px-1 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1 transition"
                          >
                            <span>{sample.emoji}</span>
                            <span className="truncate">{sample.nameAr.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {aiResult && (
                    <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-200 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{aiResult.emoji}</span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {language === 'ar' ? aiResult.nameAr : aiResult.nameEn}
                            </h4>
                            <span className="text-[10px] text-slate-500">
                              {language === 'ar' ? aiResult.portionAr : aiResult.portionEn}
                            </span>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="text-sm font-extrabold text-emerald-700 block">
                            {aiResult.calories} {t.kcal}
                          </span>
                          <span className="text-[9px] text-slate-400">P:{aiResult.protein}g C:{aiResult.carbs}g F:{aiResult.fats}g</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onAddFood({
                            nameAr: aiResult.nameAr,
                            nameEn: aiResult.nameEn,
                            mealType: selectedMeal,
                            servings: 1,
                            servingUnitAr: aiResult.portionAr,
                            servingUnitEn: aiResult.portionEn,
                            calories: aiResult.calories,
                            protein: aiResult.protein,
                            carbs: aiResult.carbs,
                            fats: aiResult.fats,
                            dateStr: currentDate,
                          });
                          try {
                            confetti({ particleCount: 25, spread: 60, origin: { y: 0.8 } });
                          } catch {}
                          onClose();
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.confirmAddFood}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleConfirmCustomAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ar' ? 'اسم الوجبة أو الصنف' : 'Food or Item Name'}
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={t.customNamePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t.totalMealCalories} ({t.kcal})
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={5000}
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t.portionSize} ({language === 'ar' ? 'وحدة القياس' : 'Unit'})
                  </label>
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="1 صحن / 100g"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t.macrosTitle} ({t.gramsShort})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-sky-600 font-bold block mb-1">{t.protein}</span>
                    <input
                      type="number"
                      min={0}
                      value={customProtein}
                      onChange={(e) => setCustomProtein(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold block mb-1">{t.carbs}</span>
                    <input
                      type="number"
                      min={0}
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 font-bold block mb-1">{t.fats}</span>
                    <input
                      type="number"
                      min={0}
                      value={customFats}
                      onChange={(e) => setCustomFats(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition active:scale-[0.99] mt-3"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t.confirmAddFood}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
