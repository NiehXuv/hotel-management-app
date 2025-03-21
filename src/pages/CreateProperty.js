import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const CreateProperty = () => {
  const [propertyData, setPropertyData] = useState({
    name: '',
    description: '',
    location: '',
    email: '',
    phoneNumber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setPropertyData({ ...propertyData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!propertyData.name) errors.name = 'Property name is required';
    if (!propertyData.description) errors.description = 'Description is required';
    if (!propertyData.location) errors.location = 'Location is required';
    if (!propertyData.email) errors.email = 'Email is required';
    if (!propertyData.phoneNumber) errors.phoneNumber = 'Phone number is required';

    setError(Object.values(errors)[0] || '');
    return Object.keys(errors).length === 0;
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/hotel/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Property created successfully!');
        setPropertyData({
          name: '',
          description: '',
          location: '',
          email: '',
          phoneNumber: '',
        });
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(data.error || 'Failed to create property');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-lg mt-6">
      <Card
        header={<h2 className="text-xl font-bold">Create a New Property</h2>}
        className="shadow-lg rounded-lg border border-neutral-200"
        bodyClassName="p-4"
      >
        <form onSubmit={handleCreateProperty} className="space-y-4">
          {/* Property Name */}
          <Input
            name="name"
            label="Property Name"
            value={propertyData.name}
            onChange={handleChange}
            required
            placeholder="Enter property name"
          />

          {/* Description */}
          <Input
            name="description"
            label="Description"
            value={propertyData.description}
            onChange={handleChange}
            required
            placeholder="Enter description"
          />

          {/* Location */}
          <Input
            name="location"
            label="Location"
            value={propertyData.location}
            onChange={handleChange}
            required
            placeholder="Enter location"
          />

          {/* Email */}
          <Input
            name="email"
            label="Email"
            type="email"
            value={propertyData.email}
            onChange={handleChange}
            required
            placeholder="Enter email"
          />

          {/* Phone Number */}
          <Input
            name="phoneNumber"
            label="Phone Number"
            type="tel"
            value={propertyData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="Enter phone number"
          />

          {/* Submit Button */}
          <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Property'}
          </Button>
        </form>

        {/* Success/Error Messages */}
        {successMessage && <p className="text-green-500 mt-3">{successMessage}</p>}
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </Card>
    </div>
  );
};

export default CreateProperty;