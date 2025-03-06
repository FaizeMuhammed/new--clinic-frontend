// service/patientapi.js

const API_BASE_URL = 'http://128.199.27.140:5000/patients';

export const fetchPatients = async () => {
  try {
    const response = await fetch(API_BASE_URL,{
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch patients');
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addPatient = async (patientData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) throw new Error('Failed to add patient');
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};