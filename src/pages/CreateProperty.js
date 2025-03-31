import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const CreateProperty = () => {
    const [propertyData, setPropertyData] = useState({
        name: '',
        description: '',
        location: '',
        email: '',
        phoneNumber: '',
        roomTypes: [''],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e, index) => {
        if (e.target.name === 'roomTypes') {
            const newRoomTypes = [...propertyData.roomTypes];
            newRoomTypes[index] = e.target.value;
            setPropertyData({ ...propertyData, roomTypes: newRoomTypes });
        } else {
            setPropertyData({ ...propertyData, [e.target.name]: e.target.value });
        }
    };

    const addRoomType = () => {
        setPropertyData({
            ...propertyData,
            roomTypes: [...propertyData.roomTypes, '']
        });
    };

    const removeRoomType = (index) => {
        if (propertyData.roomTypes.length > 1) {
            const newRoomTypes = propertyData.roomTypes.filter((_, i) => i !== index);
            setPropertyData({ ...propertyData, roomTypes: newRoomTypes });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!propertyData.name) errors.name = 'Property name is required';
        if (!propertyData.description) errors.description = 'Description is required';
        if (!propertyData.location) errors.location = 'Location is required';
        if (!propertyData.email) errors.email = 'Email is required';
        if (!propertyData.phoneNumber) errors.phoneNumber = 'Phone number is required';
        if (propertyData.roomTypes.length === 0 || propertyData.roomTypes.every(type => !type.trim())) {
            errors.roomTypes = 'At least one room type is required';
        }

        // Check for duplicate room types
        const trimmedRoomTypes = propertyData.roomTypes.map(type => type.trim().toLowerCase());
        const duplicateRoomTypes = trimmedRoomTypes.filter((type, index) => trimmedRoomTypes.indexOf(type) !== index);
        if (duplicateRoomTypes.length > 0) {
            errors.roomTypes = 'Room types must be unique';
        }

        setError(Object.values(errors)[0] || '');
        return Object.keys(errors).length === 0;
    };

    const handleCreateProperty = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!validateForm()) return;

        const payload = {
            name: propertyData.name,
            description: propertyData.description,
            location: propertyData.location,
            email: propertyData.email,
            phoneNumber: propertyData.phoneNumber,
            roomTypes: propertyData.roomTypes.filter(type => type.trim() !== ''),
        };
        console.log("Sending to backend:", payload);

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/hotel/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log("Response from backend:", data);

            if (response.ok && data.success) {
                setSuccessMessage('Property created successfully!');
                setPropertyData({
                    name: '',
                    description: '',
                    location: '',
                    email: '',
                    phoneNumber: '',
                    roomTypes: [''],
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
        <div className="container">
            {/* ... (các phần mã CSS và Card không thay đổi) */}
            <Card
                header={<h2>Create a New Property</h2>}
                className="card"
                bodyClassName="card-body"
            >
                <form onSubmit={handleCreateProperty} className="form">
                    {/* ... (các phần mã Input không thay đổi) */}

                    {/* Room Types Section */}
                    <div className="room-types-section">
                        <label className="label">Room Types</label>
                        {propertyData.roomTypes.map((roomType, index) => (
                            <div key={index} className="room-type-row">
                                <Input
                                    name="roomTypes"
                                    value={roomType}
                                    onChange={(e) => handleChange(e, index)}
                                    required
                                    placeholder={`Room type ${index + 1} (e.g., Single, Double)`}
                                    className="room-type-input"
                                />
                                {propertyData.roomTypes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRoomType(index)}
                                        className="remove-room-type-btn"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addRoomType}
                            className="add-room-type-btn"
                        >
                            Add Room Type
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="submit-btn"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Property'}
                    </button>
                </form>

                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
            </Card>
        </div>
    );
};

export default CreateProperty;