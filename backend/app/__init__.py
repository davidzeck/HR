from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import config
import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
)

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    try:
        # Get environment configuration
        env = os.environ.get('FLASK_ENV', 'development')
        logging.info(f"Starting application in {env} mode")
        config_class = config[env]

        app = Flask(__name__)
        app.config.from_object(config_class)

        # Log configuration
        logging.info(f"Database URI: {app.config.get('SQLALCHEMY_DATABASE_URI')}")
        logging.info(f"Debug mode: {app.config.get('DEBUG')}")

        # Initialize extensions
        logging.info("Initializing database...")
        db.init_app(app)
        logging.info("Initializing JWT...")
        jwt.init_app(app)
        
        # Configure CORS for production
        if env == 'production':
            logging.info("Configuring CORS for production...")
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
                logging.error(f"Database health check failed: {str(e)}")
                db_status = f"error: {str(e)}"

            health_data = {
                "status": "healthy",
                "environment": env,
                "python_version": sys.version,
                "database_status": db_status,
                "debug_mode": app.debug,
                "config": {
                    "SQLALCHEMY_DATABASE_URI": app.config.get('SQLALCHEMY_DATABASE_URI', 'not set'),
                    "FLASK_ENV": env,
                    "DEBUG": app.debug
                }
            }
            return jsonify(health_data), 200

        # Register blueprints
        logging.info("Registering blueprints...")
        from app.routes.auth import auth_bp
        from app.routes.leave import leave_bp

        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(leave_bp, url_prefix='/api/leave')

        # Create database tables
        with app.app_context():
            logging.info("Creating database tables...")
            db.create_all()
            logging.info("Database tables created successfully")

        logging.info("Application startup complete")
        return app

    except Exception as e:
        logging.error(f"Error during application startup: {str(e)}")
        raise 