import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://wdhvycncwfydpgeqlvwb.supabase.co';
const supabaseKey = 'sb_publishable_o4qKEJ1v7VgVpEGq1F2AAg_o7RvIrK5';

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Conexión a Supabase inicializada");
