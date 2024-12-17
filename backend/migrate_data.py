import os
import sys
import json
from app import create_app, db
from app.models.user import User
from app.models.employee import Employee
from app.models.leave import LeaveApplication, LeaveReview

def export_data(app):
    """Export data from MySQL database."""
    with app.app_context():
        # Export Users
        users = User.query.all()
        users_data = [{
            'username': user.username,
            'email': user.email,
            'password_hash': user.password_hash,
            'role': user.role,
            'created_at': user.created_at.isoformat() if user.created_at else None
        } for user in users]

        # Export Employees
        employees = Employee.query.all()
        employees_data = [{
            'user_email': emp.user.email,  # Use email as reference
            'first_name': emp.first_name,
            'last_name': emp.last_name,
            'date_of_birth': emp.date_of_birth.isoformat(),
            'department': emp.department,
            'position': emp.position,
            'date_joined': emp.date_joined.isoformat()
        } for emp in employees]

        # Export Leave Applications and Reviews
        applications = LeaveApplication.query.all()
        applications_data = [{
            'employee_email': app.employee.user.email,  # Use email as reference
            'leave_type': app.leave_type,
            'leave_mode': app.leave_mode,
            'start_date': app.start_date.isoformat(),
            'end_date': app.end_date.isoformat(),
            'reason': app.reason,
            'status': app.status,
            'application_date': app.application_date.isoformat() if app.application_date else None,
            'review': {
                'reviewer_email': app.review.reviewer.email if app.review else None,
                'review_date': app.review.review_date.isoformat() if app.review and app.review.review_date else None,
                'status': app.review.status if app.review else None,
                'comments': app.review.comments if app.review else None
            } if app.review else None
        } for app in applications]

        return {
            'users': users_data,
            'employees': employees_data,
            'applications': applications_data
        }

def import_data(app, data):
    """Import data into PostgreSQL database."""
    with app.app_context():
        # Create tables
        db.create_all()

        # Import Users
        email_to_user = {}  # Map to store email -> user objects
        for user_data in data['users']:
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                role=user_data['role']
            )
            user.password_hash = user_data['password_hash']
            if user_data['created_at']:
                user.created_at = datetime.fromisoformat(user_data['created_at'])
            db.session.add(user)
            email_to_user[user.email] = user
        db.session.commit()

        # Import Employees
        for emp_data in data['employees']:
            user = email_to_user.get(emp_data['user_email'])
            if user:
                employee = Employee(
                    user_id=user.user_id,
                    first_name=emp_data['first_name'],
                    last_name=emp_data['last_name'],
                    date_of_birth=datetime.fromisoformat(emp_data['date_of_birth']).date(),
                    department=emp_data['department'],
                    position=emp_data['position'],
                    date_joined=datetime.fromisoformat(emp_data['date_joined']).date()
                )
                db.session.add(employee)
        db.session.commit()

        # Import Leave Applications and Reviews
        for app_data in data['applications']:
            employee = Employee.query.join(User).filter(User.email == app_data['employee_email']).first()
            if employee:
                application = LeaveApplication(
                    employee_id=employee.employee_id,
                    leave_type=app_data['leave_type'],
                    leave_mode=app_data['leave_mode'],
                    start_date=datetime.fromisoformat(app_data['start_date']),
                    end_date=datetime.fromisoformat(app_data['end_date']),
                    reason=app_data['reason'],
                    status=app_data['status']
                )
                if app_data['application_date']:
                    application.application_date = datetime.fromisoformat(app_data['application_date'])
                
                db.session.add(application)
                db.session.flush()  # Get application ID

                # Add review if exists
                if app_data['review']:
                    reviewer = User.query.filter_by(email=app_data['review']['reviewer_email']).first()
                    if reviewer:
                        review = LeaveReview(
                            leave_application_id=application.leave_application_id,
                            reviewed_by=reviewer.user_id,
                            status=app_data['review']['status'],
                            comments=app_data['review']['comments']
                        )
                        if app_data['review']['review_date']:
                            review.review_date = datetime.fromisoformat(app_data['review']['review_date'])
                        db.session.add(review)

        db.session.commit()

if __name__ == "__main__":
    # Export from MySQL
    os.environ['FLASK_ENV'] = 'development'
    app = create_app()
    print("Exporting data from MySQL...")
    data = export_data(app)
    
    # Save to file
    with open('migration_data.json', 'w') as f:
        json.dump(data, f, indent=2)
    print("Data exported to migration_data.json")

    # Import to PostgreSQL
    os.environ['FLASK_ENV'] = 'production'
    app = create_app()
    print("Importing data to PostgreSQL...")
    with open('migration_data.json', 'r') as f:
        data = json.load(f)
    import_data(app, data)
    print("Data migration completed successfully!") 