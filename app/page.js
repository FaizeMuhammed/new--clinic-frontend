'use client'
import { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import DashboardContent from "@/components/dashboardappointments";
import Sidebar from "@/components/sidebar";
import Doctors from '@/components/doctors';
import { useRouter } from 'next/navigation';
import { Patients } from '@/components/patients';
import { Docanalytics } from '@/components/docanalytics';
import useStore from './store/authstore';

export default function Home() {
  // State to manage the active component
  const [activeComponent, setActiveComponent] = useState('appointments');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { token, userId, initialize } = useStore();
  
  useEffect(() => {
    // Initialize authentication state from localStorage
    initialize();
    
    // Check if user is authenticated
    const checkAuth = () => {
      // Get auth data directly from localStorage as a fallback
      const storedToken = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');
      
      if ((!token && !storedToken) || (!userId && !storedUserId)) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [token, userId, router, initialize]);

  // Don't render content until authentication check is complete
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center h-screen">
        <RotateCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'appointments':
        return <DashboardContent />;
      case 'doctors':
        return <Doctors />;
      case 'patients':
        return <Patients />;
      case 'analytics':
        return <Docanalytics />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with button handlers and activeComponent state */}
      <Sidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      {/* Render the active component */}
      {renderActiveComponent()}
    </div>
  );
}