from app import create_app, db
from app.models.user import User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = create_app()

def create_admin_user():
    with app.app_context():
        try:
            # Drop all tables and recreate them
            logger.info("Dropping all tables...")
            db.drop_all()
            logger.info("Creating all tables...")
            db.create_all()
            
            # Create admin user
            admin = User(
                name='Admin User',
                email='admin@example.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            
            # Create test employee
            employee = User(
                name='Test Employee',
                email='employee@example.com',
                role='employee'
            )
            employee.set_password('employee123')
            db.session.add(employee)
            
            db.session.commit()
            logger.info("Users created successfully")
            
            # Verify the users were created
            admin_check = User.query.filter_by(email='admin@example.com').first()
            if admin_check:
                logger.info(f"Admin user verified - ID: {admin_check.id}, Role: {admin_check.role}")
                # Test password
                if admin_check.check_password('admin123'):
                    logger.info("Admin password verification successful")
                else:
                    logger.error("Admin password verification failed")
            else:
                logger.error("Admin user not found after creation")
            
        except Exception as e:
            logger.error(f"Error creating users: {str(e)}")
            db.session.rollback()
            raise

def verify_database():
    with app.app_context():
        logger.info("\nVerifying database contents:")
        users = User.query.all()
        logger.info(f"Total users in database: {len(users)}")
        for user in users:
            logger.info(f"User: {user.name}, Email: {user.email}, Role: {user.role}")
            # Test password
            if user.check_password('admin123' if user.role == 'admin' else 'employee123'):
                logger.info(f"Password verification successful for {user.email}")
            else:
                logger.error(f"Password verification failed for {user.email}")

if __name__ == "__main__":
    create_admin_user()
    verify_database() 