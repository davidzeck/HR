from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import config
import os
import sys

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    # Get environment configuration
    env = os.environ.get('FLASK_ENV', 'development')
    config_class = config[env]

    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Configure CORS for production
    if env == 'production':
        CORS(app, resources={
            r"/api/*": {
                "origins": ["https://your-frontend-domain.vercel.app"],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"]
            }
        })
    else:
        CORS(app)

    # Add health check endpoint with diagnostics
    @app.route('/api/health')
    def health_check():
        try:
            # Test database connection
            db.session.execute('SELECT 1')
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"

        health_data = {
            "status": "healthy",
            "environment": env,
            "python_version": sys.version,
            "database_status": db_status,
            "debug_mode": app.debug
        }
        return jsonify(health_data), 200

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.leave import leave_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(leave_bp, url_prefix='/api/leave')

    # Create database tables
    with app.app_context():
        db.create_all()

    return app 