import time
import logging
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import os
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_db(db_uri, max_retries=30, retry_interval=2):
    """Wait for database to become available."""
    logger.info("Waiting for database to become available...")
    
    for i in range(max_retries):
        try:
            engine = create_engine(db_uri)
            conn = engine.connect()
            conn.execute("SELECT 1")
            conn.close()
            logger.info("Database is available!")
            return True
        except OperationalError as e:
            logger.warning(f"Database not ready (attempt {i + 1}/{max_retries}): {str(e)}")
            if i < max_retries - 1:
                time.sleep(retry_interval)
            continue
        except Exception as e:
            logger.error(f"Unexpected error while checking database: {str(e)}")
            raise

    logger.error("Max retries reached. Database is not available.")
    return False

if __name__ == "__main__":
    db_uri = os.environ.get("SQLALCHEMY_DATABASE_URI")
    if not db_uri:
        logger.error("SQLALCHEMY_DATABASE_URI environment variable is not set")
        sys.exit(1)
        
    if not wait_for_db(db_uri):
        sys.exit(1)
    sys.exit(0) 