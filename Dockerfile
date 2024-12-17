# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first to leverage Docker cache
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application
COPY backend/ .

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
ENV GUNICORN_CMD_ARGS="--workers=1 --threads=8 --timeout=0 --log-level=debug --error-logfile=- --access-logfile=- --capture-output"

# Expose port
EXPOSE 8000

# Create start script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Python version: $(python --version)"\n\
echo "Waiting for PostgreSQL..."\n\
until pg_isready -h $DATABASE_URL -t 60; do\n\
    echo "PostgreSQL is unavailable - sleeping"\n\
    sleep 1\n\
done\n\
\n\
echo "PostgreSQL is up - executing command"\n\
\n\
echo "Initializing database..."\n\
python init_db.py\n\
\n\
echo "Starting Gunicorn..."\n\
exec gunicorn --bind 0.0.0.0:8000 "app:create_app()"\n\
' > ./start.sh && chmod +x ./start.sh

# Start the application
CMD ["./start.sh"] 