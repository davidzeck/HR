import time
import logging
import pymysql
import os
import sys
from urllib.parse import urlparse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def parse_db_url(url):
    """Parse database URL into components."""
    parsed = urlparse(url.replace('mysql+pymysql://', 'mysql://'))
    return {
        'host': parsed.hostname,
        'port': parsed.port or 3306,
        'user': parsed.username,
        'password': parsed.password,
        'database': parsed.path.lstrip('/')
    }

def wait_for_db(db_uri, max_retries=30, retry_interval=2):
    """Wait for database to become available."""
    logger.info("Starting database connection check...")
    
    if not db_uri:
        logger.error("Database URI is empty or None")
        return False
    
    try:
        db_config = parse_db_url(db_uri)
        logger.info(f"Attempting to connect to MySQL at {db_config['host']}:{db_config['port']}")
    except Exception as e:
        logger.error(f"Failed to parse database URI: {str(e)}")
        return False

    for i in range(max_retries):
        try:
            logger.info(f"Connection attempt {i + 1}/{max_retries}")
            conn = pymysql.connect(
                host=db_config['host'],
                port=db_config['port'],
                user=db_config['user'],
                password=db_config['password'],
                database=db_config['database'],
                connect_timeout=5
            )
            
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                if result and result[0] == 1:
                    logger.info("Successfully connected to database!")
                    conn.close()
                    return True
                else:
                    logger.warning("Connected but SELECT 1 returned unexpected result")
            
            conn.close()
            
        except pymysql.Error as e:
            error_code = e.args[0]
            error_message = e.args[1] if len(e.args) > 1 else str(e)
            logger.warning(f"Database connection failed (attempt {i + 1}/{max_retries})")
            logger.warning(f"Error {error_code}: {error_message}")
            
            if error_code in (2003, 2002):  # Connection refused or can't connect
                logger.info("Database server is not accepting connections yet")
            elif error_code == 1045:  # Access denied
                logger.error("Access denied - check credentials")
                return False
            elif error_code == 1049:  # Unknown database
                logger.error("Database does not exist")
                return False
                
            if i < max_retries - 1:
                time.sleep(retry_interval)
            continue
            
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return False

    logger.error(f"Failed to connect to database after {max_retries} attempts")
    return False

if __name__ == "__main__":
    db_uri = os.environ.get("SQLALCHEMY_DATABASE_URI")
    if not db_uri:
        logger.error("SQLALCHEMY_DATABASE_URI environment variable is not set")
        sys.exit(1)
    
    max_retries = int(os.environ.get("WAIT_FOR_DB_RETRIES", "30"))
    retry_interval = int(os.environ.get("WAIT_FOR_DB_INTERVAL", "2"))
    
    logger.info(f"Starting database wait script with {max_retries} retries, "
               f"{retry_interval}s interval")
    
    if not wait_for_db(db_uri, max_retries, retry_interval):
        sys.exit(1)
    
    logger.info("Database is ready!")
    sys.exit(0) 