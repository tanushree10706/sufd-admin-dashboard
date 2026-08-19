import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

async function runDiagnosis() {
  console.log("--- STARTING RUNTIME DIAGNOSIS ---");
  
  const env = loadEnv('development', process.cwd(), '');
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;

  console.log("1. VITE_SUPABASE_URL evaluates to:", url ? `"${url}"` : "undefined");
  console.log("2. VITE_SUPABASE_ANON_KEY exists:", !!key);

  const isConfigured = Boolean(url && key && url !== 'YOUR_SUPABASE_URL' && key !== 'YOUR_SUPABASE_ANON_KEY');
  console.log("3. isSupabaseConfigured evaluates to:", isConfigured);

  if (!isConfigured) {
    console.log("Stopping diagnosis: Supabase is not configured.");
    return;
  }

  const supabase = createClient(url, key);

  console.log("4. Executing `incidents` query...");
  const incRes = await supabase.from('incidents').select('*');
  console.log("6. Returned incidents error:", incRes.error ? JSON.stringify(incRes.error) : "null");
  console.log("6. Returned incidents row count:", incRes.data ? incRes.data.length : "null");

  console.log("5. Executing `fleet_units` query...");
  const fleetRes = await supabase.from('fleet_units').select('*');
  console.log("6. Returned fleet_units error:", fleetRes.error ? JSON.stringify(fleetRes.error) : "null");
  console.log("6. Returned fleet_units row count:", fleetRes.data ? fleetRes.data.length : "null");

  const stationsRes = await supabase.from('fire_stations').select('*');
  console.log("6. Returned fire_stations error:", stationsRes.error ? JSON.stringify(stationsRes.error) : "null");

  const respRes = await supabase.from('responders').select('*');
  console.log("6. Returned responders error:", respRes.error ? JSON.stringify(respRes.error) : "null");

  console.log("7. RLS check:");
  if (incRes.data && incRes.data.length === 0 && !incRes.error) {
    console.log("   - `incidents` returned 0 rows without error. If data exists, RLS is blocking SELECT.");
  } else if (incRes.data && incRes.data.length > 0) {
    console.log("   - `incidents` returned data. RLS is NOT blocking.");
  }
}

runDiagnosis().catch(console.error);
