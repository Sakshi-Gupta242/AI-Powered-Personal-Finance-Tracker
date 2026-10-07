export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export type TransactionType = 'Income' | 'Expense';

export type TransactionCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Education'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Rent'
  | 'Transportation'
  | 'Other'
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | string;

export interface Transaction {
  id: number;
  user_id: number;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  transaction_date: string;
  created_at?: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category: string;
  amount: number;
  spent?: number;
  remaining?: number;
  utilization_pct?: number;
  status?: 'normal' | 'warning' | 'danger';
  month: number;
  year: number;
  created_at?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count?: number;
  percentage: number;
}

export interface MonthlyTrendItem {
  month: string;
  label: string;
  income: number;
  expense: number;
  savings: number;
}

export interface WeeklyTrendItem {
  week: string;
  amount: number;
}

export interface FinancialHealth {
  score: number;
  status: string;
  color: string;
  summary: string;
}

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  remaining_balance: number;
  savings_rate: number;
  current_month_spending: number;
  current_month_income: number;
  current_month_savings: number;
  mom_spending_change_pct: number;
  mom_spending_change_amount: number;
  avg_monthly_spending: number;
  avg_daily_spending: number;
  total_budget_limit: number;
  total_budget_spent: number;
  budget_utilization_pct: number;
  budget_status: string;
  financial_health: FinancialHealth;
}

export interface ExpensePrediction {
  has_enough_data: boolean;
  predicted_amount: number;
  confidence: string;
  trend: string;
  slope: number;
  intercept?: number;
  percentage_change: number;
  explanation: string;
  historical_data: Array<{
    month: string;
    label: string;
    total_expense: number;
  }>;
  model_info?: {
    algorithm: string;
    formula?: string;
    data_points_count: number;
  };
}

export interface AIInsights {
  metrics: {
    highest_spending_category: {
      category: string;
      amount: number;
      percentage: number;
    } | null;
    highest_expense_transaction: {
      description: string;
      amount: number;
      category: string;
      date: string;
    } | null;
    avg_monthly_spending: number;
    avg_daily_spending: number;
    savings_rate: number;
    mom_spending_change_pct: number;
    mom_spending_change_amount: number;
    current_month_spending: number;
    total_income: number;
    total_expenses: number;
    remaining_balance: number;
  };
  financial_health: FinancialHealth;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    impact: string;
    category: string;
    icon?: string;
  }>;
  warnings: Array<{
    category: string;
    budget: number;
    spent: number;
    over_amount?: number;
    remaining?: number;
    utilization_pct: number;
    severity: 'warning' | 'danger';
    message: string;
  }>;
  savings_tips: Array<{
    title: string;
    tip: string;
    monthly_potential: number;
    annual_potential: number;
    category: string;
  }>;
  overspending_categories: Array<any>;
  rule_50_30_20?: {
    needs_target: number;
    wants_target: number;
    savings_target: number;
    actual_savings: number;
    recommended_formula: string;
  };
  emergency_fund_target?: number;
  prediction: ExpensePrediction;
  category_breakdown: CategoryBreakdown[];
}

export interface MonthlyReport {
  period: {
    month: number;
    year: number;
    month_name: string;
  };
  user: {
    name: string;
    email: string;
  };
  summary: {
    total_income: number;
    total_expenses: number;
    net_savings: number;
    savings_percentage: number;
    total_budgeted: number;
    budget_variance: number;
    transaction_count: number;
  };
  category_breakdown: CategoryBreakdown[];
  budget_comparison: Array<{
    category: string;
    budget: number;
    spent: number;
    remaining: number;
    utilization_pct: number;
    status: string;
  }>;
  transactions: Transaction[];
  ai_highlights: {
    financial_health: FinancialHealth;
    warnings: any[];
    savings_tips: any[];
    recommendations: any[];
  };
}
