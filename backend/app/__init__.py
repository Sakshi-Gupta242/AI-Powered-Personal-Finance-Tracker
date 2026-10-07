import os
from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .models import db

def create_app(config_class=Config):
    """Application Factory for AI-Powered Personal Finance Tracker."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    frontend_url = app.config.get('FRONTEND_URL', '*')
    if frontend_url and frontend_url != '*':
        # Allow both production Vercel frontend and local development
        allowed_origins = [frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"]
        CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)
    else:
        CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database
    db.init_app(app)

    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.transactions import transactions_bp
    from .routes.dashboard import dashboard_bp
    from .routes.budgets import budgets_bp
    from .routes.ai import ai_bp
    from .routes.reports import reports_bp
    from .routes.seed import seed_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(budgets_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(seed_bp)

    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'project': 'AI-Powered Personal Finance Tracker and Smart Budgeting System',
            'version': '1.0.0'
        }), 200

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    # Auto create tables on initial startup
    with app.app_context():
        try:
            db.create_all()
            from .models import User
            from seed_data import populate_seed_data
            if User.query.count() == 0:
                print("Initial database setup: Auto-seeding default demo account (demo@financetracker.com)...")
                populate_seed_data(None)
                print("Default demo data initialized.")
        except Exception as e:
            print(f"[Notice] Database setup status: {e}")

    return app
