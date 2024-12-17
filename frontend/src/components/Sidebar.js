import { AiOutlineHome } from 'react-icons/ai';
import { BsCalendarCheck } from 'react-icons/bs';
import { MdAdminPanelSettings } from 'react-icons/md';

function Sidebar({ isOpen, currentPage, setCurrentPage, isAdmin }) {
  const menuItems = [
    { icon: <AiOutlineHome />, text: 'Home', id: 'home' },
    { icon: <BsCalendarCheck />, text: 'Request Leave', id: 'request-leave' },
    ...(isAdmin ? [{ 
      icon: <MdAdminPanelSettings />, 
      text: 'Admin Dashboard', 
      id: 'admin',
    }] : []),
  ];

  return (
    <div className={`fixed md:relative ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}>
      <div className="w-64 md:w-56 h-full bg-gradient-to-b from-sidebar-light to-sidebar-dark text-white 
        shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold tracking-wide">Dashboard</h2>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li 
                key={index} 
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center p-2 rounded-lg cursor-pointer 
                  hover:bg-white/10 transition-all duration-300 hover:translate-x-1
                  ${currentPage === item.id ? 'text-white bg-white/10' : 'text-gray-300'}`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar; 