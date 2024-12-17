from app import create_app, db
from app.models.user import User
from app.models.employee import Employee
from app.models.leave import LeaveApplication, LeaveReview
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def recreate_database():
    app = create_app()
    
    with app.app_context():
        try:
            # Drop all existing tables
            logger.info("Dropping all tables...")
            db.drop_all()
            
            # Create all tables with new schema
            logger.info("Creating all tables...")
            db.create_all()
            
            # Create admin user
            admin = User(
                username='admin',
                email='admin@example.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            
            # Create test employee user
            employee = User(
                username='employee',
                email='employee@example.com',
                role='employee'
            )
            employee.set_password('employee123')
            db.session.add(employee)
            db.session.flush()  # This assigns user IDs
            
            # Create employee record
            emp = Employee(
                user_id=employee.user_id,
                first_name='Test',
                last_name='Employee',
                date_of_birth=datetime.strptime('2000-01-01', '%Y-%m-%d').date(),
                department='IT',
                position='Developer',
                date_joined=datetime.strptime('2023-01-01', '%Y-%m-%d').date()
            )
            db.session.add(emp)
            
            # Commit all changes
            db.session.commit()
            
            logger.info("Database recreated successfully!")
            logger.info(f"Admin user created - email: admin@example.com, password: admin123")
            logger.info(f"Employee user created - email: employee@example.com, password: employee123")
            
            # Verify tables were created
            tables = db.engine.table_names()
            logger.info(f"Created tables: {tables}")
            
        except Exception as e:
            logger.error(f"Error recreating database: {str(e)}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    recreate_database() 