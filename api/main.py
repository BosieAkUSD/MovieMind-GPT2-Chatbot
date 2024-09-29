import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))  # Ensure to use the PORT environment variable
    uvicorn.run("api:app", host="0.0.0.0", port=port)