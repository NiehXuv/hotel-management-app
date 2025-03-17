import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { StatusBadge } from '../components/common/Badge';

/**
 * Tasks Page Component
 * 
 * Comprehensive task management interface allowing users to view, filter,
 * and interact with tasks based on their role permissions.
 */
const Tasks = () => {
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('dueDate-asc');
  
  // Mock tasks data
  // In a real application, this would be fetched from an API
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Clean room 304', 
      description: 'Complete cleaning after guest checkout. Check bathroom, change linens, vacuum floors.',
      property: 'Sunrise Hotel', 
      assignedTo: 'Maria Garcia',
      assignedToId: 4,
      priority: 'high', 
      status: 'pending', 
      createdBy: 'Emily Johnson',
      createdById: 2,
      createdAt: '2025-03-01T08:00:00',
      dueDate: '2025-03-03',
      category: 'cleaning'
    },
    { 
      id: 2, 
      title: 'Restock toiletries', 
      description: 'Check inventory and restock all room toiletries. Coordinate with suppliers if stock is low.',
      property: 'Mountain View Lodge', 
      assignedTo: 'Maria Garcia',
      assignedToId: 4,
      priority: 'normal', 
      status: 'pending', 
      createdBy: 'Emily Johnson',
      createdById: 2,
      createdAt: '2025-03-01T09:15:00',
      dueDate: '2025-03-02',
      category: 'inventory'
    },
    { 
      id: 3, 
      title: 'Fix shower in room 202', 
      description: 'Repair leaking showerhead and check water pressure. Guest reported issues with temperature control.',
      property: 'Riverside Resort', 
      assignedTo: 'David Lee',
      assignedToId: 3,
      priority: 'critical', 
      status: 'in-progress', 
      createdBy: 'Sam Wilson',
      createdById: 1,
      createdAt: '2025-03-01T07:30:00',
      dueDate: '2025-03-02',
      category: 'maintenance'
    },
    { 
      id: 4, 
      title: 'Replace bedsheets in room 101', 
      description: 'Standard sheet replacement for extended stay guest. Use the premium cotton sheets.',
      property: 'Sunrise Hotel', 
      assignedTo: 'Maria Garcia',
      assignedToId: 4,
      priority: 'normal', 
      status: 'completed', 
      createdBy: 'Emily Johnson',
      createdById: 2,
      createdAt: '2025-02-28T14:00:00',
      dueDate: '2025-03-01',
      completedAt: '2025-03-01T08:45:00',
      category: 'cleaning'
    },
    { 
      id: 5, 
      title: 'Process weekly payroll', 
      description: 'Calculate staff hours and process weekly payroll for all departments.',
      property: 'All Properties', 
      assignedTo: 'Sophia Chen',
      assignedToId: 7,
      priority: 'high', 
      status: 'pending', 
      createdBy: 'Sam Wilson',
      createdById: 1,
      createdAt: '2025-03-01T10:00:00',
      dueDate: '2025-03-04',
      category: 'administrative'
    },
    { 
      id: 6, 
      title: 'Update room pricing', 
      description: 'Adjust weekend rates for upcoming holiday season across all room types.',
      property: 'All Properties', 
      assignedTo: 'James Wilson',
      assignedToId: 6,
      priority: 'normal', 
      status: 'pending', 
      createdBy: 'Sam Wilson',
      createdById: 1,
      createdAt: '2025-03-01T11:30:00',
      dueDate: '2025-03-05',
      category: 'administrative'
    },
    { 
      id: 7, 
      title: 'Guest complaint in room 415', 
      description: 'Follow up on noise complaint. Speak with guests in adjacent rooms and resolve issue.',
      property: 'Mountain View Lodge', 
      assignedTo: 'Alex Brown',
      assignedToId: 5,
      priority: 'high', 
      status: 'completed', 
      createdBy: 'Emily Johnson',
      createdById: 2,
      createdAt: '2025-03-01T07:00:00',
      dueDate: '2025-03-01',
      completedAt: '2025-03-01T09:20:00',
      category: 'guest-service'
    },
    { 
      id: 8, 
      title: 'Prepare monthly financial report', 
      description: 'Compile revenue and expense data for March and prepare executive summary.',
      property: 'All Properties', 
      assignedTo: 'Sophia Chen',
      assignedToId: 7,
      priority: 'high', 
      status: 'pending', 
      createdBy: 'Sam Wilson',
      createdById: 1,
      createdAt: '2025-03-01T13:45:00',
      dueDate: '2025-03-10',
      category: 'administrative'
    },
  ]);
  
  /**
   * Filter and sort tasks based on current filter state
   * Performs multi-criteria filtering and sorting
   * 
   * @returns {Array} Filtered and sorted tasks
   */
  const getFilteredTasks = () => {
    return tasks
      // First, filter by assignment if needed
      .filter(task => {
        // Show all tasks for managers and bosses
        if (currentUser.role === 'boss' || currentUser.role === 'manager') {
          return true;
        }
        // For others, show only their assigned tasks
        return task.assignedToId === currentUser.id;
      })
      // Then filter by search term
      .filter(task => {
        if (!searchTerm.trim()) return true;
        
        const lowerCaseSearch = searchTerm.toLowerCase();
        return (
          task.title.toLowerCase().includes(lowerCaseSearch) ||
          task.property.toLowerCase().includes(lowerCaseSearch) ||
          task.description.toLowerCase().includes(lowerCaseSearch)
        );
      })
      // Then filter by status
      .filter(task => {
        if (statusFilter === 'all') return true;
        return task.status === statusFilter;
      })
      // Then filter by priority
      .filter(task => {
        if (priorityFilter === 'all') return true;
        return task.priority === priorityFilter;
      })
      // Finally, sort the filtered tasks
      .sort((a, b) => {
        const [sortField, sortDirection] = sortOrder.split('-');
        
        if (sortField === 'dueDate') {
          const dateA = new Date(a.dueDate);
          const dateB = new Date(b.dueDate);
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        if (sortField === 'priority') {
          const priorityOrder = { critical: 3, high: 2, normal: 1, low: 0 };
          return sortDirection === 'asc' 
            ? priorityOrder[a.priority] - priorityOrder[b.priority]
            : priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        
        if (sortField === 'status') {
          const statusOrder = { 'pending': 0, 'in-progress': 1, 'completed': 2 };
          return sortDirection === 'asc'
            ? statusOrder[a.status] - statusOrder[b.status]
            : statusOrder[b.status] - statusOrder[a.status];
        }
        
        return 0;
      });
  };
  
  // Get filtered tasks
  const filteredTasks = getFilteredTasks();
  
  /**
   * Handles search input changes
   * @param {Event} e - Input change event
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  /**
   * Handles filter changes
   * @param {string} filterType - Type of filter to change
   * @param {string} value - New filter value
   */
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'priority':
        setPriorityFilter(value);
        break;
      case 'sort':
        setSortOrder(value);
        break;
      default:
        break;
    }
  };
  
  /**
   * Navigates to task creation page
   * Only available for users with appropriate permissions
   */
  const handleCreateTask = () => {
    navigate('/tasks/create');
  };
  
  /**
   * Navigates to task details page
   * @param {number} taskId - ID of the task to view
   */
  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };
  
  /**
   * Formats due date with visual indicators for urgency
   * @param {string} dateString - ISO date string
   * @returns {Object} Formatted date with text and styling
   */
  const formatDueDate = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Set time to 00:00:00 for accurate date comparison
    today.setHours(0, 0, 0, 0);
    
    const formattedDate = dueDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Calculate days difference
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Styling based on urgency
    if (daysDiff < 0) {
      return {
        text: `Overdue: ${formattedDate}`,
        className: 'text-error-color font-medium'
      };
    } else if (daysDiff === 0) {
      return {
        text: `Due Today!`,
        className: 'text-warning-color font-medium'
      };
    } else if (daysDiff === 1) {
      return {
        text: `Due Tomorrow`,
        className: 'text-warning-color'
      };
    } else {
      return {
        text: `Due: ${formattedDate}`,
        className: 'text-neutral-600'
      };
    }
  };
  
  return (
    <div className="page-container pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Tasks</h1>
        
        {hasPermission('canCreateTasks') && (
          <Button 
            variant="primary"
            size="sm"
            onClick={handleCreateTask}
          >
            Create Task
          </Button>
        )}
      </div>
      
      {/* Search and Filters */}
      <Card className="mb-4">
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={handleSearchChange}
          startIcon={<span>🔍</span>}
          className="mb-3"
        />
        
        <div className="grid grid-cols-3 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Status
            </label>
            <select 
              className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Priority
            </label>
            <select 
              className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
              value={priorityFilter}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {/* Sort Order */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Sort By
            </label>
            <select 
              className="w-full px-2 py-1.5 rounded-md border border-neutral-300 text-sm"
              value={sortOrder}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="dueDate-asc">Due: Earliest</option>
              <option value="dueDate-desc">Due: Latest</option>
              <option value="priority-desc">Priority: Highest</option>
              <option value="priority-asc">Priority: Lowest</option>
              <option value="status-asc">Status: Pending First</option>
              <option value="status-desc">Status: Completed First</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* Task List */}
      <div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const dueDate = formatDueDate(task.dueDate);
            
            return (
              <Card
                key={task.id}
                className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewTask(task.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-medium">{task.title}</h2>
                  <StatusBadge status={task.status} />
                </div>
                
                <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                  {task.description}
                </p>
                
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{task.property}</span>
                  <StatusBadge status={task.priority} size="sm" />
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">
                    Assigned to: {task.assignedTo}
                  </span>
                  <span className={dueDate.className}>
                    {dueDate.text}
                  </span>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-6">
            <p className="text-neutral-600 mb-2">No tasks match your filters</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;