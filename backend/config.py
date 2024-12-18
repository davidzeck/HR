import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    
    # Construct MySQL URL from Railway environment variables
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    if not SQLALCHEMY_DATABASE_URI:
        # Construct from Railway MySQL variables
        db_params = {
            'host': os.environ.get('MYSQLHOST'),
            'port': os.environ.get('MYSQLPORT', '3306'),
            'database': os.environ.get('MYSQL_DATABASE'),
            'user': os.environ.get('MYSQLUSER'),
            'password': os.environ.get('MYSQLPASSWORD')
        }
        if all(db_params.values()):
            SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{db_params['user']}:{db_params['password']}@{db_params['host']}:{db_params['port']}/{db_params['database']}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'ssl': {'ssl_ca': '/etc/ssl/certs/ca-certificates.crt'} if os.environ.get('MYSQL_ATTR_SSL_CA') else None
    }
    
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True

# Set configuration based on environment
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}