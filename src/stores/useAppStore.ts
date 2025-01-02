import { create } from 'zustand';
import { UserPreferences, Article } from '@/lib/api';

interface AppState {
  // User preferences
  preferences: UserPreferences | null;
  setPreferences: (prefs: UserPreferences) => void;

  // Article viewing state
  currentArticle: Article | null;
  setCurrentArticle: (article: Article | null) => void;

  // Category filters
  activeCategories: string[];
  toggleCategory: (categoryId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User preferences
  preferences: null,
  setPreferences: (prefs) => set({ preferences: prefs }),

  // Article viewing state
  currentArticle: null,
  setCurrentArticle: (article) => set({ currentArticle: article }),

  // Category filters
  activeCategories: [],
  toggleCategory: (categoryId) =>
    set((state) => ({
      activeCategories: state.activeCategories.includes(categoryId)
        ? state.activeCategories.filter((id) => id !== categoryId)
        : [...state.activeCategories, categoryId],
    })),
}));
