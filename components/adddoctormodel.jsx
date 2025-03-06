import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AddDoctorModal = ({ onClose, onSave }) => {
  const [doctor, setDoctor] = useState({
    name: '',
    specialty: '',
    availability: new Map(),
    appointmentsPerHour: 0,
    yearsOfExperience: 0,
    educationCertifications: ''
  });

  const [timeSlot, setTimeSlot] = useState({
    day: '',
    from: '',
    to: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const formatTo12Hour = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}${ampm}`;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor((prev) => ({ ...prev, [name]: value }));
  };

  // Convert time string to hour number (e.g., "09:00" -> 9)
  const getHourFromTimeString = (timeString) => {
    return parseInt(timeString.split(':')[0]);
  };

  // Generate array of hours between start and end time
  const generateHourSlots = (fromTime, toTime) => {
    const [fromHours] = fromTime.split(':');
    const [toHours] = toTime.split(':');
    const startHour = parseInt(fromHours);
    const endHour = parseInt(toHours);
    const hours = [];
    
    for (let hour = startHour; hour <= endHour; hour++) {
      hours.push(formatTo12Hour(`${hour.toString().padStart(2, '0')}:00`));
    }
    
    return hours;
  };

  const addTimeSlot = () => {
    if (timeSlot.day && timeSlot.from && timeSlot.to) {
      const hourSlots = generateHourSlots(timeSlot.from, timeSlot.to);
      
      setDoctor(prev => {
        const newAvailability = new Map(prev.availability);
        const existingSlots = newAvailability.get(timeSlot.day) || [];
        newAvailability.set(timeSlot.day, [...new Set([...existingSlots, ...hourSlots])]);
        
        return {
          ...prev,
          availability: newAvailability
        };
      });
      
      setTimeSlot({ day: '', from: '', to: '' });
    } else {
      toast.error('Please fill all time slot fields');
    }
  };
  const removeTimeSlot = (day) => {
    setDoctor(prev => {
      const newAvailability = new Map(prev.availability);
      newAvailability.delete(day);
      return {
        ...prev,
        availability: newAvailability
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert Map to object for backend
      const availabilityObject = {};
      doctor.availability.forEach((value, key) => {
        availabilityObject[key] = value;
      });

      const doctorData = {
        ...doctor,
        availability: availabilityObject
      };

      const response = await fetch('http://128.199.27.140:5000/doctors', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });
      
      if (!response.ok) throw new Error('Failed to add doctor');
      const data = await response.json();
      toast.success('Doctor added successfully!');
      onSave(data);
      onClose();
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error(error.message || 'Failed to add doctor');
    }
  };

  // Format time slots for display
  const formatTimeSlots = (slots) => {
    if (!slots || slots.length === 0) return '';
    return `${slots[0]} - ${slots[slots.length - 1]}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Add New Doctor</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Previous form fields remain the same */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input
                type="text"
                name="name"
                value={doctor.name}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Specialty</label>
              <Select
                name="specialty"
                value={doctor.specialty}
                onValueChange={(value) => setDoctor((prev) => ({ ...prev, specialty: value }))}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Oncology">Oncology</SelectItem>
                  <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                  <SelectItem value="General Medicine">General Medicine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Appointments/Hour</label>
              <Input
                type="number"
                name="appointmentsPerHour"
                value={doctor.appointmentsPerHour}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Years of Experience</label>
              <Input
                type="number"
                name="yearsOfExperience"
                value={doctor.yearsOfExperience}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Education & Certifications</label>
              <Input
                type="text"
                name="educationCertifications"
                value={doctor.educationCertifications}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Availability</label>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <Select
                  value={timeSlot.day}
                  onValueChange={(value) => setTimeSlot(prev => ({ ...prev, day: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="time"
                  value={timeSlot.from}
                  onChange={(e) => setTimeSlot(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="From"
                  className="text-sm"
                />

                <Input
                  type="time"
                  value={timeSlot.to}
                  onChange={(e) => setTimeSlot(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="To"
                  className="text-sm"
                />

                <Button 
                  type="button"
                  onClick={addTimeSlot}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                {Array.from(doctor.availability.entries()).map(([day, slots]) => (
                  <div key={day} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">
                      {day}: {formatTimeSlots(slots)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeSlot(day)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {doctor.availability.size === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">No availability slots added</p>
                )}
              </div>
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDoctorModal;