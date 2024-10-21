# Use a Python 3.9 base image
FROM python:3.9-slim

# Install system dependencies for OpenCV and other libraries
RUN apt-get update && apt-get install -y \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt ./

# Install CPU-only PyTorch
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app files into the container
COPY . .

# Expose port 8080 for the FastAPI application
EXPOSE 8080

# Command to run the application
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8080", "--log-level", "debug"]