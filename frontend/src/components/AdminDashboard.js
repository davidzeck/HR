import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ReviewApplication from './ReviewApplication';
import { getApplications, reviewLeave } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewFilter, setViewFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartView, setChartView] = useState('week'); // 'week' or 'month'

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getApplications();
        setApplications(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError(err.response?.data?.error || 'Failed to fetch applications');
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Function to calculate working days between two dates
  const calculateWorkingDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    const current = new Date(start);

    while (current <= end) {
      // Check if it's a weekday (Monday-Friday)
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    return workingDays;
  };

  // Function to get the current week's dates
  const getCurrentWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust when Sunday
    
    const monday = new Date(now.setDate(diff));
    const weekDates = [];
    
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  };

  // Function to check if a date falls within a leave period
  const isDateInLeavePeriod = (date, startDate, endDate) => {
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset time part for accurate date comparison
    checkDate.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    return checkDate >= start && checkDate <= end;
  };

  // Function to get month names
  const getMonthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthsToShow = months.slice(currentMonth - 5, currentMonth + 1); // Show last 6 months
    return monthsToShow;
  };

  // Calculate leave data for the bar chart
  const calculateChartData = (applications) => {
    if (chartView === 'week') {
      const weekDates = getCurrentWeekDates();
      const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const acceptedApplications = applications.filter(app => app.status === 'accepted');
      
      const dailyCounts = weekDates.map((date) => {
        return acceptedApplications.filter(app => 
          isDateInLeavePeriod(date, app.start_date, app.end_date)
        ).length;
      });

      return {
        labels: weekdayNames,
        datasets: [{
          label: 'Employees on Leave',
          data: dailyCounts,
          backgroundColor: (context) => {
            const value = context.dataset.data[context.dataIndex];
            return value <= 3 ? '#4ADE80' : 
                   value <= 6 ? '#FCD34D' : '#EF4444';
          },
        }],
      };
    } else {
      // Monthly view
      const months = getMonthData();
      const acceptedApplications = applications.filter(app => app.status === 'accepted');
      
      const monthlyCounts = months.map(month => {
        return acceptedApplications.filter(app => {
          const startDate = new Date(app.start_date);
          const monthIndex = startDate.getMonth();
          const monthName = new Date(startDate.getFullYear(), monthIndex).toLocaleString('default', { month: 'short' });
          return monthName === month;
        }).length;
      });

      return {
        labels: months,
        datasets: [{
          label: 'Employees on Leave per Month',
          data: monthlyCounts,
          backgroundColor: '#4ADE80',
        }],
      };
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'All Employees on Leave This Week',
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return `${context[0].label}`;
          },
          label: (context) => {
            const value = context.parsed.y;
            return `${value} employee${value !== 1 ? 's' : ''} on leave`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: (value) => Math.floor(value)
        },
      },
    },
  };

  const filteredApplications = applications.filter(app => {
    const employeeName = app.employee?.name || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Filter based on review status
    const matchesView = viewFilter === 'all' 
      ? true 
      : viewFilter === 'pending' 
        ? app.status === 'pending'
        : app.review?.reviewer?.id === currentUser.id;

    return matchesSearch && matchesStatus && matchesView;
  });

  const handleReview = (applicationId) => {
    const application = applications.find(app => app.leave_application_id === applicationId);
    setSelectedApplication(application);
  };

  const handleUpdateStatus = async (applicationId, newStatus, comments) => {
    try {
      await reviewLeave(applicationId, { status: newStatus.toLowerCase(), comments });
      
      // Update local state
      const updatedApplications = applications.map(app => 
        app.leave_application_id === applicationId 
          ? { ...app, status: newStatus.toLowerCase() }
          : app
      );
      setApplications(updatedApplications);
      setSelectedApplication(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update application status');
    }
  };

  // Function to format duration display
  const formatDuration = (startDate, endDate) => {
    const workingDays = calculateWorkingDays(startDate, endDate);
    return (
      <div>
        <div className="text-sm text-gray-900">
          {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          {workingDays} working day{workingDays !== 1 ? 's' : ''}
        </div>
      </div>
    );
  };

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

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by employee name..."
              className="w-full p-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full p-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="denied">Denied</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full p-2 border rounded-md"
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value)}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending Review</option>
              <option value="reviewed">My Reviews</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Leave Applications Overview
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartView('week')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartView === 'week'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setChartView('month')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartView === 'month'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>
        <div className="h-[400px]"> {/* Increased height */}
          <Bar data={calculateChartData(applications)} options={chartOptions} />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="max-h-[400px] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
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
                  Reviewed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.leave_application_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.employee?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.leave_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDuration(application.start_date, application.end_date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate">
                      {application.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'denied' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.review?.reviewer?.name || 'Not reviewed'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.status === 'pending' && (
                      <button
                        onClick={() => handleReview(application.leave_application_id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApplication && (
        <ReviewApplication
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

export default AdminDashboard; 