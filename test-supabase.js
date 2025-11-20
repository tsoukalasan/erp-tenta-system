import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yohoaxaxjhyyuuyljcia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaG9heGF4amh5eXV1eWxqY2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjMxODQsImV4cCI6MjA3ODUzOTE4NH0.IELUT7U-9JrXK9V2tnppPoiD347IzLxjmgE4P0nL38w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing Supabase connection...\n');

// Test Κατηγορίες
const testCategories = async () => {
  console.log('📁 Fetching Κατηγορίες...');
  const { data, error } = await supabase
    .from('Κατηγορίες')
    .select('*');
  
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Κατηγορίες found:', data.length);
    console.log(data);
  }
  console.log('');
};

// Test Προϊόντα
const testProducts = async () => {
  console.log('📦 Fetching Προϊόντα...');
  const { data, error } = await supabase
    .from('Προιόντα')
    .select('*');
  
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Προϊόντα found:', data.length);
    console.log(data);
  }
  console.log('');
};

// Run tests
(async () => {
  await testCategories();
  await testProducts();
})();
