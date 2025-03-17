import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import Input from '../components/common/Input';

/**
 * Task Details Page Component
 * 
 * Detailed view of a specific task with action controls, status updates,
 * comments, and relevant metadata based on user permissions.
 */
const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();
  
  // Task data and UI state
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  // Fetch task data
  useEffect(() => {
    // Simulate API call
    const fetchTask = async () => {
      try {
        setLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock task data - in a real app, this would come from an API
        const mockTask = {
          id: parseInt(id),
          title: 'Clean room 304',
          description: 'Complete cleaning after guest checkout. Check bathroom, change linens, vacuum floors, dust surfaces, and ensure all amenities are restocked according to hotel standards.',
          property: 'Sunrise Hotel',
          assignedTo: 'Maria Garcia',
          assignedToId: 4,
          priority: 'high',
          status: 'pending',
          createdBy: 'Emily Johnson',
          createdById: 2,
          createdAt: '2025-03-01T08:00:00',
          dueDate: '2025-03-03',
          category: 'cleaning',
          checklist: [
            { id: 1, text: 'Change bed linens', completed: false },
            { id: 2, text: 'Clean bathroom', completed: false },
            { id: 3, text: 'Vacuum floors', completed: false },
            { id: 4, text: 'Dust surfaces', completed: false },
            { id: 5, text: 'Restock amenities', completed: false },
          ],
          comments: [
            { 
              id: 1, 
              user: 'Emily Johnson', 
              role: 'manager',
              avatar: '👩‍💼',
              userId: 2, 
              text: 'Please make sure to check under the bed as the previous guest reported losing an item.', 
              timestamp: '2025-03-01T08:05:00' 
            },
            { 
              id: 2, 
              user: 'Maria Garcia', 
              role: 'cleaner',
              avatar: '🧹',
              userId: 4, 
              text: 'I\'ll check thoroughly and report back if I find anything.', 
              timestamp: '2025-03-01T09:30:00' 
            },
          ],
          history: [
            { action: 'created', user: 'Emily Johnson', timestamp: '2025-03-01T08:00:00' },
            { action: 'assigned', user: 'Emily Johnson', assignee: 'Maria Garcia', timestamp: '2025-03-01T08:00:00' },
          ]
        };
        
        setTask(mockTask);
      } catch (err) {
        setError('Failed to load task details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id]);
  
  /**
   * Handles updating task status
   * @param {string} newStatus - The new status to set
   */
  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdateLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setTask(prevTask => {
        const now = new Date().toISOString();
        
        // Create history entry for status change
        const historyEntry = {
          action: `status-changed-to-${newStatus}`,
          user: currentUser.name,
          timestamp: now
        };
        
        // Update task with new status and history
        return {
          ...prevTask,
          status: newStatus,
          ...(newStatus === 'completed' ? { completedAt: now } : {}),
          history: [...prevTask.history, historyEntry]
        };
      });
    } catch (err) {
      alert('Failed to update task status');
      console.error(err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };
  
  /**
   * Handles checkbox toggle in task checklist
   * @param {number} itemId - ID of the checklist item
   */
  const handleChecklistToggle = (itemId) => {
    setTask(prevTask => {
      // Create updated checklist with toggled item
      const updatedChecklist = prevTask.checklist.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed } 
          : item
      );
      
      // Calculate if all items are completed
      const allCompleted = updatedChecklist.every(item => item.completed);
      
      // Return updated task
      return {
        ...prevTask,
        checklist: updatedChecklist,
        status: allCompleted ? 'completed' : prevTask.status,
        ...(allCompleted && prevTask.status !== 'completed' 
          ? { completedAt: new Date().toISOString() } 
          : {}
        )
      };
    });
  };
  
  /**
   * Handles adding a new comment
   * @param {Event} e - Form submission event
   */
  const handleAddComment = (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    // Create new comment object
    const comment = {
      id: Date.now(), // Use timestamp as temporary ID
      user: currentUser.name,
      role: currentUser.role,
      avatar: currentUser.avatar,
      userId: currentUser.id,
      text: newComment.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Update task with new comment
    setTask(prevTask => ({
      ...prevTask,
      comments: [...prevTask.comments, comment]
    }));
    
    // Clear comment input
    setNewComment('');
  };
  
  /**
   * Formats date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date and time
   */
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Formats relative time for recent items
   * @param {string} dateString - ISO date string
   * @returns {string} Relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
    if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    }
    if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };
  
  // Handle loading state
  if (loading) {
    return (
      <div className="page-container flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-neutral-600">Loading task details...</p>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error || !task) {
    return (
      <div className="page-container flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-error-color mb-4">{error || 'Task not found'}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/tasks')}
          >
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }
  
  /**
   * Determines if the current user can edit this task
   * @returns {boolean} Whether the user can edit the task
   */
  const canEditTask = () => {
    return (
      hasPermission('canCreateTasks') || // Managers and bosses
      currentUser.id === task.assignedToId // Assigned user
    );
  };
  
  /**
   * Calculates task completion percentage
   * @returns {number} Percentage of completed checklist items
   */
  const getCompletionPercentage = () => {
    if (!task.checklist || task.checklist.length === 0) return 0;
    
    const completedItems = task.checklist.filter(item => item.completed).length;
    return Math.round((completedItems / task.checklist.length) * 100);
  };
  
  return (
    <div className="page-container pb-6">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <button 
          className="mr-2 p-1 rounded-full hover:bg-neutral-200"
          onClick={() => navigate('/tasks')}
          aria-label="Back to tasks"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">Task Details</h1>
      </div>
      
      {/* Task Overview Card */}
      <Card className="mb-4">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-semibold">{task.title}</h2>
          <StatusBadge status={task.status} />
        </div>
        
        <p className="text-neutral-600 mb-4">
          {task.description}
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-neutral-500">Property</p>
            <p className="font-medium">{task.property}</p>
          </div>
          
          <div>
            <p className="text-xs text-neutral-500">Assigned To</p>
            <p className="font-medium">{task.assignedTo}</p>
          </div>
          
          <div>
            <p className="text-xs text-neutral-500">Priority</p>
            <StatusBadge status={task.priority} size="sm" />
          </div>
          
          <div>
            <p className="text-xs text-neutral-500">Due Date</p>
            <p className="font-medium">{formatDateTime(task.dueDate).split(',')[0]}</p>
          </div>
          
          <div>
            <p className="text-xs text-neutral-500">Created By</p>
            <p className="font-medium">{task.createdBy}</p>
          </div>
          
          <div>
            <p className="text-xs text-neutral-500">Created On</p>
            <p className="font-medium">{formatDateTime(task.createdAt).split(',')[0]}</p>
          </div>
        </div>
        
        {/* Status Button Controls - Conditional based on permissions and current status */}
        {task.status !== 'completed' && (
          <div className="grid grid-cols-2 gap-3">
            {task.status === 'pending' && (
              <Button
                variant="primary"
                onClick={() => handleStatusUpdate('in-progress')}
                disabled={statusUpdateLoading}
              >
                {statusUpdateLoading ? 'Updating...' : 'Start Task'}
              </Button>
            )}
            
            {task.status === 'in-progress' && (
              <Button
                variant="success"
                onClick={() => handleStatusUpdate('completed')}
                disabled={statusUpdateLoading}
              >
                {statusUpdateLoading ? 'Updating...' : 'Complete Task'}
              </Button>
            )}
            
            {hasPermission('canCreateTasks') && (
              <Button
                variant="outline"
                onClick={() => navigate(`/tasks/edit/${task.id}`)}
              >
                Edit Task
              </Button>
            )}
          </div>
        )}
        
        {/* Completion message for completed tasks */}
        {task.status === 'completed' && task.completedAt && (
          <div className="bg-success-color/10 border border-success-color/30 rounded p-3 text-center">
            <p className="text-success-color font-medium">
              Completed on {formatDateTime(task.completedAt)}
            </p>
          </div>
        )}
      </Card>
      
      {/* Checklist Section */}
      {task.checklist && task.checklist.length > 0 && (
        <Card
          header={
            <div>
              <h2 className="text-lg font-semibold">Checklist</h2>
              <div className="flex items-center text-sm mt-1">
                <div className="w-full h-2 bg-neutral-200 rounded-full mr-3">
                  <div 
                    className="h-full bg-primary-color rounded-full" 
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
                <span>{getCompletionPercentage()}%</span>
              </div>
            </div>
          }
          className="mb-4"
        >
          <div>
            {task.checklist.map((item) => (
              <div 
                key={item.id}
                className="flex items-center py-2 border-b border-neutral-100 last:border-0"
              >
                <input
                  type="checkbox"
                  id={`checklist-item-${item.id}`}
                  checked={item.completed}
                  onChange={() => handleChecklistToggle(item.id)}
                  className="mr-3 h-5 w-5 text-primary-color rounded"
                  disabled={task.status === 'completed'}
                />
                <label 
                  htmlFor={`checklist-item-${item.id}`}
                  className={`text-sm ${item.completed ? 'line-through text-neutral-500' : ''}`}
                >
                  {item.text}
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Comments Section */}
      <Card
        header={<h2 className="text-lg font-semibold">Comments</h2>}
        className="mb-4"
      >
        <div className="mb-4">
          {task.comments && task.comments.length > 0 ? (
            <div>
              {task.comments.map((comment) => (
                <div key={comment.id} className="mb-4 last:mb-0">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-primary-color/10 flex items-center justify-center text-primary-color mr-2 flex-shrink-0">
                      {comment.avatar || comment.user.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="font-medium">{comment.user}</span>
                          <span className="text-xs text-neutral-500 ml-2">
                            {formatRelativeTime(comment.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-neutral-700">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-neutral-500">No comments yet</p>
          )}
        </div>
        
        {/* Add Comment Form */}
        <form onSubmit={handleAddComment}>
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-primary-color/10 flex items-center justify-center text-primary-color mr-2 flex-shrink-0">
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
              />
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Task History */}
      <Card
        header={<h2 className="text-lg font-semibold">Activity Log</h2>}
      >
        {task.history && task.history.length > 0 ? (
          <div>
            {task.history.map((event, index) => (
              <div 
                key={index}
                className="flex items-start py-2 border-b border-neutral-100 last:border-0"
              >
                <div className="h-2 w-2 rounded-full bg-primary-color mt-2 mr-3"></div>
                <div>
                  <p className="text-sm">
                    {event.action === 'created' && `Task created by ${event.user}`}
                    {event.action === 'assigned' && `Task assigned to ${event.assignee} by ${event.user}`}
                    {event.action === 'status-changed-to-in-progress' && `Task started by ${event.user}`}
                    {event.action === 'status-changed-to-completed' && `Task completed by ${event.user}`}
                    {event.action === 'status-changed-to-pending' && `Task reopened by ${event.user}`}
                  </p>
                  <span className="text-xs text-neutral-500">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-neutral-500">No activity recorded</p>
        )}
      </Card>
    </div>
  );
};

export default TaskDetails;