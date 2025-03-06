'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parse } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Users, RotateCw } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import DailyReport from './dailyreport';

export const Docanalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());

  const COLORS = ['#818cf8', '#34d399', '#f472b6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Format the date to match your API format: dd/MM/yyyy
        const selectedDate = format(date, 'dd/MM/yyyy');
        
        // Fetch data with error handling
        const fetchWithErrorHandling = async (url) => {
          try {
            const response = await axios.get(url);
            return response.data;
          } catch (err) {
            console.error(`Error fetching from ${url}:`, err);
            throw new Error(`Failed to fetch from ${url}: ${err.message}`);
          }
        };

        // Use Promise.all to fetch data in parallel
        const [doctors, appointments] = await Promise.all([
          fetchWithErrorHandling('http://128.199.27.140:5000/doctors'),
          fetchWithErrorHandling('http://128.199.27.140:5000/appointments')
        ]);

        // Validate the data
        if (!Array.isArray(doctors) || !Array.isArray(appointments)) {
          throw new Error('Invalid data format received from API');
        }

        // Process individual doctor data
        const processedData = doctors.map(doctor => {
          // Check if doctorId can be a nested object or a string
          const doctorId = doctor._id;
          
          // Filter appointments for this doctor and the selected date
          const doctorAppointments = appointments.filter(app => {
            const appDoctorId = typeof app.doctorId === 'object' ? app.doctorId._id : app.doctorId;
            return appDoctorId === doctorId && app.date === selectedDate;
          });

          const stats = {
            newPatient: doctorAppointments.filter(app => app.type === 'New Patient').length,
            followup: doctorAppointments.filter(app => app.type === 'Follow-up').length,
            revisit: doctorAppointments.filter(app => app.type === 'Revisit').length,
          };

          return {
            id: doctorId,
            _id: doctorId, // Add _id to match the format your DailyReport expects
            name: doctor.name,
            specialty: doctor.specialty,
            total: doctorAppointments.length,
            stats,
            chartData: [
              { name: 'New', value: stats.newPatient },
              { name: 'Follow-up', value: stats.followup },
              { name: 'Revisit', value: stats.revisit }
            ]
          };
        });

        // Calculate summary
        const summary = {
          totalAppointments: processedData.reduce((sum, doc) => sum + doc.total, 0),
          newPatients: processedData.reduce((sum, doc) => sum + doc.stats.newPatient, 0),
          followups: processedData.reduce((sum, doc) => sum + doc.stats.followup, 0),
          revisits: processedData.reduce((sum, doc) => sum + doc.stats.revisit, 0),
          date: selectedDate,
          formattedDate: format(date, "MMMM d, yyyy")
        };

        setAnalyticsData(processedData);
        setSummaryData(summary);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(`Failed to fetch data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const handleGenerateReport = () => {
    // Make sure we have data before opening the report
    if (summaryData) {
      setIsReportOpen(true);
    } else {
      setError('No data available to generate report');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center h-screen">
        <RotateCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex-1">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => { setError(null); setLoading(true); }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Daily Analytics - {format(date, "MMMM d, yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleGenerateReport}
          >
            <FileText className="h-4 w-4" />
            Daily Report
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900">
                <CalendarIcon className="h-4 w-4" />
                {format(date, "MMMM d, yyyy")}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) setDate(newDate);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-100 dark:bg-gray-950 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
                <Users className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                {summaryData.totalAppointments}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-100 dark:bg-gray-950 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New</p>
                <div className="h-4 w-4 rounded-full bg-[#818cf8]" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                {summaryData.newPatients}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-100 dark:bg-gray-950 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Follow-up</p>
                <div className="h-4 w-4 rounded-full bg-[#34d399]" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                {summaryData.followups}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-100 dark:bg-gray-950 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revisit</p>
                <div className="h-4 w-4 rounded-full bg-[#f472b6]" />
              </div>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                {summaryData.revisits}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Doctor Cards Grid */}
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData.length > 0 ? (
            analyticsData.map((doctor) => (
              <Card key={doctor.id} className="bg-blue-50 dark:bg-gray-950 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {doctor.specialty}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {doctor.total}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-[#818cf8]">
                        {doctor.stats.newPatient}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">New</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-[#34d399]">
                        {doctor.stats.followup}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Follow-up</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-[#f472b6]">
                        {doctor.stats.revisit}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Revisit</p>
                    </div>
                  </div>

                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={doctor.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={35}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {doctor.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No appointments found for this date</p>
            </div>
          )}
        </div>
      </ScrollArea>
      {/* Daily Report Modal */}
      {isReportOpen && (
        <DailyReport
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          currentDate={date}
          analyticsData={analyticsData}
          summaryData={summaryData}
        />
      )}
    </div>
  );
};