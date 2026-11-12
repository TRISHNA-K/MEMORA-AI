"""
MEMORA AI - Master System Launcher
Starts both the FastAPI Backend and Next.js Frontend concurrently.
"""

import subprocess
import sys
import os
import time
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def wait_for_backend(url="http://127.0.0.1:8000/api/health", max_wait_sec=30):
    start_time = time.time()
    dots = 0
    while time.time() - start_time < max_wait_sec:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "MemoraLauncher/1.0"})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                if resp.status == 200:
                    print(f"\n   [OK] Backend cognitive engine is healthy and listening on port 8000.")
                    return True
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError):
            pass
        dots = (dots + 1) % 4
        sys.stdout.write(f"\r   Waiting for cognitive engine initialization{'.' * dots}{' ' * (3 - dots)}")
        sys.stdout.flush()
        time.sleep(0.5)
    print("\n   [Warning] Backend health check timed out. Proceeding anyway...")
    return False

def main():
    print("=" * 70)
    print("  MEMORA AI — Human-Centered Cognitive Architecture")
    print("  Microsoft Research Flagship Project Launcher")
    print("=" * 70)
    
    backend_dir = os.path.join(BASE_DIR, "backend")
    frontend_dir = os.path.join(BASE_DIR, "frontend")
    
    # 1. Start Backend
    print("[1/2] Starting MEMORA FastAPI Backend (http://127.0.0.1:8000)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=backend_dir
    )
    
    # Active health probe to eliminate race condition
    wait_for_backend()
    
    # 2. Start Frontend
    print("\n[2/2] Starting MEMORA Next.js Frontend (http://localhost:3000)...")
    frontend_cmd = "npm run dev"
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_dir,
        shell=True
    )
    
    print("\n" + "=" * 70)
    print("  SYSTEM READY!")
    print("  • Frontend Web Interface:  http://localhost:3000")
    print("  • Backend REST API & Docs: http://127.0.0.1:8000/docs")
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
