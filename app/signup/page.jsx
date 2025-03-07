'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, AlertCircle, Loader2, UserPlus, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import API from '../utils/api';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      // Updated to match the backend endpoint '/register'
      const response = await API.post('https://api.nexcard.co.in/auth/register', formData);
      toast.success(response.data.message || 'Account created successfully!');
      router.push('/login');
    } catch (error) {
      // Handle specific error cases based on backend responses
      if (error.response?.status === 400) {
        setErrors({ email: error.response.data.message || 'User already exists' });
        toast.error(error.response.data.message || 'User already exists');
      } else {
        setErrors({ auth: error.response?.data?.message || 'Registration failed' });
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Section */}
      <div className="lg:w-1/2 bg-gradient-to-b from-indigo-600 via-indigo-900 to-indigo-900  p-8 lg:p-12 flex flex-col lg:min-h-screen relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-800 to-blue-600 opacity-50" />
        
        <div className="relative z-10">
          <div className="mb-12">
            <Image
              src="/Screenshot_2025-02-11_080236-removebg-preview.png"
              alt="Clinic Logo"
              width={200}
              height={100}
              style={{
                maxWidth: "85%",
                height: "auto",
                objectFit: "contain"
              }}
              className="drop-shadow-xl filter brightness-110"
            />
          </div>
          
          <div className="text-white space-y-6 max-w-lg mt-auto">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Join Our Healthcare Platform
            </h1>
            <p className="text-blue-100 text-lg lg:text-xl font-light leading-relaxed">
              Create your account to access the clinic management system and start managing your practice efficiently.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section with Form */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <UserPlus className="h-12 w-12 text-blue-700" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Create Account</h2>
            <p className="mt-3 text-base text-gray-600">
              Register for clinic management access
            </p>
          </div>

          {errors.auth && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600">{errors.auth}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-hover:text-blue-700 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  name="name"
                  className={`block w-full pl-10 pr-3 py-3.5 border ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-700'
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200`}
                  placeholder="Full Name"
                  onChange={handleChange}
                  value={formData.name}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-hover:text-blue-700 transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  name="email"
                  className={`block w-full pl-10 pr-3 py-3.5 border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-700'
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200`}
                  placeholder="Email Address"
                  onChange={handleChange}
                  value={formData.email}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-blue-700 transition-colors duration-200" />
                </div>
                <input
                  type="password"
                  name="password"
                  className={`block w-full pl-10 pr-3 py-3.5 border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-700'
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200`}
                  placeholder="Password"
                  onChange={handleChange}
                  value={formData.password}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white 
                ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition-all duration-200 shadow-md hover:shadow-lg`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-blue-700 hover:text-blue-800 transition-colors duration-200">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}