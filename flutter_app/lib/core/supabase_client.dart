import 'package:supabase_flutter/supabase_flutter.dart';

const supabaseUrl = 'https://wsgbfdwxaglphqwwjhii.supabase.co';
const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZ2JmZHd4YWdscGhxd3dqaGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDAxMDMsImV4cCI6MjA4Mzg3NjEwM30.-JbLEmXPH9Z5MEdwfzLRa6B9QAce6_maRUXMhrh_5F4';

SupabaseClient get supabase => Supabase.instance.client;

Future<void> initSupabase() async {
  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );
}
