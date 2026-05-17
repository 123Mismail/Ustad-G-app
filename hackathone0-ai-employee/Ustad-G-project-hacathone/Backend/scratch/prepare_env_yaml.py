import json
import yaml
import os

# Load .env variables
env_vars = {}
if os.path.exists('.env'):
    with open('.env', 'r') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                key, val = line.split('=', 1)
                env_vars[key] = val

# Load service account JSON
if os.path.exists('service_account.json'):
    with open('service_account.json', 'r') as f:
        sa_json = f.read()
    env_vars['GOOGLE_SHEETS_CREDENTIALS'] = sa_json

# Write to env.yaml
with open('env.yaml', 'w') as f:
    yaml.dump(env_vars, f, default_flow_style=False)

print("Created env.yaml with all secrets and variables.")
