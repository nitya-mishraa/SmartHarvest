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

## Getting Started

1. Ensure PostgreSQL is installed and configured
2. Set up your environment variables for database connection
3. Start the application using Gunicorn: `gunicorn --bind 0.0.0.0:5000 main:app`