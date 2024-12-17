import React from 'react';
import './TopNavbar.css';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';
import { IoMdArrowDropdown, IoMdMenu } from 'react-icons/io';

const TopNavbar = ({ 
    onMenuClick, 
    user,
    handleLogout 
}) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <div className="bg-white shadow-sm border-b px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden mr-4 text-gray-600 hover:text-gray-800"
                >
                    <IoMdMenu size={24} />
                </button>
                <h1 className="text-lg font-semibold text-gray-800">COMPANY LOGO</h1>
            </div>
            
            <div className="flex items-center space-x-4">
                {user ? (
                    <div className="flex items-center">
                        <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg 
                            hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                            <CgProfile className="text-gray-600 text-xl" />
                            <div className="mx-2">
                                <div className="text-sm font-medium text-gray-800">{user?.username}</div>
                                <div className="text-xs text-gray-500">{user?.role}</div>
                            </div>
                            <IoMdArrowDropdown className="text-gray-600" />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-4 px-4 py-2 text-gray-600 hover:text-gray-800 
                                font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={handleLogin}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 
                                font-medium transition-colors"
                        >
                            Login
                        </button>
                        <button 
                            onClick={handleRegister}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                                hover:bg-blue-700 transition-colors font-medium"
                        >
                            Register
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopNavbar; 