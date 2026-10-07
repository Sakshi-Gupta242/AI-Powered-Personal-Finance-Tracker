from flask import Blueprint, request, jsonify
from datetime import datetime
from ..models import db, Budget, Transaction
from ..utils.auth_middleware import token_required

budgets_bp = Blueprint('budgets', __name__, url_prefix='/api/budgets')

@budgets_bp.route('', methods=['GET'])
@token_required
def get_budgets(current_user):
    """Retrieve all budgets with real-time actual spending and status indicators."""
    month = request.args.get('month', datetime.utcnow().month, type=int)
    year = request.args.get('year', datetime.utcnow().year, type=int)

    budgets = Budget.query.filter_by(user_id=current_user.id, month=month, year=year).all()
    
    # Also fetch all transactions for this month/year to compute actual spending per category
    month_str = f"{year:04d}-{month:02d}"
    txns = Transaction.query.filter(
        Transaction.user_id == current_user.id,
        Transaction.type == 'Expense'
    ).all()

    # Aggregate spent amounts for the queried month
    category_spending = {}
    for t in txns:
        t_ym = t.transaction_date.strftime('%Y-%m')
        if t_ym == month_str:
            category_spending[t.category] = category_spending.get(t.category, 0.0) + float(t.amount)

    budget_list = []
    total_budgeted = 0.0
    total_spent = 0.0

    for b in budgets:
        limit_amt = float(b.amount)
        spent_amt = category_spending.get(b.category, 0.0)
        remaining = limit_amt - spent_amt
        utilization = round((spent_amt / limit_amt * 100), 1) if limit_amt > 0 else 0.0

        if spent_amt > limit_amt:
            status = 'danger' # Overspending
        elif utilization >= 80:
            status = 'warning' # Close to limit
        else:
            status = 'normal' # On track

        total_budgeted += limit_amt
        total_spent += spent_amt

        budget_list.append({
            'id': b.id,
            'category': b.category,
            'amount': limit_amt,
            'spent': round(spent_amt, 2),
            'remaining': round(remaining, 2),
            'utilization_pct': utilization,
            'status': status,
            'month': b.month,
            'year': b.year,
            'created_at': b.created_at.isoformat() if b.created_at else None
        })

    # Sort so overspent & warning items appear first
    status_priority = {'danger': 1, 'warning': 2, 'normal': 3}
    budget_list.sort(key=lambda x: status_priority.get(x['status'], 4))

    return jsonify({
        'success': True,
        'budgets': budget_list,
        'summary': {
            'total_budgeted': round(total_budgeted, 2),
            'total_spent': round(total_spent, 2),
            'total_remaining': round(total_budgeted - total_spent, 2),
            'overall_utilization_pct': round((total_spent / total_budgeted * 100), 1) if total_budgeted > 0 else 0.0,
            'month': month,
            'year': year
        }
    }), 200

@budgets_bp.route('', methods=['POST'])
@token_required
def set_budget(current_user):
    """Set or update a budget limit for a category in a given month/year."""
    data = request.get_json() or {}
    category = data.get('category', '').strip()
    amount = data.get('amount')
    month = data.get('month', datetime.utcnow().month)
    year = data.get('year', datetime.utcnow().year)

    if not category:
        return jsonify({'success': False, 'message': 'Category is required'}), 400

    try:
        amount_val = float(amount)
        if amount_val <= 0:
            return jsonify({'success': False, 'message': 'Budget amount must be greater than 0'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Valid numeric budget amount is required'}), 400

    try:
        month_val = int(month)
        year_val = int(year)
        if not (1 <= month_val <= 12):
            return jsonify({'success': False, 'message': 'Month must be between 1 and 12'}), 400
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Valid month and year are required'}), 400

    # Upsert: check if budget already exists for this user + category + month + year
    budget = Budget.query.filter_by(
        user_id=current_user.id,
        category=category,
        month=month_val,
        year=year_val
    ).first()

    if budget:
        budget.amount = amount_val
        db.session.commit()
        msg = f'Budget for {category} updated to ₹{amount_val:,.2f}'
    else:
        budget = Budget(
            user_id=current_user.id,
            category=category,
            amount=amount_val,
            month=month_val,
            year=year_val
        )
        db.session.add(budget)
        db.session.commit()
        msg = f'Budget for {category} set to ₹{amount_val:,.2f}'

    return jsonify({
        'success': True,
        'message': msg,
        'budget': budget.to_dict()
    }), 201

@budgets_bp.route('/<int:budget_id>', methods=['PUT'])
@token_required
def update_budget(current_user, budget_id):
    """Update existing budget limit."""
    budget = Budget.query.filter_by(id=budget_id, user_id=current_user.id).first()
    if not budget:
        return jsonify({'success': False, 'message': 'Budget not found'}), 404

    data = request.get_json() or {}
    if 'amount' in data:
        try:
            amt = float(data['amount'])
            if amt <= 0:
                return jsonify({'success': False, 'message': 'Amount must be greater than 0'}), 400
            budget.amount = amt
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Invalid amount'}), 400

    if 'category' in data and data['category'].strip():
        budget.category = data['category'].strip()

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Budget updated successfully',
        'budget': budget.to_dict()
    }), 200

@budgets_bp.route('/<int:budget_id>', methods=['DELETE'])
@token_required
def delete_budget(current_user, budget_id):
    """Delete a budget limit."""
    budget = Budget.query.filter_by(id=budget_id, user_id=current_user.id).first()
    if not budget:
        return jsonify({'success': False, 'message': 'Budget not found'}), 404

    db.session.delete(budget)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Budget deleted successfully'
    }), 200
