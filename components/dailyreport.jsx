import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X } from 'lucide-react';
import { format, addDays, parse } from 'date-fns';
import axios from 'axios';

const DailyReport = ({ isOpen, onClose, currentDate, analyticsData, summaryData }) => {
  const [tomorrowData, setTomorrowData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTomorrowData = async () => {
      try {
        // Format tomorrow's date to match API format (dd/MM/yyyy)
        const tomorrow = format(addDays(currentDate, 1), 'dd/MM/yyyy');
        
        // Use the same URL structure as in Docanalytics component
        const appointmentsResponse = await axios.get('http://128.199.27.140:5000/appointments');
        const appointments = appointmentsResponse.data;

        if (!Array.isArray(appointments)) {
          throw new Error('Invalid data format received from API');
        }

        // Filter for tomorrow's appointments
        const tomorrowAppointments = appointments.filter(app => app.date === tomorrow);
        
        // Create a mapping of doctor IDs to appointment counts
        const doctorAppointments = {};
        tomorrowAppointments.forEach(app => {
          // Handle if doctorId is an object or string
          const doctorId = typeof app.doctorId === 'object' ? app.doctorId._id : app.doctorId;
          
          if (!doctorAppointments[doctorId]) {
            doctorAppointments[doctorId] = 0;
          }
          doctorAppointments[doctorId]++;
        });

        setTomorrowData(doctorAppointments);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tomorrow data:', error);
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchTomorrowData();
    }
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[500px] bg-white dark:bg-gray-950 relative max-h-[90vh] overflow-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader>
          <CardTitle className="text-lg">
            Daily Summary - {summaryData ? summaryData.formattedDate : format(currentDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Today's Summary */}
            {summaryData && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-xl font-bold">
                    {summaryData.totalAppointments}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">New</p>
                  <p className="text-xl font-bold text-[#818cf8]">
                    {summaryData.newPatients}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Follow-up</p>
                  <p className="text-xl font-bold text-[#34d399]">
                    {summaryData.followups}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revisit</p>
                  <p className="text-xl font-bold text-[#f472b6]">
                    {summaryData.revisits}
                  </p>
                </div>
              </div>
            )}

            {/* Doctor Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="text-right">Today</TableHead>
                  <TableHead className="text-right">Tomorrow</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell className="text-right">{doctor.total}</TableCell>
                    <TableCell className="text-right">
                      {loading ? '...' : (tomorrowData[doctor._id] || 0)}
                    </TableCell>
                  </TableRow>
                ))}
                {analyticsData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                      No appointments found for this date
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="pt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {format(addDays(currentDate, 1), 'MMMM d, yyyy')} scheduled appointments
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyReport;