export interface Article {
  id: string;
  title: string;
  summary: string;
  original_url: string;
  image_url: string | null;
  category_id: string;
  published_at: string;
  source: string;
  category?: Category;
  saves_count?: number;
  shares_count?: number;
  trending_score?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface UserPreferences {
  notification_settings: {
    email: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'realtime';
  };
  categories: string[];
}
