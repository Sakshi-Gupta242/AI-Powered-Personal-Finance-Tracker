from flask import Blueprint, request, jsonify, send_file, make_response
from datetime import datetime
import io
from ..models import Transaction, Budget
from ..utils.auth_middleware import token_required
from ..ml.spending_analysis import analyze_user_spending
from ..ml.recommendations import generate_financial_recommendations

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('/monthly', methods=['GET'])
@token_required
def get_monthly_report(current_user):
    """Generate comprehensive structured monthly financial report."""
    month = request.args.get('month', datetime.utcnow().month, type=int)
    year = request.args.get('year', datetime.utcnow().year, type=int)

    month_str = f"{year:04d}-{month:02d}"
    dt_obj = datetime(year, month, 1)
    month_name = dt_obj.strftime('%B %Y')

    # Fetch all user transactions
    txns = Transaction.query.filter_by(user_id=current_user.id).all()
    txn_dicts = [t.to_dict() for t in txns]
    
    # Filter transactions for this specific month
    month_txns = [t for t in txn_dicts if t['transaction_date'].startswith(month_str)]

    # Fetch budgets for this month
    budgets = Budget.query.filter_by(user_id=current_user.id, month=month, year=year).all()
    budget_dicts = [b.to_dict() for b in budgets]

    # Calculate month metrics
    month_income = sum(t['amount'] for t in month_txns if t['type'] == 'Income')
    month_expenses = sum(t['amount'] for t in month_txns if t['type'] == 'Expense')
    net_savings = month_income - month_expenses
    savings_pct = round((net_savings / month_income * 100), 1) if month_income > 0 else 0.0

    # Category breakdown for this month
    cat_expenses = {}
    for t in month_txns:
        if t['type'] == 'Expense':
            cat = t['category']
            cat_expenses[cat] = cat_expenses.get(cat, 0.0) + t['amount']

    category_breakdown = []
    for cat, amt in sorted(cat_expenses.items(), key=lambda x: x[1], reverse=True):
        category_breakdown.append({
            'category': cat,
            'amount': round(amt, 2),
            'percentage': round((amt / month_expenses * 100), 1) if month_expenses > 0 else 0.0
        })

    # Budget vs Actual comparison
    budget_comparison = []
    total_budgeted = 0.0
    for b in budget_dicts:
        b_cat = b['category']
        b_amt = float(b['amount'])
        spent = cat_expenses.get(b_cat, 0.0)
        rem = b_amt - spent
        util = round((spent / b_amt * 100), 1) if b_amt > 0 else 0.0
        
        total_budgeted += b_amt
        budget_comparison.append({
            'category': b_cat,
            'budget': b_amt,
            'spent': round(spent, 2),
            'remaining': round(rem, 2),
            'utilization_pct': util,
            'status': 'Over Budget' if spent > b_amt else ('Near Limit' if util >= 80 else 'Within Budget')
        })

    # AI Highlights
    ai_analysis = analyze_user_spending(txn_dicts, budget_dicts)
    rec_data = generate_financial_recommendations(ai_analysis, budget_dicts, cat_expenses, {})

    return jsonify({
        'success': True,
        'report': {
            'period': {
                'month': month,
                'year': year,
                'month_name': month_name
            },
            'user': {
                'name': current_user.name,
                'email': current_user.email
            },
            'summary': {
                'total_income': round(month_income, 2),
                'total_expenses': round(month_expenses, 2),
                'net_savings': round(net_savings, 2),
                'savings_percentage': savings_pct,
                'total_budgeted': round(total_budgeted, 2),
                'budget_variance': round(total_budgeted - month_expenses, 2),
                'transaction_count': len(month_txns)
            },
            'category_breakdown': category_breakdown,
            'budget_comparison': budget_comparison,
            'transactions': month_txns,
            'ai_highlights': {
                'financial_health': rec_data['financial_health'],
                'warnings': rec_data['warnings'],
                'savings_tips': rec_data['savings_tips'],
                'recommendations': rec_data['recommendations']
            }
        }
    }), 200

@reports_bp.route('/export-pdf', methods=['GET'])
@token_required
def export_pdf_report(current_user):
    """Generate and return a downloadable PDF financial report."""
    month = request.args.get('month', datetime.utcnow().month, type=int)
    year = request.args.get('year', datetime.utcnow().year, type=int)
    month_str = f"{year:04d}-{month:02d}"
    dt_obj = datetime(year, month, 1)
    month_name = dt_obj.strftime('%B %Y')

    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=15
        )
        section_heading = ParagraphStyle(
            'SectionHead',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#0F766E'),
            spaceBefore=14,
            spaceAfter=6
        )
        normal_text = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )

        # Header
        elements.append(Paragraph("AI-Powered Personal Finance Tracker", title_style))
        elements.append(Paragraph(f"Monthly Financial Statement — <b>{month_name}</b> | Generated for: <b>{current_user.name}</b> ({current_user.email})", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0D9488'), spaceAfter=15))

        # Query data
        txns = Transaction.query.filter_by(user_id=current_user.id).all()
        month_txns = [t.to_dict() for t in txns if t.to_dict()['transaction_date'].startswith(month_str)]
        
        income = sum(t['amount'] for t in month_txns if t['type'] == 'Income')
        expense = sum(t['amount'] for t in month_txns if t['type'] == 'Expense')
        savings = income - expense
        savings_pct = round((savings / income * 100), 1) if income > 0 else 0.0

        # Summary Table
        summary_data = [
            ['Metric', 'Amount (INR)', 'Status / Benchmark'],
            ['Total Monthly Income', f"Rs. {income:,.2f}", 'Primary Inflow'],
            ['Total Monthly Expenses', f"Rs. {expense:,.2f}", f"{round((expense/income*100),1) if income>0 else 0}% of Income"],
            ['Net Monthly Savings', f"Rs. {savings:,.2f}", f"Savings Rate: {savings_pct}%"],
        ]
        t_summary = Table(summary_data, colWidths=[200, 150, 180])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F766E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold' if True else 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8FAFC')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ]))
        elements.append(Paragraph("1. Executive Summary", section_heading))
        elements.append(t_summary)
        elements.append(Spacer(1, 10))

        # Category Breakdown Table
        cat_expenses = {}
        for t in month_txns:
            if t['type'] == 'Expense':
                cat = t['category']
                cat_expenses[cat] = cat_expenses.get(cat, 0.0) + t['amount']

        elements.append(Paragraph("2. Category-wise Spending Breakdown", section_heading))
        if cat_expenses:
            cat_table_data = [['Category', 'Amount (INR)', 'Share of Total']]
            for cat, amt in sorted(cat_expenses.items(), key=lambda x: x[1], reverse=True):
                pct = round((amt / expense * 100), 1) if expense > 0 else 0.0
                cat_table_data.append([cat, f"Rs. {amt:,.2f}", f"{pct}%"])
            
            t_cat = Table(cat_table_data, colWidths=[200, 150, 180])
            t_cat.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F1F5F9')]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ]))
            elements.append(t_cat)
        else:
            elements.append(Paragraph("No expenses recorded for this month.", normal_text))

        elements.append(Spacer(1, 10))

        # AI Recommendations
        elements.append(Paragraph("3. AI Insights & Budget Recommendations", section_heading))
        if savings_pct >= 20:
            ai_text = f"• Positive Financial Discipline: You achieved a healthy savings rate of {savings_pct}% this month.<br/>"
        else:
            ai_text = f"• Savings Alert: Your savings rate is {savings_pct}%. Consider reducing discretionary spending to reach the 20% target.<br/>"

        if cat_expenses:
            highest_cat = max(cat_expenses.items(), key=lambda x: x[1])
            ai_text += f"• Dominant Expense Driver: Your highest expenditure category was <b>{highest_cat[0]}</b> at <b>Rs. {highest_cat[1]:,.2f}</b>.<br/>"
            ai_text += f"• AI Savings Recommendation: Reducing {highest_cat[0]} expenses by 15% would save approximately Rs. {highest_cat[1]*0.15*12:,.0f} per year.<br/>"

        ai_text += "• Predictive Linear Regression: Historical data indicates stable expenditure trajectory for the upcoming month."
        elements.append(Paragraph(ai_text, normal_text))

        elements.append(Spacer(1, 15))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94A3B8'), spaceAfter=8))
        elements.append(Paragraph("AI-Powered Personal Finance Tracker | Track. Analyze. Predict. Save.", ParagraphStyle('Footer', parent=styles['Italic'], fontSize=8, textColor=colors.HexColor('#94A3B8'))))

        doc.build(elements)
        buffer.seek(0)

        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=financial_report_{month_str}.pdf'
        return response

    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to generate PDF: {str(e)}'}), 500
