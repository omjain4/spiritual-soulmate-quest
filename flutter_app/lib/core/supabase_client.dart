import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
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

Future<void> uploadFileToSupabase(String bucket, String path, File file) async {
  final endpoint = '$supabaseUrl/storage/v1/object/$bucket/$path';
  final token = supabase.auth.currentSession?.accessToken ?? supabaseAnonKey;
  
  final request = http.MultipartRequest('POST', Uri.parse(endpoint));
  request.headers.addAll({
    'Authorization': 'Bearer $token',
    'apikey': supabaseAnonKey,
  });

  request.files.add(await http.MultipartFile.fromPath(
    'file',
    file.path,
  ));

  final response = await request.send();
  final respBody = await response.stream.bytesToString();

  if (response.statusCode >= 400) {
    throw Exception('Failed to upload via custom HTTP. Status: ${response.statusCode}, Body: $respBody');
  }
}
