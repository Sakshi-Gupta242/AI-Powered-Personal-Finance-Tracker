import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file in root or backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))
load_dotenv()

class Config:
    """Application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'finance-tracker-app-secret-key-2026')
    JWT_SECRET = os.environ.get('JWT_SECRET', 'super-secret-finance-jwt-token-key-2026-secure')
    JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 24))
    
    # Database URL: Primary is MySQL, fallback to SQLite if needed
    # MySQL format: mysql+pymysql://<user>:<password>@<host>:<port>/<db_name>
    raw_db_url = os.environ.get('DATABASE_URL')
    if raw_db_url:
        # Normalize connection strings for SQLAlchemy compatibility
        if raw_db_url.startswith('mysql://'):
            raw_db_url = raw_db_url.replace('mysql://', 'mysql+pymysql://', 1)
        elif raw_db_url.startswith('postgres://'):
            raw_db_url = raw_db_url.replace('postgres://', 'postgresql://', 1)
        DATABASE_URL = raw_db_url
    elif os.environ.get('VERCEL'):
        # On Vercel serverless, root /var/task is read-only; use /tmp for SQLite
        DATABASE_URL = "sqlite:////tmp/finance_tracker.db"
    else:
        # Default local SQLite for zero-config quick start, or MySQL if specified
        base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
        DATABASE_URL = f"sqlite:///{os.path.join(base_dir, 'finance_tracker.db')}"
        
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    } if "mysql" in DATABASE_URL.lower() else {}
    
    # Frontend URL (For CORS allowlist in production)
    FRONTEND_URL = os.environ.get('FRONTEND_URL', '*')
