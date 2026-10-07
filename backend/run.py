import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from seed_data import populate_seed_data

app = create_app()

if __name__ == '__main__':
    # Auto-seed demo account if database is freshly created
    with app.app_context():
        from app.models import User
        try:
            if User.query.count() == 0:
                print("🚀 First run detected: Seeding default demo account (demo@financetracker.com)...")
                populate_seed_data(None)
                print("✅ Demo data seeded successfully!")
        except Exception as e:
            print(f"Seed note: {e}")

    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development' or os.environ.get('FLASK_DEBUG') == '1'
    
    print(f"============================================================")
    print(f" AI-Powered Personal Finance Tracker & Smart Budgeting System")
    print(f" Tagline: Track. Analyze. Predict. Save.")
    print(f" Server running at: http://localhost:{port}")
    print(f" API Health check: http://localhost:{port}/api/health")
    print(f"============================================================")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
