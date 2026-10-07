"""
Demo Seeding Script for AI-Powered Personal Finance Tracker.
Generates realistic multi-month Indian Rupee (₹) transactions, budgets, and user accounts.
"""

from datetime import datetime, date, timedelta
from app.models import db, User, Transaction, Budget

def populate_seed_data(target_user=None):
    """
    Populate realistic demo transactions and budgets for a user.
    If target_user is None, creates or retrieves the standard demo account:
    Email: demo@financetracker.com
    Password: password123
    """
    if target_user is None:
        user = User.query.filter_by(email='demo@financetracker.com').first()
        if not user:
            user = User(
                name='Aarav Sharma',
                email='demo@financetracker.com'
            )
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
    else:
        user = target_user

    # Clear existing transactions and budgets for clean seed
    Transaction.query.filter_by(user_id=user.id).delete()
    Budget.query.filter_by(user_id=user.id).delete()
    db.session.commit()

    today = date.today()
    current_year = today.year
    current_month = today.month

    # Generate 4 months of realistic transaction history
    # Month 0: Current month
    # Month -1: Last month
    # Month -2: Two months ago
    # Month -3: Three months ago

    months_offsets = [3, 2, 1, 0] # 3 months ago down to current month

    all_txns = []

    for offset in months_offsets:
        # Calculate target month date
        m_year = current_year
        m_month = current_month - offset
        while m_month <= 0:
            m_month += 12
            m_year -= 1

        # Salary & Income
        salary_date = date(m_year, m_month, 1)
        freelance_date = date(m_year, m_month, 15)

        all_txns.append(Transaction(
            user_id=user.id,
            type='Income',
            amount=65000.00,
            category='Salary',
            description='Monthly Software Engineer Salary Credit',
            transaction_date=salary_date
        ))

        all_txns.append(Transaction(
            user_id=user.id,
            type='Income',
            amount=12500.00,
            category='Freelance',
            description='Web Design Freelance Client Milestone Payment',
            transaction_date=freelance_date
        ))

        # Rent
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=16000.00,
            category='Rent',
            description='Monthly 2BHK Apartment Rent to Landlord',
            transaction_date=date(m_year, m_month, 2)
        ))

        # Bills
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=2450.00 + (offset * 120),
            category='Bills',
            description='Monthly Electricity Power Bill (BESCOM/State Board)',
            transaction_date=date(m_year, m_month, 5)
        ))
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=999.00,
            category='Bills',
            description='Airtel Fiber Gigabit Broadband WiFi Recharge',
            transaction_date=date(m_year, m_month, 7)
        ))
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=699.00,
            category='Bills',
            description='Jio 5G Unlimited Mobile Plan Recharge',
            transaction_date=date(m_year, m_month, 12)
        ))

        # Food & Groceries
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=4200.00,
            category='Food',
            description='BigBasket Monthly Kitchen Groceries (Rice, Dal, Oil)',
            transaction_date=date(m_year, m_month, 3)
        ))
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=850.00 + (offset * 50),
            category='Food',
            description="Domino's Gourmet Pizza and Garlic Bread with Friends",
            transaction_date=date(m_year, m_month, 8)
        ))
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=620.00,
            category='Food',
            description='Swiggy Meal Order (Biryani and Gulab Jamun)',
            transaction_date=date(m_year, m_month, 14)
        ))
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=1450.00,
            category='Food',
            description='Weekend Dinner Buffet with Family at Barbeque Nation',
            transaction_date=date(m_year, m_month, 21)
        ))
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=480.00,
            category='Food',
            description='Starbucks Caramel Macchiato and Croissant',
            transaction_date=date(m_year, m_month, 24)
        ))

        # Transportation
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=2500.00,
            category='Transportation',
            description='HP Petrol Fuel Filling for Car & Bike',
            transaction_date=date(m_year, m_month, 6)
        ))
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=450.00,
            category='Transportation',
            description='Uber Cab Ride from Office during Rain',
            transaction_date=date(m_year, m_month, 16)
        ))
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=800.00,
            category='Transportation',
            description='Namma Metro Smart Card Top-up Recharge',
            transaction_date=date(m_year, m_month, 20)
        ))

        # Shopping
        if offset in [0, 2]:
            all_txns.append(Transaction(
                user_id=user.id,
                type='Expense',
                amount=3899.00 if offset == 0 else 2499.00,
                category='Shopping',
                description='Amazon Great Indian Festival (Wireless Headphones)',
                transaction_date=date(m_year, m_month, 11)
            ))
            all_txns.append(Transaction(
                user_id=user.id,
                type='Expense',
                amount=1850.00,
                category='Shopping',
                description='Myntra Branded T-Shirts and Denim Jeans',
                transaction_date=date(m_year, m_month, 18)
            ))

        # Entertainment
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=649.00,
            category='Entertainment',
            description='Netflix 4K Ultra HD Premium Monthly Subscription',
            transaction_date=date(m_year, m_month, 9)
        ))
        all_txns.append(Transaction(
            user_id=user.id,
            type='Expense',
            amount=850.00,
            category='Entertainment',
            description='BookMyShow PVR INOX Movie Tickets (IMAX Experience)',
            transaction_date=date(m_year, m_month, 22)
        ))

        # Healthcare
        if offset in [1, 3]:
            all_txns.append(Transaction(
                user_id=user.id,
                type='Expense',
                amount=1250.00,
                category='Healthcare',
                description='Apollo Pharmacy Prescription Medicines and Vitamins',
                transaction_date=date(m_year, m_month, 13)
            ))

        # Education
        if offset in [0, 2]:
            all_txns.append(Transaction(
                user_id=user.id,
                type='Expense',
                amount=1499.00,
                category='Education',
                description='Udemy Full Stack Python & Machine Learning Bootcamp',
                transaction_date=date(m_year, m_month, 4)
            ))

    db.session.add_all(all_txns)

    # Set Monthly Budgets for Current Month
    demo_budgets = [
        Budget(user_id=user.id, category='Food', amount=8500.00, month=current_month, year=current_year),
        Budget(user_id=user.id, category='Shopping', amount=4500.00, month=current_month, year=current_year),
        Budget(user_id=user.id, category='Transportation', amount=4000.00, month=current_month, year=current_year),
        Budget(user_id=user.id, category='Bills', amount=5000.00, month=current_month, year=current_year),
        Budget(user_id=user.id, category='Entertainment', amount=2000.00, month=current_month, year=current_year),
        Budget(user_id=user.id, category='Education', amount=3000.00, month=current_month, year=current_year),
        Budget(user_id=user.id, category='Healthcare', amount=2500.00, month=current_month, year=current_year),
        Budget(user_id=user.id, category='Rent', amount=16000.00, month=current_month, year=current_year),
    ]
    db.session.add_all(demo_budgets)
    db.session.commit()

    return {
        'user': user.to_dict(),
        'transactions_count': len(all_txns),
        'budgets_count': len(demo_budgets)
    }
