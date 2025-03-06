'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import { fetchDoctors, createAppointment } from '../app/services/api';

const AddAppointmentModal = ({ onClose, onAppointmentAdded }) => {
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    patientName: '',
    phone: '',
    location: '',
    referredBy: '',
    type: 'New Patient', // Default value
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    fetchDoctorsData();
  }, []);

  const fetchDoctorsData = async () => {
    try {
      const data = await fetchDoctors();
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    }
  };

  const getNext10Dates = (availableDays) => {
    const dates = [];
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    while (dates.length < 10) {
      const dayName = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        timeZone: 'Asia/Kolkata'
      });
      
      if (availableDays.includes(dayName)) {
        const formattedDate = currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'Asia/Kolkata'
        });
        
        dates.push({
          date: formattedDate,
          day: dayName
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const handleDoctorSelect = (doctorId) => {
    const doctor = doctors.find(doc => doc._id === doctorId);
    setSelectedDoctor(doctor);
    setFormData(prev => ({
      ...prev,
      doctorId,
      date: '',
      time: ''
    }));

    if (doctor?.availability) {
      const availableDays = Object.keys(doctor.availability)
        .filter(day => doctor.availability[day].length > 0);
      const nextDates = getNext10Dates(availableDays);
      setAvailableDates(nextDates);
    } else {
      setAvailableDates([]);
    }
    setAvailableTimes([]);
  };

  const handleDateSelect = (dateInfo) => {
    setFormData(prev => ({
      ...prev,
      date: dateInfo,
      time: ''
    }));

    if (selectedDoctor?.availability && selectedDoctor.availability[dateInfo.day]) {
      const slots = [...selectedDoctor.availability[dateInfo.day]].sort((a, b) => {
        const timeA = new Date(`2000/01/01 ${a}`).getTime();
        const timeB = new Date(`2000/01/01 ${b}`).getTime();
        return timeA - timeB;
      });
      setAvailableTimes(slots);
    } else {
      setAvailableTimes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'doctorId') {
      handleDoctorSelect(value);
    } else if (name === 'phone') {
      const phoneNumber = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: phoneNumber }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentData = {
        ...formData,
        timezone: 'Asia/Kolkata',
        date: formData.date.date,
        day: formData.date.day,
        type: formData.type,
        
      };
      const patttientnamme=formData.patientName;

      const newAppointment = await createAppointment(appointmentData);
      
      toast.success('Appointment booked successfully!');
      
      // Call the callback with the new appointment
      if (onAppointmentAdded) {
        // Add the doctor object to the appointment for display purposes
        newAppointment.doctorId = selectedDoctor;
        onAppointmentAdded(newAppointment,patttientnamme);
      }
      
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold mb-3">Book Appointment</h2>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Form fields remain the same */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Referred By</label>
              <input
                type="text"
                name="referredBy"
                value={formData.referredBy}
                onChange={handleChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              required
            >
              <option value="">Choose a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          {selectedDoctor && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              Experience: {selectedDoctor.yearsOfExperience} years | 
              Qualifications: {selectedDoctor.educationCertifications}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
              required
            >
              <option value="New Patient">New Patient</option>
              <option value="Revisit">Revisit</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>

          {availableDates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Available Dates</label>
              <select
                value={formData.date ? `${formData.date.date}-${formData.date.day}` : ''}
                onChange={(e) => {
                  const [date, day] = e.target.value.split('-');
                  handleDateSelect({ date, day });
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                required
              >
                <option value="">Select date</option>
                {availableDates.map(({ date, day }) => (
                  <option key={date} value={`${date}-${day}`}>
                    {date} ({day})
                  </option>
                ))}
              </select>
            </div>
          )}

          {availableTimes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Time Slot</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                required
              >
                <option value="">Select time</option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-sm"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;