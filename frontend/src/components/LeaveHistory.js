import React, { useState, useEffect } from 'react';
import { getApplications } from '../services/api';

const LeaveHistory = () => {
    const [applications, setApplications] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const data = await getApplications();
                // For admin, show applications they've reviewed
                if (user.role === 'admin') {
                    console.log('Current user ID:', user.id);
                    const reviewedApplications = data.filter(app => {
                        // Debug logging
                        console.log('Application:', app);
                        console.log('Review:', app.review);
                        console.log('Reviewer ID:', app.review?.reviewer?.id);
                        
                        return app.review && 
                               app.review.reviewer && 
                               Number(app.review.reviewer.id) === Number(user.id) &&
                               (app.status === 'accepted' || app.status === 'denied');
                    });
                    console.log('Filtered applications:', reviewedApplications);
                    setApplications(reviewedApplications);
                } else {
                    // For employees, show all their applications
                    setApplications(data);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching applications:', err);
                setError(err.response?.data?.error || 'Failed to fetch applications');
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-700 bg-red-100 rounded-md">
                {error}
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-semibold mb-4">
                    {user.role === 'admin' ? 'My Reviewed Applications' : 'Leave History'}
                </h2>
                <p className="text-gray-500">
                    {user.role === 'admin' 
                        ? 'No applications reviewed yet.' 
                        : 'No leave applications found.'}
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-6">
                {user.role === 'admin' ? 'My Reviewed Applications' : 'Leave History'}
            </h2>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {user.role === 'admin' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee
                                    </th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Leave Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mode
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Review Date
                                </th>
                                {user.role === 'admin' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Comments
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map((application) => (
                                <tr key={application.leave_application_id} className="hover:bg-gray-50">
                                    {user.role === 'admin' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{application.employee?.name}</div>
                                            <div className="text-xs text-gray-500">{application.employee?.department}</div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {application.leave_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {application.leave_mode}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>
                                            {new Date(application.start_date).toLocaleDateString()} to{' '}
                                            {new Date(application.end_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="max-w-xs truncate">
                                            {application.reason}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${application.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                              application.status === 'denied' ? 'bg-red-100 text-red-800' : 
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {application.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {application.review?.review_date 
                                            ? new Date(application.review.review_date).toLocaleDateString()
                                            : 'N/A'}
                                    </td>
                                    {user.role === 'admin' && (
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="max-w-xs truncate">
                                                {application.review?.comments || 'No comments'}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveHistory; 