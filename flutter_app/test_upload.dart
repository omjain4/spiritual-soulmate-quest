import 'dart:io';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() async {
  final url = 'https://wsgbfdwxaglphqwwjhii.supabase.co';
  final anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZ2JmZHd4YWdscGhxd3dqaGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDAxMDMsImV4cCI6MjA4Mzg3NjEwM30.-JbLEmXPH9Z5MEdwfzLRa6B9QAce6_maRUXMhrh_5F4';

  final endpoint = '$url/storage/v1/object/chat-media/test-folder/test.txt';
  
  final request = http.MultipartRequest('POST', Uri.parse(endpoint));
  request.headers.addAll({
    'Authorization': 'Bearer $anonKey',
    'apikey': anonKey,
  });

  request.files.add(http.MultipartFile.fromString(
    'file',
    'Hello World',
    filename: 'test.txt',
  ));

  final response = await request.send();
  final respBody = await response.stream.bytesToString();
  
  print('Status: ${response.statusCode}');
  print('Body: $respBody');
}
