from app import create_app, db
from app.models.user import User
from app.models.employee import Employee
from datetime import datetime
import bcrypt

def create_admin():
    app = create_app()
    with app.app_context():
        try:
            # Check if admin already exists
            admin = User.query.filter_by(email='admin@example.com').first()
            if not admin:
                print("Creating admin user...")
                admin = User(
                    username="admin",
                    email="admin@example.com",
                    role="admin"
                )
                admin.password_hash = bcrypt.hashpw("admin123".encode('utf-8'), 
                                                  bcrypt.gensalt()).decode('utf-8')
                db.session.add(admin)
                db.session.commit()
                print("Admin user created successfully!")
                print("Email: admin@example.com")
                print("Password: admin123")
            else:
                print("Admin user already exists")
                
        except Exception as e:
            print(f"Error creating admin user: {str(e)}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    create_admin() 