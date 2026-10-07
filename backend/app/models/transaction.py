from datetime import datetime, date
from . import db

class Transaction(db.Model):
    """Financial transaction model representing Income or Expense."""
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    type = db.Column(db.String(10), nullable=False)  # 'Income' or 'Expense'
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    description = db.Column(db.String(255), nullable=False)
    transaction_date = db.Column(db.Date, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert transaction record to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'amount': float(self.amount),
            'category': self.category,
            'description': self.description,
            'transaction_date': self.transaction_date.strftime('%Y-%m-%d') if isinstance(self.transaction_date, (datetime, date)) else str(self.transaction_date),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
