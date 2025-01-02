import { supabase } from "@/integrations/supabase/client";
import type { UserPreferences } from "./types";

export const getUserPreferences = async () => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('notification_settings')
    .maybeSingle();

  if (profileError) throw profileError;

  if (!profile) {
    // Return default preferences if no profile exists
    return {
      notification_settings: {
        email: false,
        push: false,
        frequency: 'daily',
      },
      categories: [],
    } as UserPreferences;
  }

  const { data: categories, error: categoriesError } = await supabase
    .from('user_category_preferences')
    .select('category_id');

  if (categoriesError) throw categoriesError;

  return {
    notification_settings: profile.notification_settings,
    categories: categories?.map(c => c.category_id) || [],
  } as UserPreferences;
};

export const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
  const updates = [];

  if (preferences.notification_settings) {
    updates.push(
      supabase
        .from('profiles')
        .update({ notification_settings: preferences.notification_settings })
        .single()
    );
  }

  if (preferences.categories) {
    // First delete existing preferences
    await supabase.from('user_category_preferences').delete().neq('category_id', '');
    
    // Then insert new ones
    updates.push(
      supabase.from('user_category_preferences').insert(
        preferences.categories.map(categoryId => ({
          category_id: categoryId,
        }))
      )
    );
  }

  await Promise.all(updates);
};
