import json
import os

# Load .env variables
env_vars = {}
with open('.env', 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            key, val = line.strip().split('=', 1)
            env_vars[key] = val

# Load service account JSON
with open('service_account.json', 'r') as f:
    sa_json = f.read()

# Update GOOGLE_SHEETS_CREDENTIALS to be the JSON string
env_vars['GOOGLE_SHEETS_CREDENTIALS'] = sa_json

# Construct the --set-env-vars string
env_list = []
for k, v in env_vars.items():
    # Escape commas if any in the value (though unlikely in these keys)
    # but more importantly, handle the JSON string carefully
    if k == 'GOOGLE_SHEETS_CREDENTIALS':
        # Just use the raw string, we'll handle quoting in the shell command
        pass
    env_list.append(f"{k}={v}")

env_str = ",".join(env_list)

# Generate the gcloud command
project_id = "vertical-shore-471312-a5"
gcloud_path = r"C:\Users\ACER\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

command = [
    f'& "{gcloud_path}"',
    "run deploy ustadg-mcp",
    f"--image gcr.io/{project_id}/ustadg-mcp",
    "--platform managed",
    "--region us-central1",
    "--allow-unauthenticated",
    f"--project {project_id}",
    "--timeout=3600",
    f'--set-env-vars "{env_str}"'
]

full_command = " ".join(command)

with open('scratch/deploy_mcp.ps1', 'w') as f:
    f.write(full_command)

print("Generated scratch/deploy_mcp.ps1")
