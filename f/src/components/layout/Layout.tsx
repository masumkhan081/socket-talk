// abc
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
   
const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-green-200 dark:bg-gray-900 brdr">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={logout} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} onLogout={logout} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-green-200 dark:bg-gray-800 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
