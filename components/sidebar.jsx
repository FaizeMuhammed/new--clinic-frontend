'use client';

import React, { useState, useContext } from 'react';
import Image from 'next/image';
import { Calendar, Users, UserRound, LogOut, Menu, X, BarChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useStore from '../app/store/authstore'; // Adjust the path if needed

const Sidebar = ({activeComponent, setActiveComponent}) => {
 
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logout = useStore(state => state.logout);

  if(activeComponent){
    console.log('.');
  }

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Clear state with Zustand store
        logout();
        // Redirect to login
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const NavItems = () => (
    <ul className="space-y-4">
      <li>
        <button
          onClick={() => {
            setActiveComponent('appointments');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group w-full"
        >
          <Calendar className="group-hover:text-indigo-300 transition-colors w-5 h-5" />
          <span className="group-hover:text-indigo-300 transition-colors font-medium">
            Appointments
          </span>
        </button>
      </li>
      <li>
        <button 
          onClick={() => {
            setActiveComponent('doctors');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group w-full"
        >
          <UserRound className="group-hover:text-indigo-300 transition-colors w-5 h-5" />
          <span className="group-hover:text-indigo-300 transition-colors font-medium">
            Doctors
          </span>
        </button>
      </li>
      <li>
        <button 
          onClick={() => {
            setActiveComponent('patients');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group w-full"
        >
          <Users className="group-hover:text-indigo-300 transition-colors w-5 h-5" />
          <span className="group-hover:text-indigo-300 transition-colors font-medium">
            Patients
          </span>
        </button>
      </li>
      <li>
        <button 
          onClick={() => {
            setActiveComponent('analytics');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group w-full"
        >
          <BarChart className="group-hover:text-indigo-300 transition-colors w-5 h-5" />
          <span className="group-hover:text-indigo-300 transition-colors font-medium">
            Analytics
          </span>
        </button>
      </li>
    </ul>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed inset-0 bg-gradient-to-b from-indigo-600 via-indigo-900 to-indigo-900 
        z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="py-8 px-6 border-b border-indigo-700/50 flex justify-center items-center">
            <div className="relative w-full flex justify-center">
              <Image
                src="/Screenshot_2025-02-11_080236-removebg-preview.png"
                alt="Brandname"
                width={200}
                height={100}
                style={{
                  maxWidth: "85%",
                  height: "auto",
                  objectFit: "contain"
                }}
                className="drop-shadow-lg"
              />
            </div>
          </div>

          <nav className="flex-1 px-6 py-8">
            <NavItems />
          </nav>

          <div className="px-6 py-6 border-t border-indigo-700/50">
            <button 
              onClick={handleLogout} 
              className="flex items-center space-x-4 px-4 py-3 w-full rounded-xl hover:bg-white/10 transition-all duration-300 group mb-6"
            >
              <LogOut className="group-hover:text-red-300 transition-colors w-5 h-5"  />
              <span className="group-hover:text-red-300 transition-colors font-medium">
                Logout
              </span>
            </button>

            <div className="text-center">
              <p className="text-sm font-light text-indigo-300/70 tracking-wide">
                Powered by
                <span className="font-medium text-indigo-300 ml-1">
                  Brandname
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-62 bg-gradient-to-b from-indigo-600 via-indigo-900 to-indigo-900 text-white shadow-xl flex-col">
        <div className="py-8 px-6 border-b border-indigo-700/50 flex justify-center items-center">
          <div className="relative w-full flex justify-center">
            <Image
              src="/Screenshot_2025-02-11_080236-removebg-preview.png"
              alt="Brandname"
              width={200}
              height={100}
              style={{
                maxWidth: "85%",
                height: "auto",
                objectFit: "contain"
              }}
              className="drop-shadow-lg"
            />
          </div>
        </div>

        <nav className="flex-1 px-6 py-8">
          <NavItems />
        </nav>

        <div className="px-6 py-6 border-t border-indigo-700/50">
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-4 px-4 py-3 w-full rounded-xl hover:bg-white/10 transition-all duration-300 group mb-6"
          >
            <LogOut className="group-hover:text-red-300 transition-colors w-5 h-5" />
            <span className="group-hover:text-red-300 transition-colors font-medium">
              Logout
            </span>
          </button>

          <div className="text-center flex items-center">
            <p className="text-sm font-light text-indigo-300/70 tracking-wide">
              Powered by-
              
            </p>
            <Image
                src="/Screenshot_2025-02-18_000947-removebg-preview.png"
                alt="Brandname"
                width={80}
                height={40}
                style={{
                  maxWidth: "85%",
                  height: "auto",
                  objectFit: "contain"
                }}
                className="drop-shadow-lg"
              />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;