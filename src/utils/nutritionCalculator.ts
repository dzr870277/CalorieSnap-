import { ActivityLevel, Gender, Goal, MacroTargets, UserProfile } from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

export function calculateBMR(weightKg: number, heightCm: number, ageYears: number, gender: Gender): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161);
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

export function calculateTargets(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goal: Goal
): { bmr: number; tdee: number; targets: MacroTargets } {
  const bmr = calculateBMR(weightKg, heightCm, ageYears, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  let targetCalories = tdee;
  if (goal === 'lose') {
    targetCalories = Math.max(1200, tdee - 500); // safe minimum 1200 kcal
  } else if (goal === 'build') {
    targetCalories = tdee + 350;
  }

  // Protein calculation based on body weight & goal
  let proteinPerKg = 1.6;
  if (goal === 'lose') proteinPerKg = 1.9; // preserve lean mass in caloric deficit
  if (goal === 'build') proteinPerKg = 2.1; // hypertrophy support

  let targetProtein = Math.round(weightKg * proteinPerKg);
  // Ensure protein doesn't exceed 40% of calories
  if (targetProtein * 4 > targetCalories * 0.4) {
    targetProtein = Math.round((targetCalories * 0.35) / 4);
  }

  // Fat calculation (~25% of total calories, 9 kcal/g)
  const fatCalories = targetCalories * 0.25;
  const targetFats = Math.round(fatCalories / 9);

  // Carbs from remaining calories (4 kcal/g)
  const remainingCaloriesForCarbs = Math.max(0, targetCalories - (targetProtein * 4) - (targetFats * 9));
  const targetCarbs = Math.round(remainingCaloriesForCarbs / 4);

  return {
    bmr,
    tdee,
    targets: {
      calories: Math.round(targetCalories),
      protein: targetProtein,
      carbs: targetCarbs,
      fats: targetFats,
    },
  };
}

export const DEFAULT_PROFILE: UserProfile = {
  age: 27,
  gender: 'male',
  weight: 78,
  height: 177,
  activityLevel: 'moderate',
  goal: 'lose',
  bmr: 1740,
  tdee: 2697,
  targets: {
    calories: 2197,
    protein: 148,
    carbs: 235,
    fats: 61,
  },
};
