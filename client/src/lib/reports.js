import { supabase } from './supabase';

export const MAX_REPORTS = 5;

export async function fetchReports() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveReport({ name, dealData, result }) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  // Enforce 5-report cap on the client before inserting
  const existing = await fetchReports();
  if (existing.length >= MAX_REPORTS) {
    throw new Error(`You've reached the ${MAX_REPORTS}-report limit. Delete one to save a new report.`);
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({ name, deal_data: dealData, result, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReport(id) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('reports').delete().eq('id', id);
  if (error) throw error;
}
