import os
import re

def update_env_code(env_path, new_code):
    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'(INCONTROL_AUTH_CODE=).*', f'\1{new_code}', content)
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"INCONTROL_AUTH_CODE updated to {new_code}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python update_incontrol_code.py <env_path> <new_code>")
        sys.exit(1)
    update_env_code(sys.argv[1], sys.argv[2])
