import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/api';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';
import AuthBackground from '../../components/AuthBackground';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await login(formData.email, formData.password);
      
      if (!response || !response.access_token || !response.user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center relative">
      <AuthBackground />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full mx-auto z-10">
          <div className="bg-white/90 backdrop-blur-lg p-8 rounded-xl shadow-2xl space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 text-center">
                Sign in
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                New user?{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg 
                      shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                      focus:border-transparent bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg 
                      shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                      focus:border-transparent bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent 
                    rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200"
                >
                  {isLoading ? 'Signing in...' : 'Continue'}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2.5 
                    border border-gray-300 rounded-lg shadow-sm bg-white text-sm 
                    font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FcGoogle className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2.5 
                    border border-gray-300 rounded-lg shadow-sm bg-white text-sm 
                    font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaFacebook className="h-5 w-5 text-blue-600" />
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2.5 
                    border border-gray-300 rounded-lg shadow-sm bg-white text-sm 
                    font-medium text-gray-500 hover:bg-gray-50"
                >
                  <FaApple className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Get help signing in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 