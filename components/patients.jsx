import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Bell, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 5;

const sortByDate = (a, b, order) => {
  const dateA = new Date(a.createdAt);
  const dateB = new Date(b.createdAt);
  return order === 'asc' ? dateA - dateB : dateB - dateA;
};

// Mobile Patient Card Component
const PatientCard = ({ patient, formatDate }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-medium text-gray-900">{patient.name}</h3>
        {patient.referredBy && (
          <p className="text-sm text-gray-500">Ref: {patient.referredBy}</p>
        )}
      </div>
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
        Active
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
      <div>
        <p className="text-gray-500">Location</p>
        <p className="text-gray-900">{patient.location}</p>
      </div>
      <div>
        <p className="text-gray-500">Contact</p>
        <p className="text-gray-900">{patient.phone}</p>
      </div>
      <div>
        <p className="text-gray-500">Created Date</p>
        <p className="text-gray-900">{formatDate(patient.createdAt)}</p>
      </div>
    </div>
    <div>
      <p className="text-gray-500 mb-2">Medical History</p>
      <div className="flex flex-wrap gap-1">
        {patient.medicalHistory.map((condition, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
          >
            <History className="w-3 h-3 mr-1" />
            {condition}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch('http://128.199.27.140:5000/patients',{
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);
const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  // Updated sort function
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      if (sortField === 'createdAt') {
        return sortByDate(a, b, sortOrder);
      }
      
      const valueA = String(a[sortField]).toLowerCase();
      const valueB = String(b[sortField]).toLowerCase();
      
      if (sortOrder === 'asc') {
        return valueA.localeCompare(valueB);
      }
      return valueB.localeCompare(valueA);
    });
  }, [filteredPatients, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedPatients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPatients = sortedPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle sorting
  const handleSort = useCallback((field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="p-4 md:p-6 flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Responsive Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Patient Management</h1>
            <div className="text-sm text-gray-500 mt-1">Dashboard / Patients</div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-[300px] border-gray-200"
              />
            </div>
            <div className="flex items-center gap-4 self-end md:self-auto">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5 text-gray-500" />
              </Button>
              <Avatar className="h-8 w-8 bg-blue-100">
                <span className="text-blue-600">JD</span>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Responsive Filters Section */}
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="ml-auto">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full md:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <PatientTable
            patients={paginatedPatients}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {paginatedPatients.map((patient) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              formatDate={(dateString) => new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            />
          ))}
        </div>

        {/* Responsive Pagination */}
        <div className="mt-4">
          <ResponsivePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {showAddModal && (
        <ResponsiveAddPatientModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newPatient) => {
            setPatients((prev) => [...prev, newPatient]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

// Responsive Pagination Component
const ResponsivePagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="px-4 md:px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-500 text-center md:text-left">
        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE)} of {totalPages * ITEMS_PER_PAGE} patients
      </div>
      <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden md:inline ml-1">Previous</span>
        </Button>
        
        {totalPages <= 5 ? (
          [...Array(totalPages)].map((_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))
        ) : (
          <>
            {currentPage > 2 && <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>1</Button>}
            {currentPage > 3 && <span className="px-2">...</span>}
            
            {[...Array(3)].map((_, index) => {
              const pageNumber = Math.min(Math.max(currentPage - 1 + index, 1), totalPages);
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            {currentPage < totalPages - 2 && <span className="px-2">...</span>}
            {currentPage < totalPages - 1 && (
              <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)}>
                {totalPages}
              </Button>
            )}
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="hidden md:inline mr-1">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
const PatientTable = ({ patients, sortField, sortOrder, onSort }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => onSort('name')}>
                Patient Name {renderSortIcon('name')}
              </th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => onSort('location')}>
                Location {renderSortIcon('location')}
              </th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => onSort('phone')}>
                Contact {renderSortIcon('phone')}
              </th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Medical History</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => onSort('createdAt')}>
                Created Date {renderSortIcon('createdAt')}
              </th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{patient.name}</div>
                  {patient.referredBy && (
                    <div className="text-sm text-gray-500">Ref: {patient.referredBy}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">{patient.location}</td>
                <td className="px-6 py-4 text-gray-600">{patient.phone}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {patient.medicalHistory.map((condition, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        <History className="w-3 h-3 mr-1" />
                        {condition}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {formatDate(patient.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    Active
                  </span>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE)} of {totalPages * ITEMS_PER_PAGE} patients
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index + 1}
            variant={currentPage === index + 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
const AddPatientModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [medicalHistory, setMedicalHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPatient = { name, location, phone, medicalHistory };
    try {
      const response = await fetch('https://clinic-backend-f42a.onrender.com/patients', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPatient),
      });
      if (!response.ok) throw new Error('Failed to add patient');
      const data = await response.json();
      onSuccess(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Add Patient</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              placeholder="Medical History (comma separated)"
              value={medicalHistory.join(',')}
              onChange={(e) => setMedicalHistory(e.target.value.split(','))}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 text-white">
              Add Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Responsive Add Patient Modal
const ResponsiveAddPatientModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [medicalHistory, setMedicalHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPatient = { name, location, phone, medicalHistory };
    try {
      const response = await fetch('http://128.199.27.140:5000/patients', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPatient),
      });
      if (!response.ok) throw new Error('Failed to add patient');
      const data = await response.json();
      onSuccess(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Add Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            placeholder="Medical History (comma separated)"
            value={medicalHistory.join(',')}
            onChange={(e) => setMedicalHistory(e.target.value.split(','))}
          />
          <div className="flex flex-col md:flex-row justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="w-full md:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 text-white w-full md:w-auto">
              Add Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};