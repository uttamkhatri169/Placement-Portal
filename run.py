import uvicorn
import os
import sys

# SSL Certificate Fix for Windows/Corporate Proxies
# Force fully unverified context
import ssl
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Also patch create_default_context globally just in case
original_create_default_context = ssl.create_default_context
def patched_create_default_context(*args, **kwargs):
    context = original_create_default_context(*args, **kwargs)
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    return context
ssl.create_default_context = patched_create_default_context

if __name__ == "__main__":
    # Ensure app directory is in path
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
