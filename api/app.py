"""MAD Protocol's own API: FastAPI on 127.0.0.1:8340 behind nginx, for pixeldodge.com. kitapi (the kit's Python half) gives it the
base routes, /api/v1/health, /api/v1/about (app.yaml and the build answering) and /api/v1/whoami, and who is signed
in: member() and require_member() as a route's dependency. This app's own routes go under /api/v1/ (nginx keeps the
path; the kit's account service answers sign-in, the account, Your files and push instead).
Run by deploy/pixeldodge-api.service; by hand: uv run --directory api uvicorn app:app --host 127.0.0.1 --port 8340
"""
from pathlib import Path

from kitapi import create_app

app = create_app(Path(__file__).parent)
