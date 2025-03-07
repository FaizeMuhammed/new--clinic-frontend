import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Calendar, Users, Clock, X, Edit, ChevronRight,  ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EditDoctorModal from './editdoctormodel'; // Import the edit modal
import AddDoctorModal from './adddoctormodel'; // Import the add modal

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDoctorId, setEditDoctorId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('https://api.nexcard.co.in/doctors',{
        credentials: 'include'
      });
      const data = await response.json();
      setDoctors(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const handleEditDoctor = (doctorId) => {
    setEditDoctorId(doctorId);
    setShowEditModal(true);
  };

  const handleSaveDoctor = (updatedDoctor) => {
    setDoctors((prev) =>
      prev.map((doc) => (doc._id === updatedDoctor._id ? updatedDoctor : doc))
    );
    setShowEditModal(false);
  };

  const handleAddDoctor = (newDoctor) => {
    setDoctors((prev) => [...prev, newDoctor]);
    setShowAddModal(false);
  };
  const sortedDoctors = [...doctors].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'specialty':
        return a.specialty.localeCompare(b.specialty);
      case 'experience':
        return b.yearsOfExperience - a.yearsOfExperience;
      default:
        return 0;
    }
  });
  const getRandomColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    return colors[name.length % colors.length];
  };

  const filteredDoctors = sortedDoctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatAvailability = (availability) => {
    return Object.entries(availability).map(([day, slots]) => ({
      day,
      slots: slots.join(', ')
    }));
  };
  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Doctors Management
            </h1>
            <p className="text-slate-600 mt-1">Manage your clinic's medical staff</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="gap-2 bg-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Doctor
          </Button>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors..."
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('specialty')}>Specialty</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('experience')}>Experience</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card 
              key={doctor._id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedDoctor(doctor)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl ${getRandomColor(doctor.name)} flex items-center justify-center text-white text-lg font-semibold`}>
                    {getInitials(doctor.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">{doctor.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {doctor.specialty}
                    </Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Doctor Details Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl ${getRandomColor(selectedDoctor.name)} flex items-center justify-center text-white text-xl font-semibold`}>
                    {getInitials(selectedDoctor.name)}
                  </div>
                  <div>
                    <CardTitle>{selectedDoctor.name}</CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {selectedDoctor.specialty}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedDoctor(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Availability
                  </h3>
                  <div className="space-y-2">
                    {formatAvailability(selectedDoctor.availability).map(({ day, slots }) => (
                      <div key={day} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-700">{day}</span>
                        <span className="text-slate-600 text-sm">{slots}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>{selectedDoctor.appointmentsPerHour} appointments/hour</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span>{selectedDoctor.yearsOfExperience} years experience</span>
                  </div>
                </div>

                <Button 
                  className="w-full gap-2"
                  onClick={() => handleEditDoctor(selectedDoctor._id)}
                >
                  <Edit className="w-4 h-4" />
                  Edit Details
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Doctor Modal */}
        {showEditModal && (
          <EditDoctorModal
            doctorId={editDoctorId}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveDoctor}
            onClick={() => setSelectedDoctor(null)}
          />
        )}

        {/* Add Doctor Modal */}
        {showAddModal && (
          <AddDoctorModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddDoctor}
          />
        )}
      </div>
    </div>
  );
};

export default Doctors;