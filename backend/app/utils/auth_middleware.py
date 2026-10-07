import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from ..models.user import User

def generate_token(user_id: int, email: str) -> str:
    """Generate a signed JWT token valid for the configured duration."""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=current_app.config['JWT_EXPIRATION_HOURS']),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET'], algorithm='HS256')

def decode_token(token: str):
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to enforce JWT authentication on protected routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'success': False, 'message': 'Authorization header is missing'}), 401
            
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'success': False, 'message': 'Invalid token format. Expected "Bearer <token>"'}), 401
            
        token = parts[1]
        payload = decode_token(token)
        
        if not payload or 'user_id' not in payload:
            return jsonify({'success': False, 'message': 'Token is invalid or has expired. Please login again.'}), 401
            
        current_user = User.query.get(payload['user_id'])
        if not current_user:
            return jsonify({'success': False, 'message': 'User associated with token not found'}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated
