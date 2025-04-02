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
        roomTypes: [{ 
            Type: '', 
            PriceByHour: '', 
            PriceBySection: '', 
            PriceByNight: '' 
        }],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e, index, field) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
        if (e.target.name === 'roomTypes') {
            const newRoomTypes = [...propertyData.roomTypes];
            newRoomTypes[index][field] = value;
            setPropertyData({ ...propertyData, roomTypes: newRoomTypes });
        } else {
            setPropertyData({ ...propertyData, [e.target.name]: value });
        }
    };

    const addRoomType = () => {
        setPropertyData({
            ...propertyData,
            roomTypes: [...propertyData.roomTypes, { 
                Type: '', 
                PriceByHour: '', 
                PriceBySection: '', 
                PriceByNight: '' 
            }],
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
        
        const roomTypeErrors = propertyData.roomTypes.map(room => ({
            Type: !room.Type.trim() ? 'Room type is required' : '',
            PriceByHour: room.PriceByHour === '' || room.PriceByHour < 0 ? 'Valid hourly price is required' : '',
            PriceBySection: room.PriceBySection === '' || room.PriceBySection < 0 ? 'Valid section price is required' : '',
            PriceByNight: room.PriceByNight === '' || room.PriceByNight < 0 ? 'Valid nightly price is required' : ''
        }));

        if (propertyData.roomTypes.length === 0 || roomTypeErrors.some(error => 
            error.Type || error.PriceByHour || error.PriceBySection || error.PriceByNight
        )) {
            errors.roomTypes = 'All room types must have valid type and prices';
        }

        setError(Object.values(errors)[0] || 
            roomTypeErrors.find(e => e.Type || e.PriceByHour || e.PriceBySection || e.PriceByNight) || '');
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
            roomTypes: propertyData.roomTypes.map(room => ({
                Type: room.Type.trim(),
                PriceByHour: Number(room.PriceByHour),
                PriceBySection: Number(room.PriceBySection),
                PriceByNight: Number(room.PriceByNight)
            })).filter(room => room.Type !== ''),
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
                    roomTypes: [{ Type: '', PriceByHour: '', PriceBySection: '', PriceByNight: '' }],
                });
                setTimeout(() => navigate('/properties'), 1000);
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
            <style>
                {`
                    .container {
                        width: 100vw;
                        max-width: 480px;
                        margin: 0 auto;
                        padding: 2rem;
                        padding-bottom: calc(1rem + var(--footer-height));
                        min-height: 100vh;
                        box-sizing: border-box;
                    }

                    .form {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }

                    .room-types-section {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    .room-type-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr 1fr 60px;
                        align-items: center;
                        gap: 6px;
                    }

                    .room-type-input {
                        min-width: 0;
                        font-size: 12px;
                    }

                    .room-type-input::placeholder {
                        font-size: 12px;
                    }

                    .add-room-type-btn,
                    .remove-room-type-btn,
                    .submit-btn {
                        padding: 6px 12px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                        transition: background-color 0.2s;
                    }

                    .add-room-type-btn {
                        background-color: #007bff;
                        color: white;
                    }

                    .add-room-type-btn:hover {
                        background-color: #0056b3;
                    }

                    .remove-room-type-btn {
                        background-color: #dc3545;
                        color: white;
                        display: flex; /* Added to center text */
                        justify-content: center; /* Center horizontally */
                        align-items: center; /* Center vertically */
                    }

                    .remove-room-type-btn:hover {
                        background-color: #b02a37;
                    }

                    .submit-btn {
                        background-color: #28a745;
                        color: white;
                        padding: 10px;
                        width: 100%;
                    }

                    .submit-btn:hover {
                        background-color: #218838;
                    }

                    .submit-btn:disabled {
                        background-color: #6c757d;
                        cursor: not-allowed;
                    }

                    .success-message {
                        color: #28a745;
                        margin-top: 12px;
                        text-align: center;
                    }

                    .error-message {
                        color: #dc3545;
                        margin-top: 12px;
                        text-align: center;
                    }

                    .label {
                        display: block;
                        font-size: 13px;
                        font-weight: 500;
                        color: #333;
                        margin-bottom: 4px;
                    }

                    @media (max-width: 480px) {
                        .room-type-row {
                            grid-template-columns: 1fr;
                            gap: 12px;
                        }
                        
                        .remove-room-type-btn {
                            width: 100%;
                            display: flex; /* Ensure centering on mobile */
                            justify-content: center;
                            align-items: center;
                        }

                        .room-type-input {
                            font-size: 14px;
                        }

                        .room-type-input::placeholder {
                            font-size: 14px;
                        }
                    }
                `}
            </style>

            <Card
                header={<h2>Create a New Property</h2>}
                className="card"
                bodyClassName="card-body"
            >
                <form onSubmit={handleCreateProperty} className="form">
                    <Input
                        name="name"
                        label="Property Name"
                        value={propertyData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter property name"
                    />
                    <Input
                        name="description"
                        label="Description"
                        value={propertyData.description}
                        onChange={handleChange}
                        required
                        placeholder="Enter description"
                    />
                    <Input
                        name="location"
                        label="Location"
                        value={propertyData.location}
                        onChange={handleChange}
                        required
                        placeholder="Enter location"
                    />
                    <Input
                        name="email"
                        label="Email"
                        type="email"
                        value={propertyData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter email"
                    />
                    <Input
                        name="phoneNumber"
                        label="Phone Number"
                        type="tel"
                        value={propertyData.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="Enter phone number"
                    />

                    {/* Room Types Section */}
                    <div className="room-types-section">
                        <label className="label">Room Types</label>
                        {propertyData.roomTypes.map((roomType, index) => (
                            <div key={index} className="room-type-row">
                                <Input
                                    name="roomTypes"
                                    value={roomType.Type}
                                    onChange={(e) => handleChange(e, index, 'Type')}
                                    required
                                    placeholder={`Type ${index + 1}`}
                                    className="room-type-input"
                                />
                                <Input
                                    name="roomTypes"
                                    type="number"
                                    value={roomType.PriceByHour}
                                    onChange={(e) => handleChange(e, index, 'PriceByHour')}
                                    required
                                    placeholder="Hourly"
                                    min="0"
                                    step="0.01"
                                    className="room-type-input"
                                />
                                <Input
                                    name="roomTypes"
                                    type="number"
                                    value={roomType.PriceBySection}
                                    onChange={(e) => handleChange(e, index, 'PriceBySection')}
                                    required
                                    placeholder="Section"
                                    min="0"
                                    step="0.01"
                                    className="room-type-input"
                                />
                                <Input
                                    name="roomTypes"
                                    type="number"
                                    value={roomType.PriceByNight}
                                    onChange={(e) => handleChange(e, index, 'PriceByNight')}
                                    required
                                    placeholder="Nightly"
                                    min="0"
                                    step="0.01"
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