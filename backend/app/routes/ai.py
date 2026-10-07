from flask import Blueprint, request, jsonify
from datetime import datetime
from ..models import Transaction, Budget
from ..utils.auth_middleware import token_required
from ..ml.category_classifier import predict_category
from ..ml.expense_prediction import predict_next_month_expense
from ..ml.spending_analysis import analyze_user_spending
from ..ml.recommendations import generate_financial_recommendations

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/insights', methods=['GET'])
@token_required
def get_ai_insights(current_user):
    """Generate comprehensive AI insights and savings recommendations."""
    txns = Transaction.query.filter_by(user_id=current_user.id).all()
    txn_dicts = [t.to_dict() for t in txns]
    
    budgets = Budget.query.filter_by(user_id=current_user.id).all()
    budget_dicts = [b.to_dict() for b in budgets]

    analysis = analyze_user_spending(txn_dicts, budget_dicts)

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

    # Format monthly expenses for Scikit-Learn Linear Regression model
    monthly_data_for_ml = []
    for m in analysis['monthly_trend']:
        monthly_data_for_ml.append({
            'month': m['month'],
            'total_expense': m['expense'],
            'label': m['label']
        })

    prediction = predict_next_month_expense(monthly_data_for_ml)

    return jsonify({
        'success': True,
        'insights': {
            'metrics': {
                'highest_spending_category': analysis['highest_spending_category'],
                'highest_expense_transaction': analysis['highest_expense_transaction'],
                'avg_monthly_spending': analysis['avg_monthly_spending'],
                'avg_daily_spending': analysis['avg_daily_spending'],
                'savings_rate': analysis['savings_rate'],
                'mom_spending_change_pct': analysis['mom_spending_change_pct'],
                'mom_spending_change_amount': analysis['mom_spending_change_amount'],
                'current_month_spending': analysis['current_month_spending'],
                'total_income': analysis['total_income'],
                'total_expenses': analysis['total_expenses'],
                'remaining_balance': analysis['remaining_balance']
            },
            'financial_health': rec_data['financial_health'],
            'recommendations': rec_data['recommendations'],
            'warnings': rec_data['warnings'],
            'savings_tips': rec_data['savings_tips'],
            'overspending_categories': rec_data['overspending_categories'],
            'rule_50_30_20': rec_data['rule_50_30_20'],
            'emergency_fund_target': rec_data['emergency_fund_target'],
            'prediction': prediction,
            'category_breakdown': analysis['category_breakdown']
        }
    }), 200

@ai_bp.route('/prediction', methods=['GET'])
@token_required
def get_expense_prediction(current_user):
    """Calculate and return Scikit-learn Linear Regression expense prediction."""
    txns = Transaction.query.filter_by(user_id=current_user.id).all()
    txn_dicts = [t.to_dict() for t in txns]
    analysis = analyze_user_spending(txn_dicts)

    monthly_data_for_ml = []
    for m in analysis['monthly_trend']:
        monthly_data_for_ml.append({
            'month': m['month'],
            'total_expense': m['expense'],
            'label': m['label']
        })

    prediction = predict_next_month_expense(monthly_data_for_ml)

    return jsonify({
        'success': True,
        'prediction': prediction
    }), 200

@ai_bp.route('/predict-category', methods=['POST'])
def predict_txn_category():
    """Predict category from transaction description using TF-IDF + Logistic Regression."""
    data = request.get_json() or {}
    description = data.get('description', '').strip()

    if not description:
        return jsonify({
            'success': False,
            'message': 'Description string is required'
        }), 400

    result = predict_category(description)

    return jsonify({
        'success': True,
        'data': result
    }), 200
