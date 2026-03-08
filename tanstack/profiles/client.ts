import { supabase } from "@/lib/supabase";

export const getFollow = async (user_id: string, target_user_id: string) => {
  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("user_id", user_id)
    .eq("target_user_id", target_user_id)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const insertFollow = async (user_id: string, target_user_id: string) => {
  const { error } = await supabase
    .from("follows")
    .insert({ user_id, target_user_id });

  if (error) throw error;

  return { user_id, target_user_id };
};

export const deleteFollow = async (user_id: string, target_user_id: string) => {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("user_id", user_id)
    .eq("target_user_id", target_user_id);

  if (error) throw error;

  return { user_id, target_user_id };
};
