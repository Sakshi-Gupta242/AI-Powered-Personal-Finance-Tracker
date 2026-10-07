"""
AI Recommendations Engine
Analyzes spending habits, budget limits, and month-over-month changes to produce
clear, actionable financial recommendations and savings tips.
"""

from typing import List, Dict, Any

def generate_financial_recommendations(
    analysis: Dict[str, Any],
    budgets: List[Dict[str, Any]] = None,
    current_month_cat_expenses: Dict[str, float] = None,
    prev_month_cat_expenses: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Generate personalized recommendations based on actual user data.
    """
    recommendations: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []
    savings_tips: List[Dict[str, Any]] = []
    overspending_categories: List[Dict[str, Any]] = []

    budgets = budgets or []
    current_month_cat_expenses = current_month_cat_expenses or {}
    prev_month_cat_expenses = prev_month_cat_expenses or {}

    # 1. Budget Adherence Analysis
    for b in budgets:
        cat = b.get('category')
        budget_limit = float(b.get('amount', 0))
        spent = float(current_month_cat_expenses.get(cat, 0))
        
        if budget_limit > 0:
            utilization_pct = round((spent / budget_limit) * 100, 1)
            remaining = round(budget_limit - spent, 2)
            
            if spent > budget_limit:
                over_amt = round(spent - budget_limit, 2)
                item = {
                    'category': cat,
                    'budget': budget_limit,
                    'spent': spent,
                    'over_amount': over_amt,
                    'utilization_pct': utilization_pct,
                    'severity': 'danger',
                    'message': f"Overspending Alert: You have exceeded your {cat} budget by ₹{over_amt:,.2f} ({utilization_pct}% of budget used)."
                }
                warnings.append(item)
                overspending_categories.append(item)
            elif utilization_pct >= 80:
                item = {
                    'category': cat,
                    'budget': budget_limit,
                    'spent': spent,
                    'remaining': remaining,
                    'utilization_pct': utilization_pct,
                    'severity': 'warning',
                    'message': f"Budget Warning: You have utilized {utilization_pct}% of your {cat} budget (₹{remaining:,.2f} remaining)."
                }
                warnings.append(item)

    # 2. Month-over-Month Category Spikes
    for cat, curr_val in current_month_cat_expenses.items():
        prev_val = prev_month_cat_expenses.get(cat, 0.0)
        if prev_val > 500 and curr_val > prev_val:
            cat_growth_pct = round(((curr_val - prev_val) / prev_val) * 100, 1)
            diff = curr_val - prev_val
            if cat_growth_pct >= 20:
                recommendations.append({
                    'type': 'spike',
                    'title': f'Increased Spending on {cat}',
                    'description': f"You spent {cat_growth_pct}% more on {cat} this month (₹{curr_val:,.2f}) compared to last month (₹{prev_val:,.2f}).",
                    'impact': f"+₹{diff:,.2f}",
                    'category': cat,
                    'icon': 'trending-up'
                })

    # 3. Highest Spending Category & Potential Annual Savings
    highest_cat = analysis.get('highest_spending_category')
    if highest_cat:
        cat_name = highest_cat['category']
        cat_amt = highest_cat['amount']
        
        # Suggest realistic 10% - 20% reduction
        monthly_saving_target = round(min(cat_amt * 0.15, 2000), -2)
        if monthly_saving_target < 200:
            monthly_saving_target = 500
            
        annual_savings = monthly_saving_target * 12
        
        savings_tips.append({
            'title': f'Targeted {cat_name} Optimization',
            'tip': f"If you reduce {cat_name} expenses by ₹{monthly_saving_target:,.0f} per month, you could save ₹{annual_savings:,.0f} annually.",
            'monthly_potential': monthly_saving_target,
            'annual_potential': annual_savings,
            'category': cat_name
        })

    # 4. Savings Rate Analysis & Financial Health Score
    savings_rate = analysis.get('savings_rate', 0.0)
    total_income = analysis.get('total_income', 0.0)
    total_expenses = analysis.get('total_expenses', 0.0)

    if total_income > 0:
        if savings_rate >= 35:
            health_score = 'Excellent'
            score_color = 'emerald'
            score_num = 92
            summary_msg = "Outstanding financial discipline! You are saving over 35% of your total income."
        elif savings_rate >= 20:
            health_score = 'Healthy'
            score_color = 'indigo'
            score_num = 78
            summary_msg = "Healthy savings habits! You meet the benchmark 20% savings recommendation."
        elif savings_rate > 0:
            health_score = 'Needs Attention'
            score_color = 'amber'
            score_num = 54
            summary_msg = "Your savings rate is below the recommended 20% target. Look for opportunities to trim discretionary expenses."
        else:
            health_score = 'Critical Deficit'
            score_color = 'rose'
            score_num = 28
            summary_msg = "Warning: Total expenses exceed your income. Urgent budget adjustments are required."
    else:
        health_score = 'No Income Recorded'
        score_color = 'slate'
        score_num = 50
        summary_msg = "Add income entries to compute your comprehensive financial health score."

    # 5. 50/30/20 Rule Blueprint
    rule_50_30_20 = None
    if total_income > 0:
        needs_target = round(total_income * 0.50, 2)
        wants_target = round(total_income * 0.30, 2)
        savings_target = round(total_income * 0.20, 2)
        rule_50_30_20 = {
            'needs_target': needs_target,
            'wants_target': wants_target,
            'savings_target': savings_target,
            'actual_savings': round(analysis.get('remaining_balance', 0.0), 2),
            'recommended_formula': '50% Needs, 30% Wants, 20% Savings'
        }

    # 6. Emergency Fund Recommendation
    avg_monthly = analysis.get('avg_monthly_spending', 0.0)
    emergency_fund_target = round(avg_monthly * 3, 2) if avg_monthly > 0 else 0.0

    return {
        'financial_health': {
            'score': score_num,
            'status': health_score,
            'color': score_color,
            'summary': summary_msg
        },
        'recommendations': recommendations,
        'warnings': warnings,
        'savings_tips': savings_tips,
        'overspending_categories': overspending_categories,
        'rule_50_30_20': rule_50_30_20,
        'emergency_fund_target': emergency_fund_target
    }
