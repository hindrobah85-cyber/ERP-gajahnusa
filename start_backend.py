# Start FastAPI server
import uvicorn
import sys
import os

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'app'))

if __name__ == "__main__":
    # Import the app from backend main
    from backend.app.main import app
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )
