from app import create_app, db
from app.models.user import User
from app.models.employee import Employee
from app.models.leave import LeaveApplication, LeaveReview
import bcrypt

def init_db():
    app = create_app()
    with app.app_context():
        # Drop all tables
        print("Dropping existing tables...")
        db.drop_all()
        
        # Create all tables
        print("Creating new tables...")
        db.create_all()
        
        # Create initial admin user
        print("Creating admin user...")
        admin = User(
            username="admin",
            email="admin@example.com",
            role="admin"
        )
        admin.password_hash = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.session.add(admin)
        
        # Create initial employee user
        print("Creating sample employee user...")
        employee = User(
            username="employee",
            email="employee@example.com",
            role="employee"
        )
        employee.password_hash = bcrypt.hashpw("employee123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.session.add(employee)
        
        # Commit users to get their IDs
        db.session.commit()
        
        # Create employee profile
        print("Creating employee profile...")
        emp_profile = Employee(
            user_id=employee.user_id,
            first_name="John",
            last_name="Doe",
            date_of_birth="1990-01-01",
            department="IT",
            position="Developer",
            date_joined="2023-01-01"
        )
        db.session.add(emp_profile)
        
        # Commit all changes
        db.session.commit()
        print("Database initialization completed successfully!")

if __name__ == "__main__":
    init_db() 