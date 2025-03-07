'use client'
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Clock, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EditDoctorModal = ({ doctorId, onClose, onSave, onDelete,onClick }) => {
  const [doctor, setDoctor] = useState({
    name: '',
    specialty: '',
    availability: {},
    appointmentsPerHour: 0,
    yearsOfExperience: 0,
    educationCertifications: ''
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await fetch(`https://api.nexcard.co.in/doctors/${doctorId}`,{
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch doctor details');
      const data = await response.json();
      setDoctor(data);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to fetch doctor details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const addTimeSlot = (day) => {
    setDoctor((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: [...(prev.availability[day] || []), "09:00"]
      }
    }));
  };

  const removeTimeSlot = (day, index) => {
    setDoctor((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].filter((_, i) => i !== index)
      }
    }));
  };

  const updateTimeSlot = (day, index, value) => {
    setDoctor((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].map((slot, i) => 
          i === index ? value : slot
        )
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://api.nexcard.co.in/doctors/${doctorId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctor),
      });
      if (!response.ok) throw new Error('Failed to update doctor details');
      const data = await response.json();
      toast.success('Doctor details updated successfully!');
      onSave(data);
      onClose();
      onClick()
    } catch (error) {
      toast.error(error.message || 'Failed to update doctor details');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://api.nexcard.co.in/doctors/${doctorId}`, {
        credentials: 'include',
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete doctor');
      toast.success('Doctor deleted successfully');
      onDelete(doctorId);
      onClose();
      onClick()
    } catch (error) {
      toast.error(error.message || 'Failed to delete doctor');
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <Card className="w-24 h-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white">{doctor.name}</h2>
              <Badge variant="secondary" className="mt-2">
                {doctor.specialty}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                <Input
                  name="name"
                  value={doctor.name}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <Select
                  value={doctor.specialty}
                  onValueChange={(value) => setDoctor((prev) => ({ ...prev, specialty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 
                      'Oncology', 'Psychiatry', 'General Medicine'].map(specialty => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Weekly Availability</h3>
              </div>
              {weekDays.map((day) => (
                <div key={day} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{day}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(day)}
                      className="text-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Time
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {doctor.availability[day]?.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Select
                          value={slot}
                          onValueChange={(value) => updateTimeSlot(day, index, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeSlot(day, index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Appointments/Hour
                </label>
                <Input
                  type="number"
                  name="appointmentsPerHour"
                  value={doctor.appointmentsPerHour}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Years of Experience
                </label>
                <Input
                  type="number"
                  name="yearsOfExperience"
                  value={doctor.yearsOfExperience}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Education
                </label>
                <Input
                  name="educationCertifications"
                  value={doctor.educationCertifications}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Doctor
              </Button>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the doctor's
              profile and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditDoctorModal;
