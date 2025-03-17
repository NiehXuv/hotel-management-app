import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';

/**
 * Accountant Dashboard Component
 * 
 * Provides financial overview and expense management functionality specifically
 * designed for accounting staff to monitor financial health and manage transactions.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.statistics - Financial statistics data to display on dashboard
 */
const AccountantDashboard = ({ statistics }) => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  
  // Navigation handlers
  const handleViewReports = () => navigate('/reports');
  
  // Mock financial data
  const financialData = {
    revenue: statistics.monthlyRevenue,
    expenses: 28750,
    profit: statistics.monthlyRevenue - 28750,
    profitMargin: ((statistics.monthlyRevenue - 28750) / statistics.monthlyRevenue * 100).toFixed(1),
    pendingInvoices: statistics.pendingInvoices,
    pendingApprovals: 3,
    recentTransactions: [
      { id: 1, type: 'expense', description: 'Staff Salaries', amount: 12500, date: '2025-03-01', status: 'completed' },
      { id: 2, type: 'expense', description: 'Maintenance Supplies', amount: 2340, date: '2025-03-01', status: 'completed' },
      { id: 3, type: 'income', description: 'Booking #38291', amount: 1200, date: '2025-03-01', status: 'completed' },
      { id: 4, type: 'expense', description: 'Cleaning Service', amount: 850, date: '2025-02-28', status: 'pending' },
    ]
  };
  
  // Mock file upload handler
  const handleFileUpload = (e) => {
    if (!e.target.files.length) return;
    
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      alert('Financial data uploaded successfully!');
    }, 1500);
  };
  
  /**
   * Determines transaction styling based on type and status
   * @param {string} type - Transaction type (income/expense)
   * @param {string} status - Transaction status
   * @returns {Object} CSS styling configuration
   */
  const getTransactionStyle = (type, status) => {
    // Base styling
    const styling = {
      amountColor: '',
      statusVariant: 'neutral',
      prefix: ''
    };
    
    // Type-specific styling
    if (type === 'income') {
      styling.amountColor = 'text-success-color';
      styling.prefix = '+';
    } else if (type === 'expense') {
      styling.amountColor = 'text-error-color';
      styling.prefix = '-';
    }
    
    // Status-specific styling
    if (status === 'pending') {
      styling.statusVariant = 'warning';
    } else if (status === 'completed') {
      styling.statusVariant = 'success';
    }
    
    return styling;
  };
  
  return (
    <div className="mb-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-success-color/10 border-l-4 border-success-color">
          <h3 className="text-sm font-semibold text-neutral-600">Revenue</h3>
          <p className="text-2xl font-bold text-success-color">
            ${financialData.revenue.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            This month
          </p>
        </Card>
        
        <Card className="bg-primary-color/10 border-l-4 border-primary-color">
          <h3 className="text-sm font-semibold text-neutral-600">Profit</h3>
          <p className="text-2xl font-bold text-primary-color">
            ${financialData.profit.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Margin: {financialData.profitMargin}%
          </p>
        </Card>
      </div>
      
      {/* Pending Items */}
      <Card
        header={<h2 className="text-lg font-semibold">Pending Items</h2>}
        className="mb-6"
      >
        <div className="flex justify-between mb-4">
          <div className="text-center flex-1">
            <div className="w-12 h-12 rounded-full bg-warning-color/20 text-warning-color flex items-center justify-center mx-auto mb-2">
              📄
            </div>
            <h3 className="text-sm font-medium">{financialData.pendingInvoices}</h3>
            <p className="text-xs text-neutral-500">Invoices</p>
          </div>
          
          <div className="text-center flex-1">
            <div className="w-12 h-12 rounded-full bg-warning-color/20 text-warning-color flex items-center justify-center mx-auto mb-2">
              ✓
            </div>
            <h3 className="text-sm font-medium">{financialData.pendingApprovals}</h3>
            <p className="text-xs text-neutral-500">Approvals</p>
          </div>
          
          <div className="text-center flex-1">
            <div className="w-12 h-12 rounded-full bg-warning-color/20 text-warning-color flex items-center justify-center mx-auto mb-2">
              💰
            </div>
            <h3 className="text-sm font-medium">$2,450</h3>
            <p className="text-xs text-neutral-500">Expenses</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewReports}
          fullWidth
        >
          Process Pending Items
        </Button>
      </Card>
      
      {/* Recent Transactions */}
      <Card
        header={<h2 className="text-lg font-semibold">Recent Transactions</h2>}
        className="mb-6"
      >
        {financialData.recentTransactions.map((transaction) => {
          const style = getTransactionStyle(transaction.type, transaction.status);
          
          return (
            <div key={transaction.id} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0">
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{transaction.description}</span>
                  <Badge variant={style.statusVariant} size="sm" className="ml-2">
                    {transaction.status}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500">{transaction.date}</p>
              </div>
              <span className={`font-semibold ${style.amountColor}`}>
                {style.prefix}${transaction.amount.toLocaleString()}
              </span>
            </div>
          );
        })}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewReports}
          className="mt-3"
          fullWidth
        >
          View All Transactions
        </Button>
      </Card>
      
      {/* Data Upload Section */}
      <Card
        header={<h2 className="text-lg font-semibold">Financial Data</h2>}
      >
        <p className="text-sm text-neutral-600 mb-4">
          Upload financial documents for processing and reconciliation.
        </p>
        
        <div className="mb-4">
          <Input
            id="finance-file"
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={handleFileUpload}
            helperText="Supported formats: CSV, Excel, PDF"
            disabled={isUploading}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="primary" 
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleViewReports}
          >
            Generate Reports
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AccountantDashboard;