"""核对本次目录迁移的原文件完整性、文档链接和可执行输出路径。"""
from pathlib import Path
import hashlib
import json
import os
import re
import urllib.parse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
ALLOWED = {
    'validation/technical/reader-core/README.md',
    'validation/ui/2026-11-18/report.md',
    'docs/ux/design-spec.md',
    'prototypes/reader-ui/README.md',
    'prototypes/reader-ui/scripts/browser-check.js',
    'prototypes/reader-ui/scripts/browser-initial.js',
    'prototypes/reader-ui/scripts/browser-integrity.js',
    'prototypes/reader-ui/scripts/browser-preview.js',
    'prototypes/reader-ui/scripts/mcp-browser.mjs',
}

inventory = json.loads((HERE / 'inventory-before.json').read_text(encoding='utf-8'))
checks = []
for old in inventory['files']:
    current = ROOT / old['new']
    digest = hashlib.sha256(current.read_bytes()).hexdigest() if current.is_file() else None
    checks.append({
        'old': old['old'], 'new': old['new'], 'original_sha256': old['sha256'],
        'current_sha256': digest, 'present': digest is not None,
        'unchanged': digest == old['sha256'], 'allowed_update': old['new'] in ALLOWED,
    })

broken_links = []
excluded = {'node_modules', 'dist', '.git', '.local', '.artifacts', 'evidence'}
for directory, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in excluded and not d.startswith('test-results')]
    for name in files:
        if not name.endswith('.md'):
            continue
        source = Path(directory) / name
        for raw in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)', source.read_text(encoding='utf-8-sig')):
            url = urllib.parse.unquote(raw.split(' "')[0].strip('<>').split('#')[0])
            if not url or re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', url):
                continue
            if not (source.parent / url).exists():
                broken_links.append({'file': source.relative_to(ROOT).as_posix(), 'target': url})

legacy_paths = []
for script in (ROOT / 'prototypes/reader-ui/scripts').glob('*'):
    if script.is_file() and ('D:/Java-learning/Readict/artifacts' in script.read_text(encoding='utf-8')):
        legacy_paths.append(script.relative_to(ROOT).as_posix())

unexpected = [c['new'] for c in checks if not c['present'] or not (c['unchanged'] or c['allowed_update'])]
result = {
    'original_files': len(checks), 'present': sum(c['present'] for c in checks),
    'unchanged': sum(c['unchanged'] for c in checks),
    'intentional_updates': [c['new'] for c in checks if not c['unchanged'] and c['allowed_update']],
    'unexpected_changes_or_missing': unexpected, 'broken_markdown_links': broken_links,
    'legacy_executable_output_paths': legacy_paths,
    'passed': not unexpected and not broken_links and not legacy_paths,
    'files': checks,
}
(HERE / 'verification-final.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in result.items() if k != 'files'}, ensure_ascii=False, indent=2))
raise SystemExit(0 if result['passed'] else 1)
