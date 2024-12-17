# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first to leverage Docker cache
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application
COPY backend/ .

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
ENV GUNICORN_CMD_ARGS="--workers=1 --threads=1 --timeout=120 --log-level=debug --error-logfile=- --access-logfile=- --capture-output"

# Expose port
EXPOSE 8000

# Create start script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Python version: $(python --version)"\n\
echo "Checking database connection..."\n\
python wait-for-db.py\n\
\n\
echo "Starting Gunicorn..."\n\
exec gunicorn --bind 0.0.0.0:8000 "app:create_app()"\n\
' > ./start.sh && chmod +x ./start.sh

# Start the application
CMD ["./start.sh"] 