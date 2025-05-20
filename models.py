from app import db
from flask_login import UserMixin
from datetime import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    farm_diary_entries = db.relationship('FarmDiary', backref='user', lazy=True)
    tasks = db.relationship('TaskPlanner', backref='user', lazy=True)
    crop_recommendations = db.relationship('CropRecommendation', backref='user', lazy=True)
    fertilizer_recommendations = db.relationship('FertilizerRecommendation', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'

class FarmDiary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    entry_type = db.Column(db.String(50), nullable=False)  # sowing, fertilizer, irrigation, harvest, expense, income
    date = db.Column(db.Date, nullable=False)
    crop = db.Column(db.String(100), nullable=True)
    details = db.Column(db.Text, nullable=True)
    amount = db.Column(db.Float, default=0.0)  # For expenses or income entries
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<FarmDiary {self.entry_type} - {self.date}>'

class TaskPlanner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    task_name = db.Column(db.String(100), nullable=False)
    task_date = db.Column(db.Date, nullable=False)
    task_type = db.Column(db.String(50), nullable=False)  # irrigation, fertilizing, harvesting, etc.
    task_details = db.Column(db.Text, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<TaskPlanner {self.task_name} - {self.task_date}>'

class CropRecommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Nullable to allow anonymous users
    nitrogen = db.Column(db.Float, nullable=False)
    phosphorus = db.Column(db.Float, nullable=False)
    potassium = db.Column(db.Float, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    ph = db.Column(db.Float, nullable=False)
    rainfall = db.Column(db.Float, nullable=False)
    recommended_crop = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<CropRecommendation {self.recommended_crop}>'

class FertilizerRecommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Nullable to allow anonymous users
    nitrogen = db.Column(db.Float, nullable=False)
    phosphorus = db.Column(db.Float, nullable=False)
    potassium = db.Column(db.Float, nullable=False)
    crop_type = db.Column(db.String(100), nullable=False)
    recommended_fertilizer = db.Column(db.Text, nullable=False)  # Changed to Text type for longer recommendations
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<FertilizerRecommendation {self.recommended_fertilizer}>'
