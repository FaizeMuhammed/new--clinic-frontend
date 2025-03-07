const API_BASE_URL = 'https://api.nexcard.co.in';

export const fetchDoctors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors`,{
        method:'GET',
        credentials:'include'
    });
    if (!response.ok) throw new Error('Failed to fetch doctors');
    return await response.json();
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export const fetchAppointments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`,{
        method:'GET',
        credentials: 'include'
  });
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create appointment');
    }
    const res=await response.json();
    console.log(res);
    
    return res
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (id, newStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) throw new Error('Failed to update status');
    return await response.json();
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};