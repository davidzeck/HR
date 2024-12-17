import os
import json
from datetime import datetime
from app import create_app, db
from app.models.user import User
from app.models.employee import Employee
from app.models.leave import LeaveApplication, LeaveReview

def import_data():
    # Force production environment to use Railway database
    os.environ['FLASK_ENV'] = 'production'
    
    app = create_app()
    with app.app_context():
        try:
            # Read the export file
            with open('database_export.json', 'r') as f:
                data = json.load(f)

            # Clear existing data (optional - comment out if you want to keep existing data)
            print("Clearing existing data...")
            db.session.query(LeaveReview).delete()
            db.session.query(LeaveApplication).delete()
            db.session.query(Employee).delete()
            db.session.query(User).delete()
            db.session.commit()
            print("Existing data cleared successfully")

            # Import Users
            print("Importing users...")
            for user_data in data['users']:
                user = User(
                    user_id=user_data['user_id'],
                    username=user_data['username'],
                    email=user_data['email'],
                    role=user_data['role']
                )
                user.password_hash = user_data['password_hash']  # Directly set the hash
                if user_data['created_at']:
                    user.created_at = datetime.fromisoformat(user_data['created_at'])
                db.session.add(user)
            db.session.commit()
            print("Users imported successfully")

            # Import Employees
            print("Importing employees...")
            for emp_data in data['employees']:
                employee = Employee(
                    employee_id=emp_data['employee_id'],
                    user_id=emp_data['user_id'],
                    first_name=emp_data['first_name'],
                    last_name=emp_data['last_name'],
                    date_of_birth=datetime.fromisoformat(emp_data['date_of_birth']).date(),
                    department=emp_data['department'],
                    position=emp_data['position'],
                    date_joined=datetime.fromisoformat(emp_data['date_joined']).date()
                )
                db.session.add(employee)
            db.session.commit()
            print("Employees imported successfully")

            # Import Leave Applications and Reviews
            print("Importing leave applications...")
            for leave_data in data['leave_applications']:
                leave = LeaveApplication(
                    leave_application_id=leave_data['leave_application_id'],
                    employee_id=leave_data['employee_id'],
                    leave_type=leave_data['leave_type'],
                    leave_mode=leave_data['leave_mode'],
                    start_date=datetime.fromisoformat(leave_data['start_date']),
                    end_date=datetime.fromisoformat(leave_data['end_date']),
                    reason=leave_data['reason'],
                    status=leave_data['status']
                )
                if leave_data['application_date']:
                    leave.application_date = datetime.fromisoformat(leave_data['application_date'])
                db.session.add(leave)
            db.session.commit()

            # Import Leave Reviews
            print("Importing leave reviews...")
            for leave_data in data['leave_applications']:
                if leave_data['review']:
                    review_data = leave_data['review']
                    review = LeaveReview(
                        leave_application_id=review_data['leave_application_id'],
                        reviewed_by=review_data['reviewed_by'],
                        status=review_data['status'],
                        comments=review_data['comments']
                    )
                    if review_data['review_date']:
                        review.review_date = datetime.fromisoformat(review_data['review_date'])
                    db.session.add(review)
            db.session.commit()
            print("Leave applications and reviews imported successfully")

            print("All data imported successfully!")

        except Exception as e:
            print(f"Error during import: {str(e)}")
            db.session.rollback()
            raise e

if __name__ == '__main__':
    import_data() 