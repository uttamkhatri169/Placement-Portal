from app.main import app

# This file allows Render to find 'app:app' or 'main:app' more easily
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
