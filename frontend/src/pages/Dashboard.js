import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import LeaveHistory from '../components/LeaveHistory';
import RequestLeave from '../components/RequestLeave';
import AdminDashboard from '../components/AdminDashboard';
import Footer from '../components/Footer';
import { getApplications } from '../services/api';

function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [leaveMetrics, setLeaveMetrics] = useState({
    allowed: 30,
    used: 0,
    remaining: 30
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const calculateLeaveMetrics = async () => {
      try {
        if (user.role === 'employee') {
          const applications = await getApplications();
          
          // Calculate total used leave days from accepted applications
          const usedDays = applications
            .filter(app => app.status === 'accepted')
            .reduce((total, app) => {
              return total + calculateWorkingDays(app.start_date, app.end_date);
            }, 0);

          setLeaveMetrics({
            allowed: 30,
            used: usedDays,
            remaining: Math.max(30 - usedDays, 0)
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error calculating leave metrics:', error);
        setLoading(false);
      }
    };

    calculateLeaveMetrics();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <LeaveHistory />;
      case 'request-leave':
        return <RequestLeave />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <LeaveHistory />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isAdmin={user?.role === 'admin'}
      />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNavbar 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
          handleLogout={handleLogout}
        />
        
        {/* Leave Metrics */}
        {user.role === 'employee' && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-white shadow-sm">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-sm font-medium text-blue-600 mb-1">
                Leave Days Allowed
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {loading ? '...' : leaveMetrics.allowed}
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
              <div className="text-sm font-medium text-amber-600 mb-1">
                Leave Days Used
              </div>
              <div className="text-2xl font-bold text-amber-700">
                {loading ? '...' : leaveMetrics.used}
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <div className="text-sm font-medium text-green-600 mb-1">
                Leave Days Remaining
              </div>
              <div className="text-2xl font-bold text-green-700">
                {loading ? '...' : leaveMetrics.remaining}
              </div>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderContent()}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Dashboard; 