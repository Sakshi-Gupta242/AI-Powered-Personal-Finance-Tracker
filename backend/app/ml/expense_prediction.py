"""
Expense Prediction ML Module
Uses Scikit-learn Linear Regression to analyze multi-month historical spending trends
and forecast expected expenses for the upcoming month.
"""

from typing import List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

def predict_next_month_expense(monthly_expenses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Predict next month's total expense using Scikit-Learn Linear Regression.

    monthly_expenses is expected to be a chronological list of dicts:
    [{'month': '2026-05', 'total_expense': 15400.00, 'label': 'May 2026'}, ...]
    """
    if not monthly_expenses or len(monthly_expenses) == 0:
        return {
            'has_enough_data': False,
            'predicted_amount': 0.0,
            'confidence': 'Low',
            'trend': 'Insufficient Data',
            'slope': 0.0,
            'percentage_change': 0.0,
            'explanation': 'No historical expense records found. Add transactions across multiple months to enable AI Linear Regression forecasting.',
            'historical_data': []
        }

    # Extract clean series
    df = pd.DataFrame(monthly_expenses)
    df['total_expense'] = pd.to_numeric(df['total_expense'], errors='coerce').fillna(0.0)
    
    n_points = len(df)
    latest_expense = float(df['total_expense'].iloc[-1])

    # If only 1 month of historical data is available
    if n_points == 1:
        # Estimate reasonable baseline (approx equal to first month with minor 5% inflation buffer)
        predicted = round(latest_expense, 2)
        return {
            'has_enough_data': True,
            'predicted_amount': predicted,
            'confidence': 'Moderate (1 Month Baseline)',
            'trend': 'Baseline',
            'slope': 0.0,
            'percentage_change': 0.0,
            'explanation': f'Based on your first month expense of ₹{latest_expense:,.2f}, predicted next month expense is approximately ₹{predicted:,.2f}. Add another month of records to calculate Linear Regression velocity.',
            'historical_data': monthly_expenses,
            'model_info': {
                'algorithm': 'Single-period Baseline Projection',
                'data_points_count': 1
            }
        }

    # Use Scikit-Learn Linear Regression
    X = np.arange(1, n_points + 1).reshape(-1, 1)  # Month sequence indices: 1, 2, ..., N
    y = df['total_expense'].values                 # Monthly expense amounts

    model = LinearRegression()
    model.fit(X, y)

    # Predict for next month (time index N + 1)
    next_x = np.array([[n_points + 1]])
    predicted_val = float(model.predict(next_x)[0])

    # Ensure predicted expense is non-negative
    predicted_val = max(0.0, round(predicted_val, 2))

    slope = float(model.coef_[0])
    intercept = float(model.intercept_)

    # Calculate percentage change compared to latest month
    if latest_expense > 0:
        pct_change = round(((predicted_val - latest_expense) / latest_expense) * 100, 1)
    else:
        pct_change = 0.0

    # Determine trend direction
    if slope > 250:
        trend = 'Upward'
        trend_desc = f'Spending is trending upwards by approximately ₹{abs(slope):,.2f} per month.'
    elif slope < -250:
        trend = 'Downward'
        trend_desc = f'Great job! Spending is trending downwards by ₹{abs(slope):,.2f} per month.'
    else:
        trend = 'Stable'
        trend_desc = 'Your monthly spending is relatively stable and consistent.'

    explanation = (
        f"Scikit-learn Linear Regression model analyzed {n_points} months of expense history. "
        f"{trend_desc} Predicted expense for next month is ₹{predicted_val:,.2f} "
        f"({'+' if pct_change > 0 else ''}{pct_change}% compared to this month)."
    )

    return {
        'has_enough_data': True,
        'predicted_amount': predicted_val,
        'confidence': 'High' if n_points >= 3 else 'Moderate',
        'trend': trend,
        'slope': round(slope, 2),
        'intercept': round(intercept, 2),
        'percentage_change': pct_change,
        'explanation': explanation,
        'historical_data': monthly_expenses,
        'model_info': {
            'algorithm': 'Scikit-learn Ordinary Least Squares (OLS) Linear Regression',
            'formula': f"y = {round(slope, 2)}*x + {round(intercept, 2)}",
            'data_points_count': n_points
        }
    }
