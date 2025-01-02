import { supabase } from "@/integrations/supabase/client";
import type { Category } from "./types";

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Category[];
};
