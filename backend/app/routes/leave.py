from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.leave import LeaveApplication, LeaveReview
from app.models.user import User
from app.models.employee import Employee
from app import db
from datetime import datetime
import logging

leave_bp = Blueprint('leave', __name__)

@leave_bp.route('/request', methods=['POST'])
@jwt_required()
def request_leave():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Debug logging
        logging.info(f"Received leave request data: {data}")
        logging.info(f"Data types - leaveType: {type(data.get('leaveType'))}, "
                    f"leaveMode: {type(data.get('leaveMode'))}, "
                    f"reason: {type(data.get('reason'))}")

        # Get employee record
        employee = Employee.query.filter_by(user_id=int(current_user_id)).first()
        if not employee:
            return jsonify({'error': 'Employee not found'}), 404

        # Validate required fields and their types
        required_fields = {
            'leaveType': str,
            'leaveMode': str,
            'startDate': str,
            'endDate': str,
            'reason': str
        }

        # Validate each field
        for field, field_type in required_fields.items():
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 422
            
            value = data.get(field)
            if not isinstance(value, field_type):
                return jsonify({
                    'error': f'Invalid type for {field}. Expected {field_type.__name__}, got {type(value).__name__}'
                }), 422
            
            if not value or not value.strip():
                return jsonify({'error': f'Empty field: {field}'}), 422

        try:
            # Parse and validate dates
            start_date = datetime.strptime(data['startDate'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['endDate'], '%Y-%m-%d').date()
            
            if end_date < start_date:
                return jsonify({'error': 'End date cannot be before start date'}), 422

            # Create leave application
            leave = LeaveApplication(
                employee_id=employee.employee_id,
                leave_type=data['leaveType'].strip(),
                leave_mode=data['leaveMode'].strip(),
                start_date=start_date,
                end_date=end_date,
                reason=data['reason'].strip(),
                status='pending'
            )

            db.session.add(leave)
            db.session.commit()

            return jsonify(leave.to_dict()), 201

        except ValueError as e:
            return jsonify({'error': f'Invalid date format. Use YYYY-MM-DD. Error: {str(e)}'}), 422

    except Exception as e:
        logging.error(f"Error processing leave request: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@leave_bp.route('/applications', methods=['GET'])
@jwt_required()
def get_applications():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(int(current_user_id))
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        if current_user.role == 'admin':
            # For admin, get all applications
            applications = db.session.query(LeaveApplication)\
                .join(Employee)\
                .join(User, Employee.user_id == User.user_id)\
                .outerjoin(LeaveReview)\
                .options(
                    db.joinedload(LeaveApplication.employee).joinedload(Employee.user),
                    db.joinedload(LeaveApplication.review)
                )\
                .order_by(LeaveApplication.application_date.desc())\
                .all()
            
            # Include employee and reviewer details in response
            applications_data = []
            for leave in applications:
                leave_dict = leave.to_dict()
                leave_dict['employee'] = {
                    'name': f"{leave.employee.first_name} {leave.employee.last_name}",
                    'email': leave.employee.user.email,
                    'department': leave.employee.department
                }
                if leave.review:
                    reviewer = User.query.get(leave.review.reviewed_by)
                    leave_dict['reviewer'] = {
                        'id': reviewer.user_id,
                        'email': reviewer.email,
                        'name': reviewer.username
                    }
                
                applications_data.append(leave_dict)
            
            return jsonify(applications_data), 200
        else:
            # For employees, only get their own applications
            employee = Employee.query.filter_by(user_id=int(current_user_id)).first()
            if not employee:
                return jsonify({'error': 'Employee record not found'}), 404
                
            applications = LeaveApplication.query\
                .filter_by(employee_id=employee.employee_id)\
                .options(db.joinedload(LeaveApplication.review))\
                .order_by(LeaveApplication.application_date.desc())\
                .all()
                
            return jsonify([leave.to_dict() for leave in applications]), 200

    except Exception as e:
        logging.error(f"Error fetching leave applications: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to fetch leave applications'}), 500

@leave_bp.route('/review/<int:leave_id>', methods=['PUT'])
@jwt_required()
def review_leave(leave_id):
    try:
        current_user = User.query.get(int(get_jwt_identity()))
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403

        leave = LeaveApplication.query.get_or_404(leave_id)
        data = request.get_json()

        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400

        # Check if review already exists
        if leave.review:
            leave.review.status = data['status']
            leave.review.comments = data.get('comments')
            leave.review.review_date = datetime.utcnow()
        else:
            review = LeaveReview(
                leave_application_id=leave.leave_application_id,
                reviewed_by=current_user.user_id,
                status=data['status'],
                comments=data.get('comments')
            )
            db.session.add(review)

        # Update the leave application status
        leave.status = data['status']
        
        db.session.commit()
        return jsonify(leave.to_dict()), 200

    except Exception as e:
        logging.error(f"Error reviewing leave application: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to review leave application'}), 500 