import { createClient } from '@supabase/supabase-js';

// Em produção na Vercel, as variáveis vêm automaticamente
// Em desenvolvimento local, use .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_KEY:', supabaseKey ? 'definido' : 'indefinido');
  throw new Error('Supabase URL e Key são obrigatórios. Configure as variáveis de ambiente na Vercel');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
