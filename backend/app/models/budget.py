from datetime import datetime
from . import db

class Budget(db.Model):
    """Budget limit set by a user for a specific category and month/year."""
    __tablename__ = 'budgets'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    month = db.Column(db.Integer, nullable=False)  # 1 - 12
    year = db.Column(db.Integer, nullable=False)   # e.g., 2026
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Unique constraint per user, category, month, and year
    __table_args__ = (
        db.UniqueConstraint('user_id', 'category', 'month', 'year', name='uq_user_category_period'),
    )

    def to_dict(self):
        """Convert budget record to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category': self.category,
            'amount': float(self.amount),
            'month': self.month,
            'year': self.year,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
