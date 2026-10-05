/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import {
  AuthUser,
  Language,
  LoggedFood,
  MealType,
  Screen,
  UserProfile
} from './types';
import { DEFAULT_PROFILE } from './utils/nutritionCalculator';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardScreen } from './components/DashboardScreen';
import { FoodLogScreen } from './components/FoodLogScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { PremiumScreen } from './components/PremiumScreen';
import { AddFoodModal } from './components/AddFoodModal';
import { WelcomeAuthScreen } from './components/WelcomeAuthScreen';

const STORAGE_KEYS = {
  LANGUAGE: 'caloriesnap_lang',
  PROFILE: 'caloriesnap_profile',
  FOODS: 'caloriesnap_foods',
};

// Initial realistic seed items for the current day
const getInitialSeedFoods = (dateStr: string): LoggedFood[] => [
  {
    id: 'seed-1',
    foodId: 'foul-mudammas',
    nameAr: 'فول مدمس بالكمون وزيت الزيتون',
    nameEn: 'Foul Mudammas with Olive Oil',
    mealType: 'breakfast',
    servings: 1,
    servingUnitAr: 'صحن (200غ)',
    servingUnitEn: 'Bowl (200g)',
    calories: 210,
    protein: 12,
    carbs: 28,
    fats: 7,
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    dateStr,
  },
  {
    id: 'seed-2',
    foodId: 'pita-bread-arabic',
    nameAr: 'خبز عربي أبيض (عيش شامي)',
    nameEn: 'Arabic White Pita Bread',
    mealType: 'breakfast',
    servings: 1,
    servingUnitAr: 'رغيف متوسط (60غ)',
    servingUnitEn: '1 Medium Pita (60g)',
    calories: 165,
    protein: 5,
    carbs: 34,
    fats: 1,
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    dateStr,
  },
  {
    id: 'seed-3',
    foodId: 'arabic-coffee',
    nameAr: 'قهوة عربية أصيلة بالهيل والزعفران',
    nameEn: 'Traditional Arabic Coffee (Gahwa)',
    mealType: 'breakfast',
    servings: 1,
    servingUnitAr: '3 فناجيل (90 مل)',
    servingUnitEn: '3 Finjan Cups (90ml)',
    calories: 5,
    protein: 0,
    carbs: 1,
    fats: 0,
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    dateStr,
  },
  {
    id: 'seed-4',
    foodId: 'shawarma-chicken',
    nameAr: 'شاورما دجاج (ساندوتش عربي)',
    nameEn: 'Chicken Shawarma Wrap',
    mealType: 'lunch',
    servings: 1,
    servingUnitAr: 'ساندوتش (220غ)',
    servingUnitEn: '1 Wrap (220g)',
    calories: 450,
    protein: 28,
    carbs: 42,
    fats: 18,
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    dateStr,
  },
  {
    id: 'seed-5',
    foodId: 'tabbouleh-salad',
    nameAr: 'تبولة لبنانية بالبقدونس والبرغل',
    nameEn: 'Lebanese Tabbouleh Salad',
    mealType: 'lunch',
    servings: 1,
    servingUnitAr: 'صحن متوسط (180غ)',
    servingUnitEn: 'Medium Bowl (180g)',
    calories: 160,
    protein: 3,
    carbs: 14,
    fats: 11,
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    dateStr,
  },
  {
    id: 'seed-6',
    foodId: 'medjool-dates',
    nameAr: 'تمر سكري أو مجدول فاخر',
    nameEn: 'Medjool Dates',
    mealType: 'snack',
    servings: 1,
    servingUnitAr: 'حبتان كبيرتان (50غ)',
    servingUnitEn: '2 Large Dates (50g)',
    calories: 135,
    protein: 1,
    carbs: 36,
    fats: 0,
    timestamp: Date.now() - 1000 * 60 * 30,
    dateStr,
  },
];

export default function App() {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // 0. User Authentication State (Google / Email / Guest)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('caloriesnap_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Controls showing Welcome/Auth screen on initial visit or when clicked
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    const saved = localStorage.getItem('caloriesnap_auth_user');
    const skipped = sessionStorage.getItem('caloriesnap_skip_auth') === 'true';
    return !saved && !skipped;
  });

  const [loginToast, setLoginToast] = useState<string | null>(null);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('caloriesnap_auth_user', JSON.stringify(user));
    } catch {}
    setShowWelcome(false);
    setCurrentScreen('dashboard');
    setLoginToast(
      user.provider === 'google'
        ? language === 'ar'
          ? '🎉 مرحباً بك! تم تسجيل الدخول بنجاح باستخدام Google'
          : '🎉 Welcome! Successfully signed in with Google'
        : language === 'ar'
        ? `مرحباً بك يا ${user.name}! تم تسجيل الدخول بنجاح`
        : `Welcome ${user.name}! Successfully signed in`
    );
    setTimeout(() => setLoginToast(null), 4000);
  };

  const handleSkipAuth = () => {
    sessionStorage.setItem('caloriesnap_skip_auth', 'true');
    setShowWelcome(false);
    setCurrentScreen('dashboard');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('caloriesnap_auth_user');
    } catch {}
    sessionStorage.removeItem('caloriesnap_skip_auth');
    setShowWelcome(true);
  };

  // 1. Language State (default Arabic 'ar' with instant 'en' toggle)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  // 2. Active Screen State
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  // 3. User Profile State (TDEE and Macro Targets)
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PROFILE;
  });

  // 4. Current Selected Date
  const [currentDate, setCurrentDate] = useState<string>(getTodayStr);

  // 5. Logged Foods State
  const [allLoggedFoods, setAllLoggedFoods] = useState<LoggedFood[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOODS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return getInitialSeedFoods(getTodayStr());
  });

  // 6. Add Food Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDefaultMeal, setModalDefaultMeal] = useState<MealType>('breakfast');

  // 7. Pro Membership State (Strictly locked by default - requires PayPal payment)
  const [isPro, setIsPro] = useState<boolean>(() => {
    try {
      // Clear legacy test flag so app is strictly locked behind paywall by default
      if (localStorage.getItem('caloriesnap_is_pro') === 'true' && !localStorage.getItem('caloriesnap_paypal_active')) {
        localStorage.removeItem('caloriesnap_is_pro');
      }
      return localStorage.getItem('caloriesnap_paypal_active') === 'true';
    } catch {
      return false;
    }
  });

  const handleTogglePro = (status: boolean) => {
    setIsPro(status);
    try {
      if (status) {
        localStorage.setItem('caloriesnap_paypal_active', 'true');
      } else {
        localStorage.removeItem('caloriesnap_paypal_active');
        localStorage.removeItem('caloriesnap_is_pro');
      }
    } catch {}
  };

  // Detect PayPal payment return parameters (e.g. ?paid=true, status=COMPLETED, etc.)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isPaid =
        urlParams.get('paid') === 'true' ||
        urlParams.get('payment') === 'success' ||
        urlParams.get('status') === 'COMPLETED' ||
        urlParams.has('tx') ||
        urlParams.has('PayerID');

      if (isPaid) {
        setIsPro(true);
        localStorage.setItem('caloriesnap_paypal_active', 'true');
        setCurrentScreen('premium');
      }
    } catch {}
  }, []);

  // Update HTML document direction and lang when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  // Persist Profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Persist Logged Foods to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(allLoggedFoods));
    } catch {}
  }, [allLoggedFoods]);

  // Foods for currently selected date
  const foodsForCurrentDate = allLoggedFoods.filter((f) => f.dateStr === currentDate);

  // Handlers
  const handleDateChange = (deltaDays: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + deltaDays);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleAddFood = (foodData: Omit<LoggedFood, 'id' | 'timestamp'>) => {
    const newEntry: LoggedFood = {
      ...foodData,
      id: `food-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    setAllLoggedFoods((prev) => [newEntry, ...prev]);
  };

  const handleDeleteFood = (id: string) => {
    setAllLoggedFoods((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const handleOpenAddModal = (mealType: MealType = 'breakfast') => {
    setModalDefaultMeal(mealType);
    setIsAddModalOpen(true);
  };

  // If Welcome/Auth is active, display the Welcome screen
  if (showWelcome) {
    return (
      <WelcomeAuthScreen
        language={language}
        onLanguageChange={setLanguage}
        onLoginSuccess={handleLoginSuccess}
        onSkipAsGuest={handleSkipAuth}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Login Welcome Toast */}
      {loginToast && (
        <div className="fixed top-16 inset-x-4 max-w-sm mx-auto z-50 p-3.5 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn border border-emerald-400">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{loginToast}</span>
        </div>
      )}

      {/* Sticky Top Header with AR/EN Language Toggle Switch & PWA Install */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        currentScreen={currentScreen}
        onNavigateToPremium={() => setCurrentScreen('premium')}
        currentUser={currentUser}
        onOpenAuth={() => setShowWelcome(true)}
      />

      {/* Main Content Area (Render Screen based on Bottom Navigation) */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            language={language}
            targets={profile.targets}
            loggedFoods={foodsForCurrentDate}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onNavigate={setCurrentScreen}
            onOpenAddFoodModal={handleOpenAddModal}
          />
        )}

        {currentScreen === 'foodLog' && (
          <FoodLogScreen
            language={language}
            loggedFoods={foodsForCurrentDate}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onOpenAddModal={handleOpenAddModal}
            onDeleteFood={handleDeleteFood}
          />
        )}

        {currentScreen === 'premium' && (
          <PremiumScreen
            language={language}
            currentDate={currentDate}
            onAddFood={handleAddFood}
            profile={profile}
            loggedFoods={foodsForCurrentDate}
            isPro={isPro}
            onTogglePro={handleTogglePro}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            language={language}
            profile={profile}
            onSaveProfile={handleSaveProfile}
            currentUser={currentUser}
            onOpenAuth={() => setShowWelcome(true)}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Global Add Food Modal (Database Search + Custom Food + Locked AI Scanner) */}
      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultMealType={modalDefaultMeal}
        language={language}
        currentDate={currentDate}
        onAddFood={handleAddFood}
        isPro={isPro}
      />

      {/* Activated Bottom Navigation Bar */}
      <BottomNavBar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        language={language}
        foodCount={foodsForCurrentDate.length}
      />
    </div>
  );
}
