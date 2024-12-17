import { useState } from 'react';

function ReviewApplication({ application, onClose, onUpdateStatus }) {
  const [comments, setComments] = useState('');
  
  // Calculate metrics based on actual application data
  const leaveMetrics = {
    currentOnLeave: 5,
    leaveRating: calculateLeaveRating(application),
    remainingLeaveDays: 15
  };

  function calculateLeaveRating(application) {
    // Calculate rating based on actual application data
    let rating = 0;
    
    // Type of leave rating
    switch (application.leave_type.toLowerCase()) {
      case 'annual':
        rating += 3;
        break;
      case 'sick':
        rating += 4;
        break;
      case 'personal':
        rating += 2;
        break;
      default:
        rating += 1;
    }

    // Duration rating
    const startDate = new Date(application.start_date);
    const endDate = new Date(application.end_date);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (duration <= 3) rating += 3;
    else if (duration <= 5) rating += 2;
    else rating += 1;

    return Math.min(rating, 5); // Rating out of 5
  }

  const handleStatusUpdate = (status) => {
    onUpdateStatus(application.leave_application_id, status, comments);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Review Leave Application</h2>
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Currently On Leave</h3>
            <p className="text-2xl font-bold text-blue-900">{leaveMetrics.currentOnLeave}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Leave Rating</h3>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-green-900">{leaveMetrics.leaveRating}</p>
              <span className="text-sm text-green-700 ml-1">/5</span>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Remaining Leave Days</h3>
            <p className="text-2xl font-bold text-purple-900">{leaveMetrics.remainingLeaveDays}</p>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-800 mb-4">Application Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Employee Name</p>
              <p className="font-medium">{application.employee?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Leave Type</p>
              <p className="font-medium">{application.leave_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">
                {new Date(application.start_date).toLocaleDateString()} to {new Date(application.end_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Status</p>
              <p className="font-medium">{application.status}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Reason</p>
              <p className="font-medium">{application.reason}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 
              focus:border-blue-500 h-32"
            placeholder="Add your comments here..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => handleStatusUpdate('denied')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
              transition-colors"
          >
            Deny
          </button>
          <button
            onClick={() => handleStatusUpdate('accepted')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
              transition-colors"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewApplication; 