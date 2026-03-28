import json
try:
    with open('errors.json', 'r', encoding='utf-16') as f:
        data = json.load(f)
except Exception:
    with open('errors.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
with open('errors_parsed.txt', 'w', encoding='utf-8') as out:
    for d in data.get('diagnostics', []):
        if d.get('severity') == 'ERROR':
            out.write(f"{d['location']['file']}:{d['location']['range']['start']['line']} - {d['problemMessage']}\n")
