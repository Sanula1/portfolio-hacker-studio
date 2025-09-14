import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Login from '@/components/Login';
import { useLocation } from 'react-router-dom';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const { user, login } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    await login({ email: credentials.email, password: credentials.password });
  };

  const handleUserLogin = (userData: any) => {
    console.log('User logged in:', userData);
  };

  // Extract current page from location pathname
  const currentPage = location.pathname.slice(1) || 'dashboard';

  if (!user) {
    return <Login onLogin={handleUserLogin} loginFunction={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex w-full h-screen">
        {/* Desktop Sidebar */}
        <Sidebar 
          currentPage={currentPage}
          onPageChange={() => {}} // Navigation handled by React Router
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header onMenuClick={handleMenuClick} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PageLayout;