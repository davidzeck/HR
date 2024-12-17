from app import create_app, db
from app.models.user import User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    app = create_app()
    
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            logger.info("Database tables created successfully")
            
            # Check if admin user exists
            admin = User.query.filter_by(email='admin@example.com').first()
            if not admin:
                # Create admin user
                admin = User(
                    username='admin',
                    email='admin@example.com',
                    role='admin'
                )
                admin.set_password('admin123')
                db.session.add(admin)
                db.session.commit()
                logger.info("Admin user created successfully")
            
            # Verify database setup
            users = User.query.all()
            logger.info(f"Total users in database: {len(users)}")
            
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise

if __name__ == "__main__":
    init_database() 