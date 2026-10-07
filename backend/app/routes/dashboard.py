from flask import Blueprint, jsonify
from datetime import datetime
from ..models import Transaction, Budget
from ..utils.auth_middleware import token_required
from ..ml.spending_analysis import analyze_user_spending
from ..ml.recommendations import generate_financial_recommendations

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/summary', methods=['GET'])
@token_required
def get_dashboard_summary(current_user):
    """Retrieve full dashboard KPI metrics, recent transactions, and quick AI status."""
    txns = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.transaction_date.desc(), Transaction.id.desc()).all()
    txn_dicts = [t.to_dict() for t in txns]
    
    budgets = Budget.query.filter_by(user_id=current_user.id).all()
    budget_dicts = [b.to_dict() for b in budgets]

    analysis = analyze_user_spending(txn_dicts, budget_dicts)

    # Calculate category expenses for current month and previous month
    current_ym = analysis.get('current_month')
    prev_ym = analysis.get('previous_month')

    curr_cat_expenses = {}
    prev_cat_expenses = {}

    for t in txn_dicts:
        if t['type'] == 'Expense':
            ym = t['transaction_date'][:7]
            cat = t['category']
            if ym == current_ym:
                curr_cat_expenses[cat] = curr_cat_expenses.get(cat, 0.0) + t['amount']
            elif ym == prev_ym:
                prev_cat_expenses[cat] = prev_cat_expenses.get(cat, 0.0) + t['amount']

    rec_data = generate_financial_recommendations(analysis, budget_dicts, curr_cat_expenses, prev_cat_expenses)

    # Budget summary metrics
    total_budget_limit = sum(float(b.amount) for b in budgets)
    total_budget_spent = sum(curr_cat_expenses.get(b.category, 0.0) for b in budgets)
    budget_utilization_pct = round((total_budget_spent / total_budget_limit * 100), 1) if total_budget_limit > 0 else 0.0

    return jsonify({
        'success': True,
        'summary': {
            'total_income': analysis['total_income'],
            'total_expenses': analysis['total_expenses'],
            'remaining_balance': analysis['remaining_balance'],
            'savings_rate': analysis['savings_rate'],
            'current_month_spending': analysis['current_month_spending'],
            'current_month_income': analysis['current_month_income'],
            'current_month_savings': analysis['current_month_savings'],
            'mom_spending_change_pct': analysis['mom_spending_change_pct'],
            'mom_spending_change_amount': analysis['mom_spending_change_amount'],
            'avg_monthly_spending': analysis['avg_monthly_spending'],
            'avg_daily_spending': analysis['avg_daily_spending'],
            'total_budget_limit': round(total_budget_limit, 2),
            'total_budget_spent': round(total_budget_spent, 2),
            'budget_utilization_pct': budget_utilization_pct,
            'budget_status': 'Over Budget' if budget_utilization_pct > 100 else ('Warning' if budget_utilization_pct >= 80 else 'On Track'),
            'financial_health': rec_data['financial_health']
        },
        'recent_transactions': txn_dicts[:6],
        'warnings': rec_data['warnings'][:3],
        'top_recommendations': rec_data['recommendations'][:2],
        'savings_tips': rec_data['savings_tips'][:2]
    }), 200

@dashboard_bp.route('/monthly', methods=['GET'])
@token_required
def get_monthly_chart(current_user):
    """Retrieve chronological monthly spending & income trend."""
    txns = Transaction.query.filter_by(user_id=current_user.id).all()
    txn_dicts = [t.to_dict() for t in txns]
    analysis = analyze_user_spending(txn_dicts)

    return jsonify({
        'success': True,
        'monthly_data': analysis['monthly_trend']
    }), 200

@dashboard_bp.route('/categories', methods=['GET'])
@token_required
def get_category_breakdown(current_user):
    """Retrieve expense breakdown by category."""
    txns = Transaction.query.filter_by(user_id=current_user.id).all()
    txn_dicts = [t.to_dict() for t in txns]
    analysis = analyze_user_spending(txn_dicts)

    return jsonify({
        'success': True,
        'categories': analysis['category_breakdown']
    }), 200

@dashboard_bp.route('/weekly', methods=['GET'])
@token_required
def get_weekly_spending(current_user):
    """Retrieve weekly spending trend."""
    txns = Transaction.query.filter_by(user_id=current_user.id).all()
    txn_dicts = [t.to_dict() for t in txns]
    analysis = analyze_user_spending(txn_dicts)

    return jsonify({
        'success': True,
        'weekly_data': analysis['weekly_trend']
    }), 200
