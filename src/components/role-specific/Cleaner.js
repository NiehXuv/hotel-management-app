import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { StatusBadge } from '../common/Badge';

/**
 * Cleaner/Host Dashboard Component
 * 
 * Task-oriented dashboard specialized for cleaning staff and property hosts
 * to manage their daily assignments and track completion status.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.statistics - Task statistics data for dashboard
 */
const CleanerDashboard = ({ statistics }) => {
  const navigate = useNavigate();
  
  // Navigation handlers
  const navigateToTasks = () => navigate('/tasks');
  const navigateToTaskDetails = (taskId) => navigate(`/tasks/${taskId}`);
  
  /**
   * Task data specifically structured for cleaning operations
   * - Organized by priority, property, and time requirements
   * - Includes completion tracking and validation requirements
   */
  const taskData = {
    // Task summary counts
    totalTasks: 8,
    completedTasks: 2,
    pendingTasks: 6,
    criticalTasks: 2,
    
    // Tasks for current day
    todayTasks: [
      { 
        id: 1, 
        title: 'Clean room 304', 
        property: 'Sunrise Hotel', 
        timeEstimate: '30 min',
        priority: 'high', 
        status: 'pending', 
        dueTime: '11:00 AM',
        notes: 'Guest checkout at 10:00. Requires deep cleaning.'
      },
      { 
        id: 2, 
        title: 'Restock toiletries', 
        property: 'Mountain View Lodge', 
        timeEstimate: '45 min',
        priority: 'normal', 
        status: 'pending', 
        dueTime: '12:00 PM',
        notes: 'Check inventory list in storage room.'
      },
      { 
        id: 3, 
        title: 'Fix shower in room 202', 
        property: 'Riverside Resort', 
        timeEstimate: '60 min',
        priority: 'critical', 
        status: 'in-progress', 
        dueTime: '10:30 AM',
        notes: 'Guest reported leak. Tools in maintenance closet.'
      },
      { 
        id: 4, 
        title: 'Replace bedsheets in room 101', 
        property: 'Sunrise Hotel', 
        timeEstimate: '20 min',
        priority: 'normal', 
        status: 'completed', 
        dueTime: '09:00 AM',
        completedAt: '08:45 AM'
      },
    ],
    
    // Performance metrics
    performance: {
      tasksPerDay: 7.5,
      avgCompletionTime: 28, // minutes
      onTimePercentage: 94
    }
  };
  
  /**
   * Calculates task progress percentage
   * @returns {number} Percentage of completed tasks (0-100)
   */
  const calculateTaskProgress = () => {
    return (taskData.completedTasks / taskData.totalTasks) * 100;
  };
  
  /**
   * Renders task progress visualization
   * @returns {JSX.Element} Progress bar with completion percentage
   */
  const renderTaskProgress = () => {
    const progress = calculateTaskProgress();
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>{taskData.completedTasks} completed</span>
          <span>{taskData.totalTasks} total</span>
        </div>
        <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-color" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  /**
   * Formats time in human-readable format with relative indicators
   * @param {string} timeString - Time string to format
   * @returns {Object} Formatted time object with text and styling
   */
  const formatTaskTime = (timeString) => {
    // In a real app, this would compare with current time
    // and return appropriate styling and text
    
    // Mock implementation for demonstration
    const currentHour = new Date().getHours();
    const taskHour = parseInt(timeString.split(':')[0]);
    
    // Default styling
    const result = {
      text: timeString,
      className: 'text-neutral-600'
    };
    
    // Due soon (demonstration only - not accurate time comparison)
    if (taskHour - currentHour === 1) {
      result.text = `Due soon: ${timeString}`;
      result.className = 'text-warning-color font-medium';
    }
    // Overdue (demonstration only)
    else if (taskHour < currentHour) {
      result.text = `Overdue: ${timeString}`;
      result.className = 'text-error-color font-medium';
    }
    
    return result;
  };
  
  return (
    <div className="mb-6">
      {/* Daily Progress */}
      <Card className="mb-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-lg font-semibold">Today's Tasks</h2>
            <p className="text-sm text-neutral-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <StatusBadge 
            status={taskData.criticalTasks > 0 ? 'critical' : 'normal'} 
            size="md"
          >
            {taskData.criticalTasks > 0 ? `${taskData.criticalTasks} Critical` : 'On Track'}
          </StatusBadge>
        </div>
        
        {/* Task Progress Bar */}
        {renderTaskProgress()}
      </Card>
      
      {/* Performance Card */}
      <Card className="mb-6">
        <h2 className="text-md font-semibold mb-3">Your Performance</h2>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-primary-color text-xl font-semibold">
              {taskData.performance.tasksPerDay}
            </p>
            <p className="text-xs text-neutral-600">Tasks/Day</p>
          </div>
          
          <div>
            <p className="text-primary-color text-xl font-semibold">
              {taskData.performance.avgCompletionTime}<span className="text-sm">min</span>
            </p>
            <p className="text-xs text-neutral-600">Avg. Time</p>
          </div>
          
          <div>
            <p className="text-primary-color text-xl font-semibold">
              {taskData.performance.onTimePercentage}%
            </p>
            <p className="text-xs text-neutral-600">On Time</p>
          </div>
        </div>
      </Card>
      
      {/* Task List */}
      <Card
        header={
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Button 
              variant="text" 
              size="sm"
              onClick={navigateToTasks}
            >
              View All
            </Button>
          </div>
        }
      >
        {taskData.todayTasks.map((task) => {
          const timeFormat = formatTaskTime(task.dueTime);
          
          return (
            <div
              key={task.id}
              className="py-3 border-b border-neutral-100 last:border-0"
              onClick={() => navigateToTaskDetails(task.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium">{task.title}</h3>
                <StatusBadge status={task.status} />
              </div>
              
              <p className="text-sm text-neutral-600 mb-1">{task.property}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <StatusBadge status={task.priority} size="sm" />
                  <span className="text-xs ml-2">{task.timeEstimate}</span>
                </div>
                
                {task.status !== 'completed' ? (
                  <span className={`text-xs ${timeFormat.className}`}>
                    {timeFormat.text}
                  </span>
                ) : (
                  <span className="text-xs text-success-color">
                    Completed at {task.completedAt}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        <Button 
          variant="primary"
          fullWidth
          className="mt-3"
          onClick={navigateToTasks}
        >
          Start Next Task
        </Button>
      </Card>
    </div>
  );
};

export default CleanerDashboard;