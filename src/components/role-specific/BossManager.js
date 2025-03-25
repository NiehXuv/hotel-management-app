import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import {FaCalendarWeek} from 'react-icons/fa';
/**
 * Boss and Manager Dashboard Component
 * Shows management-focused widgets and statistics
 * 
 * @param {Object} props - Component props
 * @param {Object} props.statistics - Statistics data for dashboard
 */
const BossManagerDashboard = ({ statistics }) => {
  const navigate = useNavigate();
  
  // Navigate to create task page - Not implemented yet
  // const handleCreateTask = () => {
  //   navigate('/tasks/create');
  // };
  
  // Navigate to properties page
  const handleViewCalendar = () => {
    navigate('/calendar');
  };

  const handleViewProperties = () => {
    navigate('/properties');
  };
  
  // Navigate to reports page
  const handleViewReports = () => {
    navigate('/reports');
  };
  
  // Navigate to users page
  const handleViewUsers = () => {
    navigate('/users');
  };
  
  return (
    <div className="mb-6">
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        
        {/* <Button 
          variant="primary" 
          onClick={handleCreateTask}
          className="flex items-center justify-center"
        >
          <span className="mr-2">✏️</span>
          Create Task
        </Button> */}
        
        <Button 
          variant="outline" 
          onClick={handleViewCalendar}
          className="flex items-center justify-center"
        >
          <span className="mr-2"><FaCalendarWeek /></span>
          View Calendar
        </Button>
      </div>
      
      {/* Key Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="bg-primary-color/10 border-l-4 border-primary-color">
          <h3 className="text-sm font-semibold text-neutral-600">Occupancy Rate</h3>
          <p className="text-2xl font-bold text-primary-color">{statistics.occupancyRate}%</p>
          <p className="text-xs text-neutral-500 mt-1">
            {statistics.occupiedRooms} of {statistics.totalRooms} rooms
          </p>
        </Card>
        
        <Card className="bg-warning-color/10 border-l-4 border-warning-color">
          <h3 className="text-sm font-semibold text-neutral-600">Pending Tasks</h3>
          <p className="text-2xl font-bold text-warning-color">{statistics.pendingTasks}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {statistics.criticalTasks} critical
          </p>
        </Card>
      </div>
      
      {/* Properties Overview */}
      <Card
        header={<h2 className="text-lg font-semibold">Properties Overview</h2>}
        className="mb-4"
      >
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-600">Total Properties</h3>
            <p className="text-xl font-semibold">{statistics.totalProperties}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-neutral-600">Total Rooms</h3>
            <p className="text-xl font-semibold">{statistics.totalRooms}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewProperties}
          fullWidth
        >
          Property Details
        </Button>
      </Card>
      
      {/* Financial Overview */}
      <Card
        header={<h2 className="text-lg font-semibold">Financial Overview</h2>}
        className="mb-4"
      >
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-600">Monthly Revenue</h3>
            <p className="text-xl font-semibold">${statistics.monthlyRevenue.toLocaleString()}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-neutral-600">Pending Invoices</h3>
            <p className="text-xl font-semibold">{statistics.pendingInvoices}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewReports}
          fullWidth
        >
          View Reports
        </Button>
      </Card>
      
          
      {/* Staff Section - Only for Boss */} 
      {/* <Card
        header={<h2 className="text-lg font-semibold">Staff Overview</h2>}
        className="mb-4"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-color flex items-center justify-center text-white mr-2">
              👨‍💼
            </div>
            <div>
              <h3 className="text-sm font-medium">Managers</h3>
              <p className="text-xs text-neutral-500">3 active</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-success-color flex items-center justify-center text-white mr-2">
              🧹
            </div>
            <div>
              <h3 className="text-sm font-medium">Cleaners</h3>
              <p className="text-xs text-neutral-500">8 active</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-info-color flex items-center justify-center text-white mr-2">
              💁‍♀️
            </div>
            <div>
              <h3 className="text-sm font-medium">Reception</h3>
              <p className="text-xs text-neutral-500">5 active</p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewUsers}
          fullWidth
        >
          Manage Staff
        </Button>
      </Card> */}
      
    </div>
  );
};

export default BossManagerDashboard;