"""
Spending Analysis Module
Processes financial transactions and computes statistical metrics, category breakdowns,
month-over-month changes, and trend aggregations.
"""

from typing import List, Dict, Any
from datetime import datetime, date, timedelta
import pandas as pd
import numpy as np

def analyze_user_spending(transactions: List[Dict[str, Any]], budgets: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Perform deep statistical analysis on user transactions.
    """
    if not transactions:
        return {
            'total_income': 0.0,
            'total_expenses': 0.0,
            'remaining_balance': 0.0,
            'savings_rate': 0.0,
            'current_month_spending': 0.0,
            'current_month_income': 0.0,
            'current_month_savings': 0.0,
            'previous_month_spending': 0.0,
            'mom_spending_change_pct': 0.0,
            'mom_spending_change_amount': 0.0,
            'avg_monthly_spending': 0.0,
            'avg_daily_spending': 0.0,
            'highest_spending_category': None,
            'highest_expense_transaction': None,
            'category_breakdown': [],
            'monthly_trend': [],
            'weekly_trend': [],
            'transaction_count': 0
        }

    df = pd.DataFrame(transactions)
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
    df['transaction_date'] = pd.to_datetime(df['transaction_date'])
    df['year_month'] = df['transaction_date'].dt.strftime('%Y-%m')
    df['week_year'] = df['transaction_date'].dt.strftime('%Y-W%U')

    # Income & Expense subsets
    income_df = df[df['type'] == 'Income']
    expense_df = df[df['type'] == 'Expense']

    total_income = float(income_df['amount'].sum())
    total_expenses = float(expense_df['amount'].sum())
    remaining_balance = total_income - total_expenses
    savings_rate = round((remaining_balance / total_income * 100), 1) if total_income > 0 else 0.0

    # Determine current month and previous month in data
    # Use latest transaction date or current system date
    today = datetime.utcnow()
    current_ym = today.strftime('%Y-%m')
    
    # If no transactions in current system month, use latest month available in dataset
    available_months = sorted(df['year_month'].unique())
    if available_months:
        if current_ym not in available_months:
            current_ym = available_months[-1]
            
        curr_idx = available_months.index(current_ym)
        prev_ym = available_months[curr_idx - 1] if curr_idx > 0 else None
    else:
        prev_ym = None

    # Current month metrics
    curr_expense_df = expense_df[expense_df['year_month'] == current_ym]
    curr_income_df = income_df[income_df['year_month'] == current_ym]
    
    current_month_spending = float(curr_expense_df['amount'].sum())
    current_month_income = float(curr_income_df['amount'].sum())
    current_month_savings = current_month_income - current_month_spending

    # Previous month metrics
    if prev_ym:
        prev_expense_df = expense_df[expense_df['year_month'] == prev_ym]
        previous_month_spending = float(prev_expense_df['amount'].sum())
    else:
        previous_month_spending = 0.0

    # MoM percentage change
    mom_spending_change_amount = current_month_spending - previous_month_spending
    if previous_month_spending > 0:
        mom_spending_change_pct = round(((current_month_spending - previous_month_spending) / previous_month_spending) * 100, 1)
    else:
        mom_spending_change_pct = 0.0

    # Category Breakdown for Expenses (All-time and Current Month)
    category_breakdown = []
    if not expense_df.empty:
        cat_group = expense_df.groupby('category')['amount'].agg(['sum', 'count']).reset_index()
        cat_group.columns = ['category', 'total_amount', 'transaction_count']
        cat_group = cat_group.sort_values(by='total_amount', ascending=False)
        
        for _, row in cat_group.iterrows():
            cat_total = float(row['total_amount'])
            pct = round((cat_total / total_expenses * 100), 1) if total_expenses > 0 else 0.0
            category_breakdown.append({
                'category': row['category'],
                'amount': cat_total,
                'count': int(row['transaction_count']),
                'percentage': pct
            })

    # Highest spending category
    highest_spending_category = category_breakdown[0] if category_breakdown else None

    # Highest single expense transaction
    highest_expense_transaction = None
    if not expense_df.empty:
        max_txn_idx = expense_df['amount'].idxmax()
        max_row = expense_df.loc[max_txn_idx]
        highest_expense_transaction = {
            'description': str(max_row['description']),
            'amount': float(max_row['amount']),
            'category': str(max_row['category']),
            'date': max_row['transaction_date'].strftime('%Y-%m-%d')
        }

    # Monthly Trends (Chronological)
    monthly_trend = []
    all_months = sorted(df['year_month'].unique())
    for ym in all_months:
        m_inc = float(income_df[income_df['year_month'] == ym]['amount'].sum()) if not income_df.empty else 0.0
        m_exp = float(expense_df[expense_df['year_month'] == ym]['amount'].sum()) if not expense_df.empty else 0.0
        # Format label e.g., "May 2026"
        dt_obj = datetime.strptime(ym, '%Y-%m')
        label = dt_obj.strftime('%b %Y')
        monthly_trend.append({
            'month': ym,
            'label': label,
            'income': m_inc,
            'expense': m_exp,
            'savings': m_inc - m_exp
        })

    # Average monthly and daily spending
    num_months = len(monthly_trend) if monthly_trend else 1
    avg_monthly_spending = round(total_expenses / max(1, num_months), 2)

    # Calculate active span in days
    if not df.empty:
        min_date = df['transaction_date'].min()
        max_date = df['transaction_date'].max()
        days_span = max(1, (max_date - min_date).days + 1)
        avg_daily_spending = round(total_expenses / days_span, 2)
    else:
        avg_daily_spending = 0.0

    # Weekly Trends (Last 8 weeks)
    weekly_trend = []
    if not expense_df.empty:
        # Group by week
        expense_df_sorted = expense_df.sort_values(by='transaction_date')
        weekly_group = expense_df_sorted.groupby(pd.Grouper(key='transaction_date', freq='W-SUN'))['amount'].sum().reset_index()
        # Take last 8 weeks
        recent_weeks = weekly_group.tail(8)
        for _, w_row in recent_weeks.iterrows():
            w_date = w_row['transaction_date']
            weekly_trend.append({
                'week': f"W/E {w_date.strftime('%d %b')}",
                'amount': float(w_row['amount'])
            })

    return {
        'total_income': round(total_income, 2),
        'total_expenses': round(total_expenses, 2),
        'remaining_balance': round(remaining_balance, 2),
        'savings_rate': savings_rate,
        'current_month_spending': round(current_month_spending, 2),
        'current_month_income': round(current_month_income, 2),
        'current_month_savings': round(current_month_savings, 2),
        'current_month': current_ym,
        'previous_month': prev_ym,
        'previous_month_spending': round(previous_month_spending, 2),
        'mom_spending_change_pct': mom_spending_change_pct,
        'mom_spending_change_amount': round(mom_spending_change_amount, 2),
        'avg_monthly_spending': avg_monthly_spending,
        'avg_daily_spending': avg_daily_spending,
        'highest_spending_category': highest_spending_category,
        'highest_expense_transaction': highest_expense_transaction,
        'category_breakdown': category_breakdown,
        'monthly_trend': monthly_trend,
        'weekly_trend': weekly_trend,
        'transaction_count': len(df)
    }
