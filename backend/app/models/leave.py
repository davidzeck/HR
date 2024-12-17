from app import db
from datetime import datetime
from app.models.user import User

class LeaveApplication(db.Model):
    __tablename__ = 'Leave_Applications'
    
    leave_application_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('Employees.employee_id'), nullable=False)
    leave_type = db.Column(db.String(50), nullable=False)
    leave_mode = db.Column(db.String(20), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)
    application_date = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    
    # Relationship with LeaveReview
    review = db.relationship('LeaveReview', backref='application', uselist=False)

    def to_dict(self):
        review_data = None
        if self.review:
            reviewer = User.query.get(self.review.reviewed_by)
            review_data = {
                'review_date': self.review.review_date.isoformat() if self.review.review_date else None,
                'comments': self.review.comments,
                'reviewer': {
                    'id': reviewer.user_id,
                    'email': reviewer.email,
                    'name': reviewer.username
                } if reviewer else None
            }

        return {
            'leave_application_id': self.leave_application_id,
            'employee_id': self.employee_id,
            'leave_type': self.leave_type,
            'leave_mode': self.leave_mode,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'reason': self.reason,
            'status': self.status,
            'application_date': self.application_date.isoformat() if self.application_date else None,
            'review': review_data
        }

class LeaveReview(db.Model):
    __tablename__ = 'Leave_Reviews'
    
    leave_review_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    leave_application_id = db.Column(db.Integer, db.ForeignKey('Leave_Applications.leave_application_id'), nullable=False)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    review_date = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    status = db.Column(db.Enum('accepted', 'denied'), nullable=False)
    comments = db.Column(db.Text)

    def to_dict(self):
        return {
            'leave_review_id': self.leave_review_id,
            'leave_application_id': self.leave_application_id,
            'reviewed_by': self.reviewed_by,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'status': self.status,
            'comments': self.comments
        } 