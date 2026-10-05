export type Language = 'ar' | 'en';

export type Screen = 'dashboard' | 'foodLog' | 'premium' | 'profile';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

export type Goal = 'lose' | 'maintain' | 'build';

export interface MacroTargets {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fats: number;    // in grams
}

export interface UserProfile {
  age: number;
  gender: Gender;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: ActivityLevel;
  goal: Goal;
  tdee: number;
  bmr: number;
  targets: MacroTargets;
}

export interface FoodItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'traditional' | 'breakfast' | 'meat' | 'bakery' | 'dessert' | 'healthy' | 'drinks';
  calories: number; // kcal per base serving
  protein: number;  // g
  carbs: number;    // g
  fats: number;     // g
  servingSize: number; // e.g., 100 or 1
  servingUnitAr: string;
  servingUnitEn: string;
  emoji: string;
  barcode?: string;
  isPopular?: boolean;
}

export interface LoggedFood {
  id: string;
  foodId?: string;
  nameAr: string;
  nameEn: string;
  mealType: MealType;
  servings: number; // multiplier
  servingUnitAr: string;
  servingUnitEn: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: number; // epoch ms
  dateStr: string;   // YYYY-MM-DD
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  provider: 'google' | 'email' | 'guest';
}
