import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

/**
 * Create Task Page Component
 * 
 * Form interface for creating new tasks with comprehensive configuration options
 * including assignment, prioritization, checklists, and scheduling.
 */
const CreateTask = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Form data and validation state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property: '',
    assignedTo: '',
    priority: 'normal',
    dueDate: '',
    category: 'cleaning',
    checklist: [{ id: Date.now(), text: '', completed: false }]
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock data for dropdowns
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Fetch properties and users for dropdowns
  useEffect(() => {
    // Mock API data - in a real app, this would come from a backend API
    const mockProperties = [
      { id: 1, name: 'Sunrise Hotel' },
      { id: 2, name: 'Mountain View Lodge' },
      { id: 3, name: 'Riverside Resort' },
      { id: 4, name: 'All Properties' }
    ];
    
    const mockUsers = [
      { id: 1, name: 'Sam Wilson', role: 'boss' },
      { id: 2, name: 'Emily Johnson', role: 'manager' },
      { id: 3, name: 'David Lee', role: 'host' },
      { id: 4, name: 'Maria Garcia', role: 'cleaner' },
      { id: 5, name: 'Alex Brown', role: 'receptionist' },
      { id: 6, name: 'James Wilson', role: 'sales' },
      { id: 7, name: 'Sophia Chen', role: 'accountant' },
    ];
    
    setProperties(mockProperties);
    setUsers(mockUsers);
    
    // Initialize due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format as YYYY-MM-DD for the date input
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      dueDate: formattedDate
    }));
  }, []);
  
  /**
   * Validates form data and returns validation errors
   * @returns {Object} Error messages by field
   */
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.property) {
      errors.property = 'Property is required';
    }
    
    if (!formData.assignedTo) {
      errors.assignedTo = 'Assignment is required';
    }
    
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      
      // Reset times to midnight for date comparison
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    // Validate checklist items if any are provided
    if (formData.checklist.length > 0) {
      // Filter out empty items
      const nonEmptyItems = formData.checklist.filter(item => item.text.trim());
      
      if (nonEmptyItems.length === 0) {
        errors.checklist = 'Add at least one checklist item or remove the checklist';
      }
    }
    
    return errors;
  };
  
  /**
   * Handles input changes for form fields
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  /**
   * Handles changes to checklist items
   * @param {number} index - Index of the checklist item
   * @param {Event} e - Input change event
   */
  const handleChecklistChange = (index, e) => {
    const { value } = e.target;
    
    setFormData(prev => {
      const updatedChecklist = [...prev.checklist];
      updatedChecklist[index] = {
        ...updatedChecklist[index],
        text: value
      };
      
      return {
        ...prev,
        checklist: updatedChecklist
      };
    });
    
    // Clear checklist error if any
    if (formErrors.checklist) {
      setFormErrors(prev => ({
        ...prev,
        checklist: undefined
      }));
    }
  };
  
  /**
   * Adds a new empty checklist item
   */
  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      checklist: [
        ...prev.checklist,
        { id: Date.now(), text: '', completed: false }
      ]
    }));
  };
  
  /**
   * Removes a checklist item
   * @param {number} index - Index of the item to remove
   */
  const removeChecklistItem = (index) => {
    setFormData(prev => {
      const updatedChecklist = prev.checklist.filter((_, i) => i !== index);
      
      return {
        ...prev,
        checklist: updatedChecklist
      };
    });
  };
  
  /**
   * Handles form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Filter out empty checklist items
      const filteredChecklist = formData.checklist
        .filter(item => item.text.trim())
        .map(item => ({ ...item, text: item.text.trim() }));
      
      // Prepare task data
      const taskData = {
        ...formData,
        checklist: filteredChecklist,
        createdBy: currentUser.name,
        createdById: currentUser.id,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - in a real app, we would receive the created task ID
      console.log('Created task:', taskData);
      
      // Navigate back to task list
      navigate('/tasks');
    } catch (err) {
      alert('Failed to create task');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="page-container pb-6">
      <div className="flex items-center mb-4">
        <button 
          className="mr-2 p-1 rounded-full hover:bg-neutral-200"
          onClick={() => navigate('/tasks')}
          aria-label="Back to tasks"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">Create New Task</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <h2 className="text-lg font-semibold mb-4">Task Details</h2>
          
          <Input
            id="title"
            name="title"
            label="Task Title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a clear task title"
            error={formErrors.title}
            required
          />
          
          <Input
            id="description"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what needs to be done"
            error={formErrors.description}
            required
            as="textarea"
            rows={3}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-neutral-800">
                Property <span className="text-error-color">*</span>
              </label>
              <select
                id="property"
                name="property"
                value={formData.property}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md border outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 ${
                  formErrors.property 
                    ? 'border-error-color text-error-color focus:border-error-color' 
                    : 'border-neutral-300 focus:border-primary-color'
                }`}
                required
              >
                <option value="">Select Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.name}>
                    {property.name}
                  </option>
                ))}
              </select>
              {formErrors.property && (
                <p className="mt-1 text-sm text-error-color">
                  {formErrors.property}
                </p>
              )}
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-neutral-800">
                Assign To <span className="text-error-color">*</span>
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md border outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 ${
                  formErrors.assignedTo 
                    ? 'border-error-color text-error-color focus:border-error-color' 
                    : 'border-neutral-300 focus:border-primary-color'
                }`}
                required
              >
                <option value="">Select Staff Member</option>
                {users.map((user) => (
                  <option key={user.id} value={user.name}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              {formErrors.assignedTo && (
                <p className="mt-1 text-sm text-error-color">
                  {formErrors.assignedTo}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block mb-1 font-medium text-neutral-800">
                Priority <span className="text-error-color">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
                required
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-neutral-800">
                Due Date <span className="text-error-color">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md border outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 ${
                  formErrors.dueDate 
                    ? 'border-error-color text-error-color focus:border-error-color' 
                    : 'border-neutral-300 focus:border-primary-color'
                }`}
                required
              />
              {formErrors.dueDate && (
                <p className="mt-1 text-sm text-error-color">
                  {formErrors.dueDate}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block mb-1 font-medium text-neutral-800">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-md border border-neutral-300 outline-none transition-colors focus:ring-2 focus:ring-primary-color/30 focus:border-primary-color"
            >
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="guest-service">Guest Service</option>
              <option value="administrative">Administrative</option>
              <option value="inventory">Inventory</option>
            </select>
          </div>
        </Card>
        
        {/* Checklist Section */}
        <Card className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Checklist Items</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addChecklistItem}
            >
              Add Item
            </Button>
          </div>
          
          {formErrors.checklist && (
            <p className="mb-3 text-sm text-error-color">
              {formErrors.checklist}
            </p>
          )}
          
          {formData.checklist.map((item, index) => (
            <div key={item.id} className="flex items-center mb-3 last:mb-0">
              <Input
                id={`checklist-${index}`}
                value={item.text}
                onChange={(e) => handleChecklistChange(index, e)}
                placeholder="Enter checklist item"
                className="mb-0"
              />
              
              <button
                type="button"
                className="ml-2 p-1 rounded-full hover:bg-neutral-200 text-neutral-500"
                onClick={() => removeChecklistItem(index)}
                aria-label="Remove checklist item"
              >
                ✕
              </button>
            </div>
          ))}
          
          {formData.checklist.length === 0 && (
            <p className="text-center py-2 text-neutral-500">
              No checklist items added
            </p>
          )}
        </Card>
        
        {/* Form Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tasks')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;