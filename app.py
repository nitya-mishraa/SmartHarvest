import os
import logging
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import json
import base64
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask application
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the PostgreSQL database
database_url = os.environ.get("DATABASE_URL")
# Fix for SQLAlchemy and postgres:// URLs
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the database
db.init_app(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = "Please log in to access this page."

# Import models after db initialization to avoid circular imports
from models import User, FarmDiary, TaskPlanner, CropRecommendation, FertilizerRecommendation
from utils.ml_models import predict_crop, predict_fertilizer, detect_disease
from utils.translate import translate_text

# Load the user from the database
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create database tables
with app.app_context():
    try:
        db.create_all()
        app.logger.info("Database tables created successfully")
    except Exception as e:
        app.logger.error(f"Error creating database tables: {str(e)}")

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already exists.')
            return redirect(url_for('register'))
        
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            flash('Email already registered.')
            return redirect(url_for('register'))
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('Registration successful! Please login.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            flash('Login successful!')
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password.')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.')
    return redirect(url_for('index'))

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

# Crop Recommendation System Route
@app.route('/crop-recommendation', methods=['GET', 'POST'])
def crop_recommendation():
    if request.method == 'POST':
        try:
            # Get soil parameters from form
            n = float(request.form.get('nitrogen'))
            p = float(request.form.get('phosphorus'))
            k = float(request.form.get('potassium'))
            temperature = float(request.form.get('temperature'))
            humidity = float(request.form.get('humidity'))
            ph = float(request.form.get('ph'))
            rainfall = float(request.form.get('rainfall'))
            
            # Make prediction
            prediction = predict_crop(n, p, k, temperature, humidity, ph, rainfall)
            
            # Save recommendation to database if user is logged in
            if current_user.is_authenticated:
                crop_rec = CropRecommendation(
                    user_id=current_user.id,
                    nitrogen=n,
                    phosphorus=p,
                    potassium=k,
                    temperature=temperature,
                    humidity=humidity,
                    ph=ph,
                    rainfall=rainfall,
                    recommended_crop=prediction
                )
                db.session.add(crop_rec)
                db.session.commit()
            
            return render_template('crop_recommendation.html', prediction=prediction)
        except Exception as e:
            logger.error(f"Error in crop recommendation: {str(e)}")
            flash(f"Error: {str(e)}")
            return render_template('crop_recommendation.html', error=str(e))
    
    return render_template('crop_recommendation.html')

# Fertilizer Recommendation System Route
@app.route('/fertilizer-recommendation', methods=['GET', 'POST'])
def fertilizer_recommendation():
    if request.method == 'POST':
        try:
            # Get soil parameters and crop from form
            n = float(request.form.get('nitrogen'))
            p = float(request.form.get('phosphorus'))
            k = float(request.form.get('potassium'))
            crop_type = request.form.get('crop_type')
            
            # Make prediction
            prediction = predict_fertilizer(n, p, k, crop_type)
            
            # Save recommendation to database if user is logged in
            if current_user.is_authenticated:
                fertilizer_rec = FertilizerRecommendation(
                    user_id=current_user.id,
                    nitrogen=n,
                    phosphorus=p,
                    potassium=k,
                    crop_type=crop_type,
                    recommended_fertilizer=prediction
                )
                db.session.add(fertilizer_rec)
                db.session.commit()
            
            return render_template('fertilizer_recommendation.html', prediction=prediction)
        except Exception as e:
            logger.error(f"Error in fertilizer recommendation: {str(e)}")
            flash(f"Error: {str(e)}")
            return render_template('fertilizer_recommendation.html', error=str(e))
    
    return render_template('fertilizer_recommendation.html')

# Plant Disease Detection Route
@app.route('/disease-detection', methods=['GET', 'POST'])
def disease_detection():
    if request.method == 'POST':
        try:
            if 'plant_image' not in request.files:
                flash('No image uploaded')
                return redirect(request.url)
            
            file = request.files['plant_image']
            
            if file.filename == '':
                flash('No selected file')
                return redirect(request.url)
            
            # Process the image and predict disease
            img_bytes = file.read()
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            
            disease_name, disease_cause, disease_cure = detect_disease(img_base64)
            
            result = {
                'disease_name': disease_name,
                'disease_cause': disease_cause,
                'disease_cure': disease_cure
            }
            
            return render_template('disease_detection.html', result=result, image=img_base64)
        except Exception as e:
            logger.error(f"Error in disease detection: {str(e)}")
            flash(f"Error: {str(e)}")
            return render_template('disease_detection.html', error=str(e))
    
    return render_template('disease_detection.html')

# FarmBook - Digital Farm Diary
@app.route('/farm-diary', methods=['GET', 'POST'])
@login_required
def farm_diary():
    if request.method == 'POST':
        try:
            # Add new diary entry
            entry_type = request.form.get('entry_type')
            date = request.form.get('date')
            crop = request.form.get('crop')
            details = request.form.get('details')
            
            # Special handling for amount field
            amount = 0.0
            if entry_type in ['expense', 'income']:
                amount_str = request.form.get('amount', '')
                if amount_str.strip():
                    try:
                        amount = float(amount_str)
                    except ValueError:
                        flash('Please enter a valid amount for expense/income entries.')
                        entries = FarmDiary.query.filter_by(user_id=current_user.id).order_by(FarmDiary.date.desc()).all()
                        return render_template('farm_diary.html', entries=entries)
            
            new_entry = FarmDiary(
                user_id=current_user.id,
                entry_type=entry_type,
                date=date,
                crop=crop,
                details=details,
                amount=amount
            )
            
            db.session.add(new_entry)
            db.session.commit()
            
            flash('Entry added successfully!')
            return redirect(url_for('farm_diary'))
        except Exception as e:
            logger.error(f"Error in farm diary: {str(e)}")
            flash(f"Error: {str(e)}")
            db.session.rollback()
    
    # Get all diary entries for the current user
    entries = FarmDiary.query.filter_by(user_id=current_user.id).order_by(FarmDiary.date.desc()).all()
    return render_template('farm_diary.html', entries=entries)

@app.route('/farm-diary/delete/<int:entry_id>', methods=['POST'])
@login_required
def delete_diary_entry(entry_id):
    entry = FarmDiary.query.get_or_404(entry_id)
    
    # Check if the entry belongs to the current user
    if entry.user_id != current_user.id:
        flash('You are not authorized to delete this entry.')
        return redirect(url_for('farm_diary'))
    
    db.session.delete(entry)
    db.session.commit()
    
    flash('Entry deleted successfully.')
    return redirect(url_for('farm_diary'))

@app.route('/farm-diary/export', methods=['GET'])
@login_required
def export_diary():
    entries = FarmDiary.query.filter_by(user_id=current_user.id).order_by(FarmDiary.date).all()
    
    # Create CSV content
    csv_content = "Entry Type,Date,Crop,Details,Amount\n"
    for entry in entries:
        csv_content += f"{entry.entry_type},{entry.date},{entry.crop},{entry.details},{entry.amount}\n"
    
    response = app.response_class(
        response=csv_content,
        mimetype='text/csv',
        headers={"Content-Disposition": "attachment;filename=farm_diary_export.csv"}
    )
    
    return response

# KrishiCalendar - Crop Task Planner
@app.route('/task-planner', methods=['GET', 'POST'])
@login_required
def task_planner():
    if request.method == 'POST':
        try:
            # Add new task
            task_name = request.form.get('task_name')
            task_date = request.form.get('task_date')
            task_type = request.form.get('task_type')
            task_details = request.form.get('task_details')
            
            new_task = TaskPlanner(
                user_id=current_user.id,
                task_name=task_name,
                task_date=task_date,
                task_type=task_type,
                task_details=task_details,
                is_completed=False
            )
            
            db.session.add(new_task)
            db.session.commit()
            
            flash('Task added successfully!')
            return redirect(url_for('task_planner'))
        except Exception as e:
            logger.error(f"Error in task planner: {str(e)}")
            flash(f"Error: {str(e)}")
    
    # Get all tasks for the current user
    tasks = TaskPlanner.query.filter_by(user_id=current_user.id).order_by(TaskPlanner.task_date).all()
    return render_template('task_planner.html', tasks=tasks)

@app.route('/task-planner/complete/<int:task_id>', methods=['POST'])
@login_required
def complete_task(task_id):
    task = TaskPlanner.query.get_or_404(task_id)
    
    # Check if the task belongs to the current user
    if task.user_id != current_user.id:
        flash('You are not authorized to update this task.')
        return redirect(url_for('task_planner'))
    
    task.is_completed = not task.is_completed
    db.session.commit()
    
    flash('Task status updated.')
    return redirect(url_for('task_planner'))

@app.route('/task-planner/delete/<int:task_id>', methods=['POST'])
@login_required
def delete_task(task_id):
    task = TaskPlanner.query.get_or_404(task_id)
    
    # Check if the task belongs to the current user
    if task.user_id != current_user.id:
        flash('You are not authorized to delete this task.')
        return redirect(url_for('task_planner'))
    
    db.session.delete(task)
    db.session.commit()
    
    flash('Task deleted successfully.')
    return redirect(url_for('task_planner'))

# Knowledge Hub Route
@app.route('/knowledge_hub')
def knowledge_hub():
    return render_template('knowledge_hub.html')

# Chatbot Route removed as per user's request

# Translation API endpoint
@app.route('/api/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        text = data.get('text', '')
        target_language = data.get('target_language', 'en')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        translated_text = translate_text(text, target_language)
        
        return jsonify({'translated_text': translated_text})
    except Exception as e:
        logger.error(f"Error in translation: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Set the language for the session
@app.route('/set_language', methods=['POST'])
def set_language():
    language = request.form.get('language', 'en')
    session['language'] = language
    return redirect(request.referrer or url_for('index'))

# Knowledge Hub content is included directly in the knowledge_hub route

# Add translation helper to all templates
@app.context_processor
def inject_language_helper():
    def translate(text):
        # Get current language from session or default to English
        current_language = session.get('language', 'en')
        # Use our translation utility to translate the text
        return translate_text(text, current_language)
    
    # Get current language for templates
    current_language = session.get('language', 'en')
    
    # Import supported languages from the translate module
    from utils.translate import SUPPORTED_LANGUAGES
    
    return {
        'translate': translate,
        'current_language': current_language,
        'SUPPORTED_LANGUAGES': SUPPORTED_LANGUAGES
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
