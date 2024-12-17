from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from app.models.user import User
from app.models.employee import Employee
from app import db
from datetime import datetime
import logging

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        logging.info(f"Registration attempt with data: {data}")

        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400

        # Create user
        user = User(
            username=data['email'],  # Using email as username
            email=data['email'],
            role=data.get('role', 'employee')  # Use provided role or default to 'employee'
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()  # This assigns the user_id

        # Create employee record
        name_parts = data['name'].split()
        first_name = name_parts[0]
        last_name = name_parts[-1] if len(name_parts) > 1 else ""

        employee = Employee(
            user_id=user.user_id,
            first_name=first_name,
            last_name=last_name,
            date_of_birth=datetime.now().date(),  # Default value
            department="Default Department",
            position="Employee",
            date_joined=datetime.now().date()
        )
        db.session.add(employee)
        db.session.commit()

        logging.info(f"User registered successfully: {user.email}")
        return jsonify({'message': 'Registration successful'}), 201

    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        logging.info(f"Login attempt for email: {data.get('email')}")
        
        # Find user by email
        user = User.query.filter_by(email=data.get('email')).first()
        
        if not user:
            logging.warning(f"No user found with email: {data.get('email')}")
            return jsonify({'error': 'Invalid email or password'}), 401
            
        # Verify password
        if not user.check_password(data.get('password')):
            logging.warning(f"Invalid password for user: {data.get('email')}")
            return jsonify({'error': 'Invalid email or password'}), 401
            
        # Create tokens
        access_token = create_access_token(identity=str(user.user_id))
        refresh_token = create_refresh_token(identity=str(user.user_id))
        
        # Create response
        response_data = {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user.user_id,
                'email': user.email,
                'username': user.username,
                'role': user.role
            }
        }
        
        logging.info(f"Successful login for user: {user.email}")
        return jsonify(response_data), 200
        
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({'error': 'An error occurred during login'}), 500 