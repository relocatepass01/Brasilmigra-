import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Tu URL exacta de Supabase
const supabaseUrl = 'https://wdhvycncwfydpgeqlvwb.supabase.co';

// Tu clave publicable
const supabaseKey = 'sb_publishable_o4qKEJ1v7VgVpEGq1F2AAg_o7RvIrK5';

// Inicializar la conexión
export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Conexión a Supabase inicializada");
