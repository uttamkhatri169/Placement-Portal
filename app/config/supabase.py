import httpx
import ssl
from supabase import create_client, ClientOptions
from app.config.settings import settings

print("⚠️ APPLYING SSL BYPASS PATCH ⚠️")

# 1. Patch SSL Context Generation globally
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# 2. Patch HTTPX Client (Sync)
_original_init = httpx.Client.__init__
def _patched_init(self, *args, **kwargs):
    kwargs["verify"] = False
    # ⚠️ CRITICAL: Limit connections to avoid "Too many open files" on Windows
    if "limits" not in kwargs:
        kwargs["limits"] = httpx.Limits(max_keepalive_connections=5, max_connections=10)
    _original_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_init

# 3. Patch HTTPX AsyncClient (Async) - purely defensive
_original_async_init = httpx.AsyncClient.__init__
def _patched_async_init(self, *args, **kwargs):
    kwargs["verify"] = False
    _original_async_init(self, *args, **kwargs)
httpx.AsyncClient.__init__ = _patched_async_init

# 🔐 BACKEND CLIENT (FULL ACCESS)
try:
    supabase_admin = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_KEY
    )
except Exception as e:
    print(f"Supabase Init Error: {e}")
    # Fallback to prevent crash on import, though app will fail later
    supabase_admin = None

# 🌐 Optional: public client (rarely needed in backend)
try:
    supabase_public = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY
    )
except:
    supabase_public = None
