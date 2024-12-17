import os
import json
from app import create_app, db
from app.models.user import User
from app.models.employee import Employee
from app.models.leave import LeaveApplication, LeaveReview

def export_data():
    # Force development environment to use local database
    os.environ['FLASK_ENV'] = 'development'
    
    app = create_app()
    with app.app_context():
        try:
            # Export Users
            users = User.query.all()
            users_data = [{
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email,
                'password_hash': user.password_hash,
                'role': user.role,
                'created_at': user.created_at.isoformat() if user.created_at else None
            } for user in users]

            # Export Employees
            employees = Employee.query.all()
            employees_data = [{
                'employee_id': emp.employee_id,
                'user_id': emp.user_id,
                'first_name': emp.first_name,
                'last_name': emp.last_name,
                'date_of_birth': emp.date_of_birth.isoformat(),
                'department': emp.department,
                'position': emp.position,
                'date_joined': emp.date_joined.isoformat()
            } for emp in employees]

            # Export Leave Applications and Reviews
            leave_applications = LeaveApplication.query.all()
            leave_data = [{
                'leave_application_id': leave.leave_application_id,
                'employee_id': leave.employee_id,
                'leave_type': leave.leave_type,
                'leave_mode': leave.leave_mode,
                'start_date': leave.start_date.isoformat(),
                'end_date': leave.end_date.isoformat(),
                'reason': leave.reason,
                'status': leave.status,
                'application_date': leave.application_date.isoformat() if leave.application_date else None,
                'review': leave.review.to_dict() if leave.review else None
            } for leave in leave_applications]

            # Create export data dictionary
            export_data = {
                'users': users_data,
                'employees': employees_data,
                'leave_applications': leave_data
            }

            # Save to file
            with open('database_export.json', 'w') as f:
                json.dump(export_data, f, indent=2)

            print("Data exported successfully to database_export.json")
            
        except Exception as e:
            print(f"Error during export: {str(e)}")
            raise e

if __name__ == '__main__':
    export_data() 