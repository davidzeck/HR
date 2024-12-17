import { useState } from 'react';
import { requestLeave } from '../services/api';

function RequestLeave() {
  const [formData, setFormData] = useState({
    leaveType: '',
    leaveMode: '',
    reason: '',
    startDate: '',
    endDate: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate dates
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end < start) {
      setError('End date cannot be before start date');
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Format and validate the data
      const leaveData = {
        leaveType: String(formData.leaveType).trim(),
        leaveMode: String(formData.leaveMode).trim(),
        reason: String(formData.reason).trim(),
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      // Validate all required fields
      const requiredFields = ['leaveType', 'leaveMode', 'reason', 'startDate', 'endDate'];
      const missingFields = requiredFields.filter(field => !leaveData[field]);
      
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Additional validation
      if (leaveData.reason.length < 3) {
        setError('Reason must be at least 3 characters long');
        return;
      }

      console.log('Submitting leave request:', leaveData);
      const response = await requestLeave(leaveData);
      
      console.log('Leave request submitted:', response);
      setSuccessMessage('Leave request submitted successfully!');
      
      // Reset form
      setFormData({
        leaveType: '',
        leaveMode: '',
        reason: '',
        startDate: '',
        endDate: ''
      });
      setShowConfirmation(false);
      
    } catch (err) {
      console.error('Failed to submit leave request:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Request Leave</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {!showConfirmation ? (
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Leave
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select leave type</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode of Leave
            </label>
            <select
              name="leaveMode"
              value={formData.leaveMode}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select leave mode</option>
              <option value="full">Full Day</option>
              <option value="half">Half Day</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Application
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              rows="3"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
              transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Confirm Details'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Please confirm your leave request:</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Type of Leave:</span> {formData.leaveType}</p>
              <p><span className="font-medium">Mode of Leave:</span> {formData.leaveMode}</p>
              <p><span className="font-medium">Reason:</span> {formData.reason}</p>
              <p><span className="font-medium">Start Date:</span> {formData.startDate}</p>
              <p><span className="font-medium">End Date:</span> {formData.endDate}</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 
                transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 
                transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestLeave; 