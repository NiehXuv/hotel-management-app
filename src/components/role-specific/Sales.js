import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

/**
 * Sales Dashboard Component
 * Shows sales-focused widgets and statistics
 * 
 * @param {Object} props - Component props
 * @param {Object} props.statistics - Statistics data for dashboard
 */
const SalesDashboard = ({ statistics }) => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  
  // Navigate to reports page
  const handleViewReports = () => {
    navigate('/reports');
  };
  
  // Mock sales data
  const salesData = {
    daily: 1250,
    weekly: 8750,
    monthly: statistics.monthlyRevenue,
    targets: {
      daily: 1500,
      weekly: 10000,
      monthly: 45000
    },
    topProperties: [
      { name: 'Sunrise Hotel', revenue: 18500 },
      { name: 'Mountain View Lodge', revenue: 14200 },
      { name: 'Riverside Resort', revenue: 9800 }
    ]
  };
  
  // Calculate progress percentages
  const calculateProgress = (actual, target) => {
    const percentage = (actual / target) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };
  
  // Mock file upload handler
  const handleFileUpload = (e) => {
    if (!e.target.files.length) return;
    
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      alert('Sales data uploaded successfully!');
    }, 1500);
  };
  
  return (
    <div className="mb-6">
      {/* Revenue Statistics */}
      <div className="mb-6">
        <Card
          header={<h2 className="text-lg font-semibold">Revenue Overview</h2>}
        >
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-600">Daily</h3>
              <p className="text-xl font-semibold">${salesData.daily}</p>
              <div className="mt-1 h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-color" 
                  style={{ width: `${calculateProgress(salesData.daily, salesData.targets.daily)}%` }}
                ></div>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Target: ${salesData.targets.daily}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-600">Weekly</h3>
              <p className="text-xl font-semibold">${salesData.weekly}</p>
              <div className="mt-1 h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-color" 
                  style={{ width: `${calculateProgress(salesData.weekly, salesData.targets.weekly)}%` }}
                ></div>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Target: ${salesData.targets.weekly}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-600">Monthly</h3>
              <p className="text-xl font-semibold">${salesData.monthly}</p>
              <div className="mt-1 h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-color" 
                  style={{ width: `${calculateProgress(salesData.monthly, salesData.targets.monthly)}%` }}
                ></div>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Target: ${salesData.targets.monthly}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewReports}
            fullWidth
          >
            View Detailed Reports
          </Button>
        </Card>
      </div>
      
      {/* Top Performing Properties */}
      <Card
        header={<h2 className="text-lg font-semibold">Top Performing Properties</h2>}
        className="mb-6"
      >
        {salesData.topProperties.map((property, index) => (
          <div key={index} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-color/20 flex items-center justify-center text-primary-color mr-2">
                {index + 1}
              </div>
              <span className="font-medium">{property.name}</span>
            </div>
            <span className="font-semibold">${property.revenue.toLocaleString()}</span>
          </div>
        ))}
      </Card>
      
      {/* Data Upload Section */}
      <Card
        header={<h2 className="text-lg font-semibold">Upload Sales Data</h2>}
      >
        <p className="text-sm text-neutral-600 mb-4">
          Upload your sales data files for processing and report generation.
        </p>
        
        <div className="mb-4">
          <Input
            id="sales-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            helperText="Supported formats: CSV, Excel (XLSX, XLS)"
            disabled={isUploading}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="primary" 
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Sales Data'}
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

export default SalesDashboard;