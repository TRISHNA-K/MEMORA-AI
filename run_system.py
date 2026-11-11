"""
MEMORA AI - Master System Launcher
Starts both the FastAPI Backend and Next.js Frontend concurrently.
"""

import subprocess
import sys
import os
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def main():
    print("=" * 70)
    print("  MEMORA AI — Human-Centered Cognitive Architecture")
    print("  Microsoft Research Flagship Project Launcher")
    print("=" * 70)
    
    backend_dir = os.path.join(BASE_DIR, "backend")
    frontend_dir = os.path.join(BASE_DIR, "frontend")
    
    # 1. Start Backend
    print("[1/2] Starting MEMORA FastAPI Backend (http://localhost:8000)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=backend_dir
    )
    
    # Wait for backend initialization
    time.sleep(2)
    
    # 2. Start Frontend
    print("[2/2] Starting MEMORA Next.js Frontend (http://localhost:3000)...")
    frontend_cmd = "npm run dev"
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_dir,
        shell=True
    )
    
    print("\n" + "=" * 70)
    print("  SYSTEM READY!")
    print("  • Frontend Web Interface:  http://localhost:3000")
    print("  • Backend REST API & Docs: http://localhost:8000/docs")
    print("  • Interactive Graph View:  http://localhost:3000 (Knowledge Graph tab)")
    print("  • Research Dashboard:      http://localhost:3000 (Research Dashboard tab)")
    print("  Press Ctrl+C to terminate both servers.")
    print("=" * 70 + "\n")
    
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping MEMORA AI servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Servers stopped cleanly.")

if __name__ == "__main__":
    main()
