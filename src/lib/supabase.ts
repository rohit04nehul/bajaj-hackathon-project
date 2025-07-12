import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables
console.log('🔍 Environment Variables Debug:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
console.log('Full URL:', supabaseUrl);
console.log('Key starts with:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'No key');
console.log('All env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

// Create a mock client if environment variables are missing
const createMockClient = (): any => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: new Error('Mock client - no real connection') }),
    upsert: () => Promise.resolve({ data: null, error: new Error('Mock client - no real connection') }),
    order: () => ({
      limit: () => Promise.resolve({ data: [], error: null })
    })
  }),
  rpc: () => Promise.resolve({ data: [], error: new Error('Mock client - no real connection') })
});

// Check if environment variables are properly set
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase environment variables missing:');
  console.warn('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.warn('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  console.warn('Using mock client - no real database connection');
} else {
  console.log('✅ Environment variables found, creating real Supabase client');
}

export const supabase: SupabaseClient = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient();

// Test the connection
export async function testSupabaseConnection() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Environment variables missing for connection test');
    return { connected: false, error: 'Environment variables missing' };
  }

  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key length:', supabaseKey.length);

  try {
    const { data, error } = await supabase
      .from('transcript_chunks')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return { connected: false, error: error.message };
    }

    console.log('✅ Supabase connected successfully');
    return { connected: true, data };
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}