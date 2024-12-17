import os
from datetime import timedelta

# Database URLs
LOCAL_DB_URL = 'mysql+pymysql://root:password@localhost/LeaveManagement'
RAILWAY_DB_URL = "mysql://root:BQvpsuZkVMDPPCdtpcwvSLjojltMHFxn@mysql.railway.internal:3306/railway"
SQLALCHEMY_DATABASE_URL = RAILWAY_DB_URL.replace('mysql://', 'mysql+pymysql://')

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    # Use local database by default, override with environment variable
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or LOCAL_DB_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URL
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = LOCAL_DB_URL

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = LOCAL_DB_URL

# Set configuration based on environment
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}