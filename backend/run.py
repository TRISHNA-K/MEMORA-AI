import uvicorn
import os
import sys

# Ensure backend folder is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    reload_env = os.getenv("RELOAD", "false").lower() in ("true", "1")
    
    print(f"Starting MEMORA AI Backend on http://127.0.0.1:{port} (reload={reload_env})")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=reload_env,
        reload_dirs=["app"] if reload_env else None,
        reload_excludes=["*.db", "*.db-*", "*.sqlite", "data/*", "__pycache__/*"] if reload_env else None,
        log_level="info"
    )
