# AgriSaarthi - AI-Driven Smart Farming Assistant

An AI-powered smart farming assistant platform designed to empower Indian farmers through innovative technological solutions and comprehensive agricultural support.

## Project Dependencies

This project uses the following dependencies:

- **email-validator** - For validating email addresses in forms
- **flask** - Web framework for building the application
- **flask-login** - User authentication and session management
- **flask-sqlalchemy** - ORM for database interactions
- **gunicorn** - WSGI HTTP server for deployment
- **numpy** - For numerical operations in recommendation algorithms
- **openai** - For AI-powered features (optional)
- **psycopg2-binary** - PostgreSQL database adapter
- **requests** - For making HTTP requests
- **sqlalchemy** - Database toolkit and ORM
- **werkzeug** - WSGI web application library

## Features

- Crop recommendation based on soil parameters and local climate
- Fertilizer recommendation based on soil nutrient levels
- Plant disease detection through image analysis
- Farm diary for tracking activities, expenses and income
- Task planner and calendar for scheduling farm activities
- Knowledge hub with farming best practices and tutorials
- Multi-language support with Hindi, Tamil, Telugu, and Bengali translations

## Application Structure

- Flask-based backend with PostgreSQL database
- Responsive Bootstrap-based frontend
- Simple AI models for agricultural recommendations
- Voice-over narration for accessibility

## Complete Guide for Running Locally in VSCode

### Prerequisites
1. **Python 3.10+** - Make sure you have Python installed
2. **PostgreSQL** - Install PostgreSQL database on your system
3. **VSCode** - Install Visual Studio Code
4. **VSCode Extensions**:
   - Python extension for VSCode
   - SQLTools extension (optional, for database management)

### Step-by-Step Setup Guide

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd agrisaarthi
   ```

2. **Create a Virtual Environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install email-validator flask flask-login flask-sqlalchemy gunicorn numpy openai psycopg2-binary requests sqlalchemy werkzeug
   ```

4. **Set Up PostgreSQL Database**
   - Create a new PostgreSQL database
   - Note down your database credentials (host, port, username, password, database name)

5. **Configure Environment Variables**
   - Create a `.env` file in the project root:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   FLASK_SECRET_KEY=your_secret_key
   ```

6. **Initialize the Database**
   - Run the following Python code to initialize your database:
   ```python
   from app import app, db
   with app.app_context():
       db.create_all()
   ```

7. **Run the Application**
   - Method 1: Using Flask directly
     ```bash
     # Windows
     $env:FLASK_APP = "main.py"
     flask run --host=0.0.0.0 --port=5000

     # macOS/Linux
     export FLASK_APP=main.py
     flask run --host=0.0.0.0 --port=5000
     ```
   
   - Method 2: Using Gunicorn (macOS/Linux only)
     ```bash
     gunicorn --bind 0.0.0.0:5000 main:app
     ```

   - Method 3: Using VSCode debugger
     - Create a launch configuration in VSCode
     - Click the Run and Debug button in VSCode
     - Select your Flask configuration

8. **Access the Application**
   - Open your browser and go to: `http://localhost:5000`

### Troubleshooting

1. **Database Connection Issues**
   - Verify PostgreSQL is running: `pg_isready`
   - Check your DATABASE_URL in the .env file
   - Make sure you've installed psycopg2-binary

2. **Missing Dependencies**
   - If you encounter errors about missing modules, install them with:
   ```bash
   pip install <module-name>
   ```

3. **Port Already in Use**
   - If port 5000 is already in use, change the port in the run command:
   ```bash
   flask run --host=0.0.0.0 --port=5001
   ```

### VSCode-Specific Tips

1. **Setting Up the Python Interpreter**
   - Command Palette (Ctrl+Shift+P) → Python: Select Interpreter
   - Choose the interpreter from your virtual environment

2. **Debugging in VSCode**
   - Create a `.vscode/launch.json` file:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Flask",
         "type": "python",
         "request": "launch",
         "module": "flask",
         "env": {
           "FLASK_APP": "main.py",
           "FLASK_DEBUG": "1"
         },
         "args": [
           "run",
           "--host=0.0.0.0",
           "--port=5000",
           "--no-debugger"
         ],
         "jinja": true
       }
     ]
   }
   ```
   - Use the Run and Debug tab to start the application

3. **Integrated Terminal**
   - Use VSCode's integrated terminal (Ctrl+`) to run commands
   - Make sure your virtual environment is activated in the terminal

4. **Extensions**
   - Install the "Python" extension for Python support
   - Install "SQLTools" and "SQLTools PostgreSQL/Redshift Driver" for database management
   - Install "ENV" for .env file syntax highlighting