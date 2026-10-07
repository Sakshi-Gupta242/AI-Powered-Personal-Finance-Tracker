from flask import Blueprint, request, jsonify
from datetime import datetime, date
from ..models import db, Transaction
from ..utils.auth_middleware import token_required

transactions_bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

VALID_CATEGORIES = [
    'Food', 'Travel', 'Shopping', 'Education', 'Bills',
    'Entertainment', 'Healthcare', 'Rent', 'Transportation', 'Other', 'Salary', 'Freelance', 'Investments'
]

@transactions_bp.route('', methods=['GET'])
@token_required
def get_transactions(current_user):
    """Retrieve transactions with search, category/type filter, date filtering, and pagination."""
    # Query parameters
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    txn_type = request.args.get('type', '').strip()
    start_date = request.args.get('start_date', '').strip()
    end_date = request.args.get('end_date', '').strip()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    sort_by = request.args.get('sort_by', 'date').strip()
    sort_order = request.args.get('sort_order', 'desc').strip()

    query = Transaction.query.filter_by(user_id=current_user.id)

    # Search in description or category
    if search:
        query = query.filter(
            (Transaction.description.ilike(f'%{search}%')) |
            (Transaction.category.ilike(f'%{search}%'))
        )

    # Filter by category
    if category and category.lower() != 'all':
        query = query.filter(Transaction.category.ilike(category))

    # Filter by type
    if txn_type and txn_type.lower() != 'all':
        query = query.filter(Transaction.type.ilike(txn_type))

    # Filter by date range
    if start_date:
        try:
            s_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.transaction_date >= s_date)
        except ValueError:
            pass

    if end_date:
        try:
            e_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.transaction_date <= e_date)
        except ValueError:
            pass

    # Sorting
    sort_column = Transaction.transaction_date
    if sort_by == 'amount':
        sort_column = Transaction.amount
    elif sort_by == 'category':
        sort_column = Transaction.category
    elif sort_by == 'created_at':
        sort_column = Transaction.created_at

    if sort_order.lower() == 'asc':
        query = query.order_by(sort_column.asc(), Transaction.id.asc())
    else:
        query = query.order_by(sort_column.desc(), Transaction.id.desc())

    total_count = query.count()

    # Pagination
    if limit > 0:
        transactions = query.paginate(page=page, per_page=limit, error_out=False).items
        total_pages = (total_count + limit - 1) // limit
    else:
        transactions = query.all()
        total_pages = 1

    return jsonify({
        'success': True,
        'transactions': [t.to_dict() for t in transactions],
        'pagination': {
            'total': total_count,
            'page': page,
            'limit': limit,
            'total_pages': total_pages
        }
    }), 200

@transactions_bp.route('', methods=['POST'])
@token_required
def create_transaction(current_user):
    """Add a new transaction."""
    data = request.get_json() or {}
    txn_type = data.get('type', '').strip()
    amount = data.get('amount')
    category = data.get('category', '').strip()
    description = data.get('description', '').strip()
    txn_date_str = data.get('transaction_date', '').strip()

    # Validation
    if txn_type not in ['Income', 'Expense']:
        return jsonify({'success': False, 'message': 'Type must be either "Income" or "Expense"'}), 400

    try:
        amount_val = float(amount)
        if amount_val <= 0:
            return jsonify({'success': False, 'message': 'Amount must be greater than 0'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Valid numeric amount is required'}), 400

    if not category:
        return jsonify({'success': False, 'message': 'Category is required'}), 400

    if not description:
        return jsonify({'success': False, 'message': 'Description is required'}), 400

    if not txn_date_str:
        txn_date = date.today()
    else:
        try:
            txn_date = datetime.strptime(txn_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

    transaction = Transaction(
        user_id=current_user.id,
        type=txn_type,
        amount=amount_val,
        category=category,
        description=description,
        transaction_date=txn_date
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Transaction added successfully',
        'transaction': transaction.to_dict()
    }), 201

@transactions_bp.route('/<int:txn_id>', methods=['GET'])
@token_required
def get_transaction(current_user, txn_id):
    """Get single transaction detail."""
    txn = Transaction.query.filter_by(id=txn_id, user_id=current_user.id).first()
    if not txn:
        return jsonify({'success': False, 'message': 'Transaction not found'}), 404

    return jsonify({'success': True, 'transaction': txn.to_dict()}), 200

@transactions_bp.route('/<int:txn_id>', methods=['PUT'])
@token_required
def update_transaction(current_user, txn_id):
    """Update an existing transaction."""
    txn = Transaction.query.filter_by(id=txn_id, user_id=current_user.id).first()
    if not txn:
        return jsonify({'success': False, 'message': 'Transaction not found'}), 404

    data = request.get_json() or {}
    
    if 'type' in data:
        if data['type'] not in ['Income', 'Expense']:
            return jsonify({'success': False, 'message': 'Type must be "Income" or "Expense"'}), 400
        txn.type = data['type']

    if 'amount' in data:
        try:
            amt = float(data['amount'])
            if amt <= 0:
                return jsonify({'success': False, 'message': 'Amount must be greater than 0'}), 400
            txn.amount = amt
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Invalid amount'}), 400

    if 'category' in data and data['category'].strip():
        txn.category = data['category'].strip()

    if 'description' in data and data['description'].strip():
        txn.description = data['description'].strip()

    if 'transaction_date' in data and data['transaction_date'].strip():
        try:
            txn.transaction_date = datetime.strptime(data['transaction_date'].strip(), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Transaction updated successfully',
        'transaction': txn.to_dict()
    }), 200

@transactions_bp.route('/<int:txn_id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user, txn_id):
    """Delete a transaction."""
    txn = Transaction.query.filter_by(id=txn_id, user_id=current_user.id).first()
    if not txn:
        return jsonify({'success': False, 'message': 'Transaction not found'}), 404

    db.session.delete(txn)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Transaction deleted successfully'
    }), 200
