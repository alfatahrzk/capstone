    const SUPABASE_URL =
    "https://zctefsmmtfhkvpdwhslr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Ei7SHtCXCAO0SGeGFdG9IQ_kLUZiaz_";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );