from flask import Blueprint, jsonify
from ..utils.auth_middleware import token_required
try:
    from seed_data import populate_seed_data
except ImportError:
    from backend.seed_data import populate_seed_data
from ..models import User

seed_bp = Blueprint('seed', __name__, url_prefix='/api/seed')

@seed_bp.route('/demo-account', methods=['POST'])
def seed_demo_account():
    """Create or reset standard demo user with rich multi-month transactions."""
    try:
        result = populate_seed_data(None)
        return jsonify({
            'success': True,
            'message': 'Demo account populated successfully',
            'data': result
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@seed_bp.route('/my-account', methods=['POST'])
@token_required
def seed_current_user(current_user):
    """Populate demo transactions and budgets into the currently logged-in user account."""
    try:
        result = populate_seed_data(current_user)
        return jsonify({
            'success': True,
            'message': f'Demo data populated for {current_user.name}',
            'data': result
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
