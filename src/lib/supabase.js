import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zijbzghopnkhyyknwwrq.supabase.co';
const supabaseKey = 'sb_publishable_f1Kuv0fiYLA-WZZ_LJIP3g_2-ViqJZ_';

export const supabase = createClient(supabaseUrl, supabaseKey);
