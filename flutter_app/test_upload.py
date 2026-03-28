import requests

url = "https://wsgbfdwxaglphqwwjhii.supabase.co"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZ2JmZHd4YWdscGhxd3dqaGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDAxMDMsImV4cCI6MjA4Mzg3NjEwM30.-JbLEmXPH9Z5MEdwfzLRa6B9QAce6_maRUXMhrh_5F4"

headers = {
    "apikey": anon_key,
    "Authorization": f"Bearer {anon_key}",
}

files = {
    'file': ('test.jpg', b'dummy_content', 'image/jpeg')
}

response = requests.post(
    f"{url}/storage/v1/object/chat-media/test_folder/test.jpg", 
    headers=headers,
    files=files
)

print("Status Code:", response.status_code)
print("Response:", response.text)
