#!/usr/bin/env python3
"""
Translation Glossary Generator for Booknor
Analyzes all translation keys used in the codebase and compares against existing translation files.
"""

import json
import os
import re
from collections import defaultdict
from pathlib import Path

# Paths
SRC_DIR = "/Users/ibrahimrahmani/Documents/xaheen/booknor/src"
LOCALES_DIR = "/Users/ibrahimrahmani/Documents/xaheen/booknor/public/locales"
OUTPUT_DIR = "/Users/ibrahimrahmani/Documents/xaheen/booknor"

# Translation key pattern: t('namespace:key.path') or t("namespace:key.path")
KEY_PATTERN = r't\(["\']([a-zA-Z_][^"\']*:[^"\']*?)["\']\)'
# Keys without namespace: t('key.path')
NO_NS_PATTERN = r't\(["\']([a-zA-Z_][^:"\'][^"\']*)["\']\)'

def extract_keys_from_file(file_path):
    """Extract all translation keys from a TypeScript/TSX file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find keys with namespace
        keys_with_ns = re.findall(KEY_PATTERN, content)

        # Find keys without namespace (will be in 'common' by default)
        keys_no_ns = re.findall(NO_NS_PATTERN, content)

        # Filter out false positives from keys_no_ns
        keys_no_ns = [k for k in keys_no_ns if not k.startswith('*') and not k.startswith('@') and len(k) > 1]

        return keys_with_ns, keys_no_ns
    except Exception as e:
        return [], []

def scan_source_files():
    """Scan all source files for translation keys"""
    all_keys_with_ns = []
    all_keys_no_ns = []
    file_key_map = defaultdict(list)

    for root, dirs, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                file_path = os.path.join(root, file)
                keys_with_ns, keys_no_ns = extract_keys_from_file(file_path)

                rel_path = os.path.relpath(file_path, SRC_DIR)

                for key in keys_with_ns:
                    all_keys_with_ns.append(key)
                    file_key_map[key].append(rel_path)

                for key in keys_no_ns:
                    all_keys_no_ns.append(key)
                    file_key_map[f"common:{key}"].append(rel_path)

    return list(set(all_keys_with_ns)), list(set(all_keys_no_ns)), file_key_map

def load_translation_file(namespace, lang='en'):
    """Load a translation JSON file"""
    file_path = os.path.join(LOCALES_DIR, lang, f"{namespace}.json")
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def get_nested_value(obj, key_path):
    """Get a nested value from a dict using dot notation"""
    keys = key_path.split('.')
    value = obj
    for key in keys:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return None
    return value

def check_key_in_translations(namespace, key_path, lang='en'):
    """Check if a translation key exists in the translation file"""
    translations = load_translation_file(namespace, lang)
    if translations is None:
        return False, None

    value = get_nested_value(translations, key_path)
    return value is not None, value

def analyze_translations():
    """Main analysis function"""
    print("Scanning source files for translation keys...")
    keys_with_ns, keys_no_ns, file_key_map = scan_source_files()

    # Organize keys by namespace
    keys_by_namespace = defaultdict(list)

    for key in keys_with_ns:
        if ':' in key:
            namespace, key_path = key.split(':', 1)
            keys_by_namespace[namespace].append(key_path)

    # Add keys without namespace to common
    for key in keys_no_ns:
        keys_by_namespace['common'].append(key)

    # Sort namespaces
    sorted_namespaces = sorted(keys_by_namespace.keys())

    # Check which translation files exist
    en_files = set(f.replace('.json', '') for f in os.listdir(os.path.join(LOCALES_DIR, 'en')) if f.endswith('.json'))
    no_files = set(f.replace('.json', '') for f in os.listdir(os.path.join(LOCALES_DIR, 'no')) if f.endswith('.json'))

    # Analyze each namespace
    results = {
        'namespaces': {},
        'statistics': {
            'total_keys': len(keys_with_ns) + len(keys_no_ns),
            'total_namespaces': len(keys_by_namespace),
            'keys_with_namespace': len(keys_with_ns),
            'keys_without_namespace': len(keys_no_ns),
            'en_files': len(en_files),
            'no_files': len(no_files)
        },
        'missing': {
            'en': defaultdict(list),
            'no': defaultdict(list)
        },
        'file_usage': {}
    }

    for namespace in sorted_namespaces:
        keys = sorted(set(keys_by_namespace[namespace]))

        results['namespaces'][namespace] = {
            'total_keys': len(keys),
            'keys': {},
            'file_exists': {
                'en': namespace in en_files,
                'no': namespace in no_files
            }
        }

        for key_path in keys:
            full_key = f"{namespace}:{key_path}"

            # Check in English
            en_exists, en_value = check_key_in_translations(namespace, key_path, 'en')

            # Check in Norwegian
            no_exists, no_value = check_key_in_translations(namespace, key_path, 'no')

            results['namespaces'][namespace]['keys'][key_path] = {
                'en': {
                    'exists': en_exists,
                    'value': en_value
                },
                'no': {
                    'exists': no_exists,
                    'value': no_value
                },
                'used_in': file_key_map.get(full_key, [])
            }

            # Track missing
            if not en_exists:
                results['missing']['en'][namespace].append(key_path)
            if not no_exists:
                results['missing']['no'][namespace].append(key_path)

    return results

def generate_glossary_md(results):
    """Generate the translation glossary markdown document"""
    lines = []
    lines.append("# Booknor Translation Glossary")
    lines.append("")
    lines.append("*Generated automatically by translation analysis tool*")
    lines.append("")
    lines.append("## Summary Statistics")
    lines.append("")
    stats = results['statistics']
    lines.append(f"- **Total Translation Keys**: {stats['total_keys']}")
    lines.append(f"- **Total Namespaces**: {stats['total_namespaces']}")
    lines.append(f"- **Keys with Namespace**: {stats['keys_with_namespace']}")
    lines.append(f"- **Keys without Namespace** (default to common): {stats['keys_without_namespace']}")
    lines.append(f"- **English Translation Files**: {stats['en_files']}")
    lines.append(f"- **Norwegian Translation Files**: {stats['no_files']}")
    lines.append("")

    # Missing keys summary
    total_missing_en = sum(len(keys) for keys in results['missing']['en'].values())
    total_missing_no = sum(len(keys) for keys in results['missing']['no'].values())

    lines.append("## Missing Translations Summary")
    lines.append("")
    lines.append(f"- **Missing English Keys**: {total_missing_en}")
    lines.append(f"- **Missing Norwegian Keys**: {total_missing_no}")
    lines.append("")

    # Coverage percentage
    if stats['total_keys'] > 0:
        en_coverage = ((stats['total_keys'] - total_missing_en) / stats['total_keys']) * 100
        no_coverage = ((stats['total_keys'] - total_missing_no) / stats['total_keys']) * 100
        lines.append(f"- **English Coverage**: {en_coverage:.1f}%")
        lines.append(f"- **Norwegian Coverage**: {no_coverage:.1f}%")
        lines.append("")

    # Namespaces overview
    lines.append("## Namespaces Overview")
    lines.append("")
    lines.append("| Namespace | Total Keys | EN File | NO File | Missing EN | Missing NO |")
    lines.append("|-----------|------------|---------|---------|------------|------------|")

    for namespace in sorted(results['namespaces'].keys()):
        ns_data = results['namespaces'][namespace]
        total = ns_data['total_keys']
        en_file = "✅" if ns_data['file_exists']['en'] else "❌"
        no_file = "✅" if ns_data['file_exists']['no'] else "❌"
        missing_en = len(results['missing']['en'].get(namespace, []))
        missing_no = len(results['missing']['no'].get(namespace, []))
        lines.append(f"| `{namespace}` | {total} | {en_file} | {no_file} | {missing_en} | {missing_no} |")

    lines.append("")

    # Detailed breakdown by namespace
    lines.append("## Detailed Translation Keys by Namespace")
    lines.append("")

    for namespace in sorted(results['namespaces'].keys()):
        ns_data = results['namespaces'][namespace]
        lines.append(f"### Namespace: `{namespace}`")
        lines.append("")
        lines.append(f"**Total Keys**: {ns_data['total_keys']}")
        lines.append("")

        # Keys table
        lines.append("| Key | EN Status | EN Value | NO Status | NO Value | Used In |")
        lines.append("|-----|-----------|----------|-----------|----------|---------|")

        for key_path in sorted(ns_data['keys'].keys()):
            key_data = ns_data['keys'][key_path]

            en_status = "✅" if key_data['en']['exists'] else "❌"
            no_status = "✅" if key_data['no']['exists'] else "❌"

            en_value = str(key_data['en']['value'])[:50] if key_data['en']['value'] else "*(missing)*"
            no_value = str(key_data['no']['value'])[:50] if key_data['no']['value'] else "*(missing)*"

            # Escape pipes in values
            en_value = en_value.replace("|", "\\|")
            no_value = no_value.replace("|", "\\|")

            used_in = ', '.join(key_data['used_in'][:2])
            if len(key_data['used_in']) > 2:
                used_in += f" +{len(key_data['used_in']) - 2} more"

            lines.append(f"| `{key_path}` | {en_status} | {en_value} | {no_status} | {no_value} | {used_in} |")

        lines.append("")

    # Missing keys section
    lines.append("## Missing Keys Details")
    lines.append("")

    for lang in ['en', 'no']:
        lang_name = "English" if lang == 'en' else "Norwegian"
        lines.append(f"### Missing {lang_name} Translations")
        lines.append("")

        if not results['missing'][lang]:
            lines.append(f"✅ All {lang_name} translations are complete!")
            lines.append("")
        else:
            for namespace in sorted(results['missing'][lang].keys()):
                missing_keys = results['missing'][lang][namespace]
                if missing_keys:
                    lines.append(f"#### `{namespace}` namespace")
                    lines.append("")
                    for key in sorted(missing_keys):
                        lines.append(f"- `{namespace}:{key}`")
                    lines.append("")

    return '\n'.join(lines)

def generate_missing_json(results):
    """Generate JSON file with missing translations"""
    missing_structure = {
        'en': {},
        'no': {}
    }

    for lang in ['en', 'no']:
        for namespace, keys in results['missing'][lang].items():
            if keys:
                missing_structure[lang][namespace] = {}
                for key in keys:
                    # Create nested structure
                    parts = key.split('.')
                    current = missing_structure[lang][namespace]
                    for i, part in enumerate(parts):
                        if i == len(parts) - 1:
                            current[part] = f"[TODO: Translate {key}]"
                        else:
                            if part not in current:
                                current[part] = {}
                            elif not isinstance(current[part], dict):
                                # If the key already exists as a string, skip nested creation
                                break
                            current = current[part]

    return json.dumps(missing_structure, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    print("Starting translation analysis...")
    print("=" * 60)

    results = analyze_translations()

    print("\n✅ Analysis complete!")
    print("\n📊 Statistics:")
    print(f"   - Total keys found: {results['statistics']['total_keys']}")
    print(f"   - Namespaces: {results['statistics']['total_namespaces']}")
    print(f"   - Missing English: {sum(len(keys) for keys in results['missing']['en'].values())}")
    print(f"   - Missing Norwegian: {sum(len(keys) for keys in results['missing']['no'].values())}")

    print("\n📝 Generating glossary...")
    glossary_md = generate_glossary_md(results)
    glossary_path = os.path.join(OUTPUT_DIR, "TRANSLATION_GLOSSARY.md")
    with open(glossary_path, 'w', encoding='utf-8') as f:
        f.write(glossary_md)
    print(f"   ✅ Glossary saved to: {glossary_path}")

    print("\n📝 Generating missing translations JSON...")
    missing_json = generate_missing_json(results)
    missing_path = os.path.join(OUTPUT_DIR, "MISSING_TRANSLATIONS.json")
    with open(missing_path, 'w', encoding='utf-8') as f:
        f.write(missing_json)
    print(f"   ✅ Missing translations saved to: {missing_path}")

    print("\n✅ All done!")
    print("=" * 60)
