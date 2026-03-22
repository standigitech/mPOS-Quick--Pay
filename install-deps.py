#!/usr/bin/env python3
import subprocess
import os
import sys

client_dir = '/workspaces/mPOS-Quick--Pay/mpos-client'

print(f"Installing dependencies in {client_dir}...")

try:
    os.chdir(client_dir)
    result = subprocess.run(['npm', 'install'], capture_output=True, text=True, timeout=300)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    
    if result.returncode == 0:
        print("\n✓ Dependencies installed successfully!")
        sys.exit(0)
    else:
        print(f"\n✗ Installation failed with code {result.returncode}")
        sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
