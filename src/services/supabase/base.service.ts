import { supabase } from '@/lib/clients/supabase';

export class BaseSupabaseService {
  protected client = supabase;

  protected handle<T>(result: { data: T | null; error: any }) {
    if (result.error) {
      console.error('[Supabase error]', result.error);
      throw result.error;
    }
    return result.data as T;
  }
}