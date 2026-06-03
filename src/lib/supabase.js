import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zijbzghopnkhyyknwwrq.supabase.co';
const supabaseKey = 'OVDE_NALEPI_TVOJ_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
