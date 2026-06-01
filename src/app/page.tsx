import { CashExMvp } from "@/components/cashex-mvp";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Home() {
  return <CashExMvp supabaseConfigured={isSupabaseConfigured()} />;
}
