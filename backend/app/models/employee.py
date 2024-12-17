from app import db
from datetime import datetime

class Employee(db.Model):
    __tablename__ = 'Employees'
    
    employee_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    department = db.Column(db.String(255), nullable=False)
    position = db.Column(db.String(255), nullable=False)
    date_joined = db.Column(db.Date, nullable=False)
    
    # Relationships
    leave_applications = db.relationship('LeaveApplication', backref='employee')

    def to_dict(self):
        return {
            'employee_id': self.employee_id,
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat(),
            'department': self.department,
            'position': self.position,
            'date_joined': self.date_joined.isoformat(),
            'email': self.user.email if self.user else None
        } 